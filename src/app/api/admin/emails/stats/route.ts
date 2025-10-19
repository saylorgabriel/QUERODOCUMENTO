import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getEmailStats } from '@/lib/email/email-service'

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

    // Get days parameter from query
    const { searchParams } = new URL(request.url)
    const daysParam = searchParams.get('days')
    const days = daysParam ? parseInt(daysParam, 10) : 7

    if (isNaN(days) || days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Parâmetro days deve estar entre 1 e 365' },
        { status: 400 }
      )
    }

    // Get email statistics
    const stats = await getEmailStats(days)

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Email stats error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}