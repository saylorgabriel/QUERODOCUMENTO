import { NextResponse } from 'next/server'
import { asaasService } from '@/lib/payment/asaas'
import { prisma } from '@/lib/prisma'
import { sendOrderStatusEmail } from '@/lib/email'

interface AsaasWebhookPayload {
  object: string
  id: string
  event: string
  payment?: {
    id: string
    customer: string
    billingType: string
    value: number
    netValue: number
    originalValue: number
    status: string
    description: string
    externalReference: string
    dueDate: string
    paidAt?: string
  }
}

export async function POST(request: Request) {
  try {
    // Verify the webhook is from ASAAS (in production, verify signature)
    const userAgent = request.headers.get('user-agent')
    if (!userAgent?.includes('ASAAS')) {
      console.warn('Webhook received from unverified source')
    }

    const body: AsaasWebhookPayload = await request.json()

    console.log('ASAAS Webhook received:', {
      event: body.event,
      paymentId: body.payment?.id,
      status: body.payment?.status,
      value: body.payment?.value
    })

    // Only process payment events
    if (body.object !== 'payment' || !body.payment) {
      return NextResponse.json({ received: true })
    }

    const payment = body.payment

    // Find the order by ASAAS payment ID
    const order = await prisma.order.findFirst({
      where: { asaasPaymentId: payment.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!order) {
      console.warn(`Order not found for ASAAS payment ID: ${payment.id}`)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Map ASAAS status to our internal status
    const statusMap: Record<string, { paymentStatus: string; orderStatus?: string }> = {
      'PENDING': { paymentStatus: 'PENDING' },
      'CONFIRMED': { paymentStatus: 'CONFIRMED', orderStatus: 'PROCESSING' },
      'RECEIVED': { paymentStatus: 'RECEIVED', orderStatus: 'PROCESSING' },
      'RECEIVED_IN_CASH': { paymentStatus: 'RECEIVED_IN_CASH', orderStatus: 'PROCESSING' },
      'OVERDUE': { paymentStatus: 'OVERDUE' },
      'REFUNDED': { paymentStatus: 'REFUNDED', orderStatus: 'CANCELLED' },
      'REFUND_REQUESTED': { paymentStatus: 'REFUND_REQUESTED' },
      'CHARGEBACK_REQUESTED': { paymentStatus: 'CHARGEBACK_REQUESTED' },
      'CHARGEBACK_DISPUTE': { paymentStatus: 'CHARGEBACK_DISPUTE' },
      'AWAITING_CHARGEBACK_REVERSAL': { paymentStatus: 'AWAITING_CHARGEBACK_REVERSAL' },
      'DUNNING_REQUESTED': { paymentStatus: 'DUNNING_REQUESTED' },
      'DUNNING_RECEIVED': { paymentStatus: 'DUNNING_RECEIVED' },
      'AWAITING_RISK_ANALYSIS': { paymentStatus: 'AWAITING_RISK_ANALYSIS' }
    }

    const newStatus = statusMap[payment.status]

    if (!newStatus) {
      console.warn(`Unknown payment status: ${payment.status}`)
      return NextResponse.json({ error: 'Unknown status' }, { status: 400 })
    }

    // Check if status has actually changed
    if (order.paymentStatus === newStatus.paymentStatus) {
      console.log('Payment status unchanged, skipping update')
      return NextResponse.json({ received: true })
    }

    const updateData: any = {
      paymentStatus: newStatus.paymentStatus,
      metadata: {
        ...(order.metadata as any || {}),
        lastWebhookEvent: {
          event: body.event,
          receivedAt: new Date().toISOString(),
          asaasStatus: payment.status
        }
      }
    }

    // Set paid date for confirmed payments
    if (['CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH'].includes(payment.status)) {
      updateData.paidAt = payment.paidAt ? new Date(payment.paidAt) : new Date()
    }

    // Update order status if specified
    if (newStatus.orderStatus) {
      updateData.status = newStatus.orderStatus
    }

    // Update the order
    await prisma.order.update({
      where: { id: order.id },
      data: updateData
    })

    // Create order history entry
    await prisma.orderHistory.create({
      data: {
        orderId: order.id,
        previousStatus: order.status,
        newStatus: newStatus.orderStatus || order.status,
        changedById: 'system', // System user for webhook updates
        notes: `Status atualizado via webhook ASAAS - Evento: ${body.event}`,
        metadata: {
          webhookEvent: body.event,
          asaasPaymentId: payment.id,
          asaasStatus: payment.status,
          paymentValue: payment.value
        }
      }
    })

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        action: 'PAYMENT_STATUS_UPDATED',
        resource: 'ORDER',
        resourceId: order.id,
        metadata: {
          previousStatus: order.paymentStatus,
          newStatus: newStatus.paymentStatus,
          asaasEvent: body.event,
          asaasPaymentId: payment.id,
          webhookReceivedAt: new Date().toISOString()
        }
      }
    })

    // Send email notification for important status changes
    if (['CONFIRMED', 'RECEIVED', 'RECEIVED_IN_CASH'].includes(payment.status)) {
      try {
        await sendOrderStatusEmail({
          to: order.user.email,
          userName: order.user.name || 'Cliente',
          orderNumber: order.orderNumber,
          status: 'PAID',
          statusMessage: 'Pagamento confirmado! Seu pedido está sendo processado.',
          orderUrl: `${process.env.NEXTAUTH_URL}/dashboard/orders/${order.id}`
        })

        console.log(`Payment confirmation email sent to: ${order.user.email}`)
      } catch (emailError) {
        console.error('Failed to send payment confirmation email:', emailError)
      }
    } else if (['REFUNDED', 'OVERDUE'].includes(payment.status)) {
      try {
        const statusMessage = payment.status === 'REFUNDED'
          ? 'Pagamento reembolsado.'
          : 'Pagamento em atraso.'

        await sendOrderStatusEmail({
          to: order.user.email,
          userName: order.user.name || 'Cliente',
          orderNumber: order.orderNumber,
          status: payment.status === 'REFUNDED' ? 'REFUNDED' : 'OVERDUE',
          statusMessage,
          orderUrl: `${process.env.NEXTAUTH_URL}/dashboard/orders/${order.id}`
        })

        console.log(`Payment status email sent to: ${order.user.email}`)
      } catch (emailError) {
        console.error('Failed to send payment status email:', emailError)
      }
    }

    console.log(`Order ${order.orderNumber} updated: ${order.paymentStatus} -> ${newStatus.paymentStatus}`)

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      previousStatus: order.paymentStatus,
      newStatus: newStatus.paymentStatus
    })
  } catch (error) {
    console.error('ASAAS Webhook error:', error)

    // Log the error
    await prisma.auditLog.create({
      data: {
        action: 'WEBHOOK_ERROR',
        resource: 'ASAAS_WEBHOOK',
        metadata: {
          error: (error as any).message,
          timestamp: new Date().toISOString()
        }
      }
    }).catch(e => console.error('Failed to log webhook error:', e))

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// GET method to verify webhook endpoint is working
export async function GET() {
  return NextResponse.json({
    service: 'ASAAS Webhook Endpoint',
    status: 'active',
    timestamp: new Date().toISOString()
  })
}