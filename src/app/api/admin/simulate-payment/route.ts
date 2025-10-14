import { NextRequest, NextResponse } from 'next/server'
import { getAsaasService } from '@/lib/payment/asaas'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/admin/simulate-payment
 * Simula o pagamento PIX no sandbox do ASAAS
 *
 * Body: { paymentId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json()

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // Verifica se está no ambiente sandbox
    if (process.env.ASAAS_ENVIRONMENT !== 'sandbox') {
      return NextResponse.json(
        { error: 'Payment simulation is only available in sandbox environment' },
        { status: 403 }
      )
    }

    // Busca o pedido no banco
    const order = await prisma.order.findFirst({
      where: { paymentId }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Simula o pagamento no ASAAS
    const asaas = getAsaasService()
    const payment = await asaas.simulatePixPayment(paymentId)

    console.log('✅ Payment simulated:', {
      paymentId,
      status: payment.status,
      orderId: order.id
    })

    return NextResponse.json({
      success: true,
      message: 'Payment simulated successfully',
      payment: {
        id: payment.id,
        status: payment.status,
        value: payment.value
      },
      order: {
        id: order.id,
        status: order.status
      },
      info: 'The webhook should process this payment automatically'
    })
  } catch (error) {
    console.error('Error simulating payment:', error)
    return NextResponse.json(
      {
        error: 'Failed to simulate payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
