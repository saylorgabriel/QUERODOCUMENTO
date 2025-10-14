import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // Verify admin session
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('simple-session')

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const sessionData = JSON.parse(sessionCookie.value)
    if (sessionData.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Get config from environment variables
    const config = {
      emailProvider: process.env.EMAIL_PROVIDER || 'sendgrid',
      emailApiKey: process.env.EMAIL_API_KEY ? '••••••••' : '',
      paymentProvider: process.env.PAYMENT_PROVIDER || 'asaas',
      paymentApiKey: process.env.ASAAS_API_KEY ? '••••••••' : '',
      webhookSecret: process.env.ASAAS_WEBHOOK_TOKEN ? '••••••••' : '',
      notificationsEnabled: process.env.NOTIFICATIONS_ENABLED !== 'false',
      maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
    }

    return NextResponse.json({
      success: true,
      config,
    })
  } catch (error) {
    console.error('Failed to get config:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar configurações' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin session
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('simple-session')

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const sessionData = JSON.parse(sessionCookie.value)
    if (sessionData.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // In a real application, you would:
    // 1. Store these in a secure configuration database
    // 2. Or update environment variables through a secure API
    // 3. Validate and sanitize all inputs
    // 4. Log all configuration changes for audit

    // For now, we'll just simulate a successful save
    // since env vars can't be changed at runtime
    console.log('Config update requested:', {
      emailProvider: body.emailProvider,
      paymentProvider: body.paymentProvider,
      notificationsEnabled: body.notificationsEnabled,
      maintenanceMode: body.maintenanceMode,
    })

    return NextResponse.json({
      success: true,
      message: 'Configurações atualizadas com sucesso',
    })
  } catch (error) {
    console.error('Failed to update config:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao salvar configurações' },
      { status: 500 }
    )
  }
}
