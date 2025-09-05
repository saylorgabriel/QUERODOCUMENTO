import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { storeResetToken, generateResetToken } from '@/lib/reset-tokens'
import { logAudit } from '@/lib/database'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      // Log failed reset attempt
      await logAudit({
        action: 'PASSWORD_RESET_FAILED',
        resource: 'AUTH',
        metadata: { email, reason: 'user_not_found' }
      })
      
      // For security, don't reveal if user exists or not
      return NextResponse.json({
        message: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha'
      })
    }

    // Generate reset token
    const resetToken = generateResetToken()
    const expires = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    // Store reset token in database
    await storeResetToken(email, resetToken, expires)

    // Log password reset request
    await logAudit({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      resource: 'AUTH',
      metadata: { email }
    })

    // Send password reset email
    const emailResult = await sendPasswordResetEmail({
      to: email,
      name: user.name || 'Usuário',
      resetToken
    })

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error)
      
      // Log email failure
      await logAudit({
        userId: user.id,
        action: 'EMAIL_FAILED',
        resource: 'AUTH',
        metadata: { email, error: emailResult.error }
      })
      
      // For development, still show the token if email fails
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          message: 'Erro ao enviar email, mas aqui está o token para desenvolvimento',
          resetToken,
          error: emailResult.error
        })
      }
      
      return NextResponse.json(
        { error: 'Erro ao enviar email. Tente novamente mais tarde.' },
        { status: 500 }
      )
    }

    console.log('Password reset email sent successfully to:', email)

    return NextResponse.json({
      message: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha',
      // For development, also include token
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    
    // Log system error
    await logAudit({
      action: 'FORGOT_PASSWORD_ERROR',
      resource: 'AUTH',
      metadata: { error: (error as Error).message }
    })
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}