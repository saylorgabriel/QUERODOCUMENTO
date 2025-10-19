import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { 
  cleanupExpiredFiles, 
  cleanupOrphanedFiles, 
  getCleanupStats 
} from '@/lib/file-cleanup'

// Helper function to get user from session
async function getUserFromSession(): Promise<{ id: string; role: string } | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('simple-session')
    
    if (!sessionCookie) {
      return null
    }

    const sessionData = JSON.parse(sessionCookie.value)
    
    // Check if session hasn't expired
    const expires = new Date(sessionData.expires)
    if (expires <= new Date()) {
      return null
    }

    return sessionData.user
  } catch (error) {
    console.error('Session validation error:', error)
    return null
  }
}

// Helper function to validate admin role
function isAdmin(user: { id: string; role: string } | null): boolean {
  return user?.role === 'ADMIN' || user?.role === 'SUPPORT'
}

// GET - Get cleanup statistics
export async function GET(request: NextRequest) {
  try {
    // Validate user session and admin role
    const user = await getUserFromSession()
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Acesso negado: permissões de administrador necessárias' },
        { status: 403 }
      )
    }

    const stats = await getCleanupStats()

    if (!stats) {
      return NextResponse.json(
        { error: 'Erro ao obter estatísticas de limpeza' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Cleanup stats error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Run cleanup operations
export async function POST(request: NextRequest) {
  try {
    // Validate user session and admin role
    const user = await getUserFromSession()
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Acesso negado: permissões de administrador necessárias' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { type = 'expired' } = body

    let result

    switch (type) {
      case 'expired':
        result = await cleanupExpiredFiles()
        break
      
      case 'orphaned':
        result = await cleanupOrphanedFiles()
        break
      
      case 'all':
        // Run both cleanup operations
        const expiredResult = await cleanupExpiredFiles()
        const orphanedResult = await cleanupOrphanedFiles()
        
        result = {
          success: expiredResult.success && orphanedResult.success,
          filesProcessed: expiredResult.filesProcessed + orphanedResult.filesProcessed,
          filesDeleted: expiredResult.filesDeleted + orphanedResult.filesDeleted,
          errors: [...expiredResult.errors, ...orphanedResult.errors],
          summary: `Expired: ${expiredResult.summary}; Orphaned: ${orphanedResult.summary}`,
          details: {
            expired: expiredResult,
            orphaned: orphanedResult
          }
        }
        break
      
      default:
        return NextResponse.json(
          { error: 'Tipo de limpeza inválido. Use: expired, orphaned, ou all' },
          { status: 400 }
        )
    }

    // Create audit log for manual cleanup
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'MANUAL_CLEANUP',
        resource: 'FILE_SYSTEM',
        resourceId: null,
        metadata: {
          cleanupType: type,
          result,
          triggeredBy: user.id
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Limpeza executada com sucesso' : 'Limpeza completada com erros',
      result
    })

  } catch (error) {
    console.error('Manual cleanup error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}