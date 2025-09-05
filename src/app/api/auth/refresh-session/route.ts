import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('simple-session')
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 401 })
    }

    const currentSession = JSON.parse(sessionCookie.value)
    
    // Check if session hasn't expired
    const expires = new Date(currentSession.expires)
    if (expires <= new Date()) {
      return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 })
    }

    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: currentSession.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Create updated session data
    const updatedSessionData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        cpf: user.cpf,
        cnpj: user.cnpj,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }

    // Update the session cookie
    cookieStore.set('simple-session', JSON.stringify(updatedSessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
    })

    console.log('Session refreshed for user:', user.email)

    return NextResponse.json({ 
      success: true,
      user: updatedSessionData.user,
      message: 'Sessão atualizada com sucesso'
    })
  } catch (error) {
    console.error('Session refresh error:', error)
    
    return NextResponse.json(
      { error: 'Erro ao atualizar sessão' },
      { status: 500 }
    )
  }
}