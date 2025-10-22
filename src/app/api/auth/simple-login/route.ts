import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { rateLimit, getClientIp, createRateLimitResponse, RateLimits, isRateLimitEnabled } from '@/lib/rate-limiter'

export async function POST(request: Request) {
  try {
    // Rate limiting
    if (isRateLimitEnabled()) {
      const clientIp = getClientIp(request)
      const rateLimitResult = await rateLimit(
        `login:${clientIp}`,
        RateLimits.LOGIN.limit,
        RateLimits.LOGIN.windowMs
      )

      if (!rateLimitResult.success) {
        // Log rate limit violation
        await prisma.auditLog.create({
          data: {
            action: 'RATE_LIMIT_EXCEEDED',
            resource: 'AUTH_LOGIN',
            metadata: {
              ip: clientIp,
              limit: rateLimitResult.limit,
              resetAt: rateLimitResult.resetAt.toISOString()
            }
          }
        }).catch(err => console.error('Failed to log rate limit:', err))

        return createRateLimitResponse(
          rateLimitResult,
          'Muitas tentativas de login. Por favor, aguarde alguns minutos.'
        )
      }
    }

    const body = await request.json()
    const { email, password } = body

    console.log('Login attempt:', { email })

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        phone: true,
        cpf: true,
        cnpj: true,
        role: true,
      },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)
    
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Create session data for cookie
    const sessionData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        cpf: user.cpf,
        cnpj: user.cnpj,
        role: user.role,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }

    const cookieStore = await cookies()
    cookieStore.set('simple-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
    })

    console.log('Login successful for:', email)

    return NextResponse.json({ 
      success: true, 
      user: sessionData.user,
      message: 'Login realizado com sucesso'
    })
  } catch (error) {
    console.error('Login error:', error)
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}