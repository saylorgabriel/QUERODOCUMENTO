import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { validateResetToken, clearResetToken } from '@/lib/reset-tokens'
import { logAudit } from '@/lib/database'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, token, newPassword } = body

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Validate token
    const isValidToken = await validateResetToken(email, token)
    if (!isValidToken) {
      // Log invalid token attempt
      await logAudit({
        action: 'INVALID_RESET_TOKEN',
        resource: 'AUTH',
        metadata: { email, token: token.substring(0, 8) + '...' }
      })
      
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      // Log user not found
      await logAudit({
        action: 'RESET_USER_NOT_FOUND',
        resource: 'AUTH',
        metadata: { email }
      })
      
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update user password
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Erro ao atualizar senha' },
        { status: 500 }
      )
    }

    // Mark token as used
    await clearResetToken(email, token)

    // Log successful password reset
    await logAudit({
      userId: user.id,
      action: 'PASSWORD_RESET_SUCCESS',
      resource: 'AUTH',
      metadata: { email }
    })

    console.log('Password reset successful for:', email)

    return NextResponse.json({
      message: 'Senha redefinida com sucesso'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    
    // Log system error
    await logAudit({
      action: 'RESET_PASSWORD_ERROR',
      resource: 'AUTH',
      metadata: { error: (error as Error).message }
    })
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}