import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import crypto from 'crypto'

// Helper function to get user from session
async function getUserFromSession(): Promise<{ id: string; role: string } | null> {
  try {
    const cookieStore = cookies()
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

// Helper function to validate file ownership or admin access
async function validateFileAccess(
  orderId: string,
  documentId: string,
  user: { id: string; role: string } | null,
  token?: string
): Promise<{ hasAccess: boolean; document?: any; order?: any; error?: string }> {
  
  if (!user) {
    return { hasAccess: false, error: 'Usuário não autenticado' }
  }

  // Find the document
  const document = await prisma.orderDocument.findFirst({
    where: {
      id: documentId,
      orderId,
      isActive: true
    },
    include: {
      order: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    }
  })

  if (!document) {
    return { hasAccess: false, error: 'Documento não encontrado' }
  }

  // Check if document has expired
  if (document.expiresAt && document.expiresAt <= new Date()) {
    return { hasAccess: false, error: 'Documento expirado' }
  }

  // Admin users have access to all documents
  if (isAdmin(user)) {
    return { hasAccess: true, document, order: document.order }
  }

  // Regular users can only access their own order documents
  if (document.order.userId !== user.id) {
    return { hasAccess: false, error: 'Acesso negado: documento não pertence ao usuário' }
  }

  // Check payment status - user can only download if payment is completed
  if (document.order.paymentStatus !== 'COMPLETED') {
    return { 
      hasAccess: false, 
      error: 'Pagamento não confirmado. Conclua o pagamento para acessar o documento.',
      paymentRequired: true 
    }
  }

  // Validate secure token if provided
  if (token && document.downloadToken !== token) {
    return { hasAccess: false, error: 'Token de download inválido' }
  }

  return { hasAccess: true, document, order: document.order }
}

// Helper function to verify file integrity
async function verifyFileIntegrity(filePath: string, expectedChecksum?: string): Promise<boolean> {
  if (!expectedChecksum) return true
  
  try {
    const fileBuffer = await readFile(filePath)
    const actualChecksum = crypto.createHash('sha256').update(fileBuffer).digest('hex')
    return actualChecksum === expectedChecksum
  } catch (error) {
    console.error('File integrity check failed:', error)
    return false
  }
}

// GET - Download file with security checks
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')
    const token = searchParams.get('token')
    const preview = searchParams.get('preview') === 'true'

    // Validate parameters
    if (!orderId || orderId.length < 10) {
      return NextResponse.json(
        { error: 'ID do pedido inválido' },
        { status: 400 }
      )
    }

    if (!documentId) {
      return NextResponse.json(
        { error: 'ID do documento não fornecido' },
        { status: 400 }
      )
    }

    // Get user session
    const user = await getUserFromSession()
    
    // Validate file access
    const accessValidation = await validateFileAccess(orderId, documentId, user, token || undefined)
    if (!accessValidation.hasAccess) {
      return NextResponse.json(
        { error: accessValidation.error },
        { status: 403 }
      )
    }

    const { document, order } = accessValidation

    // Build file path
    const filePath = join(process.cwd(), 'public', document.filePath)

    // Check if file exists on disk
    if (!existsSync(filePath)) {
      // Log missing file error
      await prisma.downloadLog.create({
        data: {
          documentId: document.id,
          userId: user?.id,
          success: false,
          errorMessage: 'Arquivo não encontrado no sistema de arquivos',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      return NextResponse.json(
        { error: 'Arquivo não encontrado no servidor' },
        { status: 404 }
      )
    }

    // Verify file integrity
    const isIntegrityValid = await verifyFileIntegrity(filePath, document.checksum)
    if (!isIntegrityValid) {
      // Log integrity error
      await prisma.downloadLog.create({
        data: {
          documentId: document.id,
          userId: user?.id,
          success: false,
          errorMessage: 'Falha na verificação de integridade do arquivo',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      return NextResponse.json(
        { error: 'Arquivo corrompido. Entre em contato com o suporte.' },
        { status: 500 }
      )
    }

    try {
      // Read file
      const fileBuffer = await readFile(filePath)

      // Update download statistics
      await prisma.orderDocument.update({
        where: { id: document.id },
        data: {
          downloadCount: { increment: 1 },
          lastDownloaded: new Date()
        }
      })

      // Log successful download
      await prisma.downloadLog.create({
        data: {
          documentId: document.id,
          userId: user?.id,
          success: true,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user?.id,
          action: 'FILE_DOWNLOAD',
          resource: 'ORDER_DOCUMENT',
          resourceId: document.id,
          metadata: {
            orderId,
            filename: document.filename,
            documentType: document.documentType,
            preview
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      // Prepare response headers
      const headers = new Headers()
      headers.set('Content-Type', document.mimeType || 'application/octet-stream')
      headers.set('Content-Length', document.fileSize.toString())
      
      if (preview) {
        // For preview, set inline disposition
        headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(document.filename)}"`)
        headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
      } else {
        // For download, set attachment disposition
        headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(document.filename)}"`)
        headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
      }

      headers.set('Expires', '0')
      headers.set('Pragma', 'no-cache')
      
      // Security headers
      headers.set('X-Content-Type-Options', 'nosniff')
      headers.set('X-Frame-Options', 'DENY')
      headers.set('X-XSS-Protection', '1; mode=block')

      return new NextResponse(fileBuffer, {
        status: 200,
        headers
      })

    } catch (fileReadError) {
      console.error('File read error:', fileReadError)
      
      // Log file read error
      await prisma.downloadLog.create({
        data: {
          documentId: document.id,
          userId: user?.id,
          success: false,
          errorMessage: 'Erro ao ler arquivo do sistema de arquivos',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      return NextResponse.json(
        { error: 'Erro ao ler arquivo' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('File download error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET with different route for public downloads with tokens
// This would be accessed via /api/orders/[id]/download/[documentId]
export async function HEAD(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')

    if (!orderId || !documentId) {
      return new NextResponse(null, { status: 400 })
    }

    // Get user session
    const user = await getUserFromSession()
    
    // Validate file access
    const accessValidation = await validateFileAccess(orderId, documentId, user)
    if (!accessValidation.hasAccess) {
      return new NextResponse(null, { status: 403 })
    }

    const { document } = accessValidation

    // Return file headers for HEAD request
    const headers = new Headers()
    headers.set('Content-Type', document.mimeType || 'application/octet-stream')
    headers.set('Content-Length', document.fileSize.toString())
    headers.set('Accept-Ranges', 'bytes')

    return new NextResponse(null, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('File head request error:', error)
    return new NextResponse(null, { status: 500 })
  }
}