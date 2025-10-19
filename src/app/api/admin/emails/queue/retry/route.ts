import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { retryFailedEmails } from '@/lib/email-queue'

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

    // Parse request body
    const body = await request.json()
    const { emailIds } = body

    // Validate emailIds if provided
    if (emailIds && (!Array.isArray(emailIds) || !emailIds.every(id => typeof id === 'string'))) {
      return NextResponse.json(
        { error: 'emailIds deve ser um array de strings' },
        { status: 400 }
      )
    }

    // Retry failed emails
    const result = await retryFailedEmails(emailIds)

    return NextResponse.json({
      success: true,
      queued: result.queued,
      message: `${result.queued} emails requeued successfully`
    })

  } catch (error) {
    console.error('Retry emails error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}