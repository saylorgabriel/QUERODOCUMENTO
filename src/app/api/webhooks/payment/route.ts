import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPaymentConfirmationEmail } from '@/lib/email'
import { getEmailTemplate } from '@/lib/email/templates'
import { emailService } from '@/lib/email/email-service'

// Helper function to verify webhook signature (implement based on your payment provider)
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  // This is a simplified version - implement proper signature verification based on your payment provider
  // For ASAAS, Pagar.me, etc., they usually provide HMAC-SHA256 signature verification
  // Example for basic implementation:
  const crypto = require('crypto')
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return signature === expectedSignature
}

// Helper function to map payment provider status to our internal status
function mapPaymentStatus(providerStatus: string, provider: 'ASAAS' | 'PAGARME' | 'OTHER'): string {
  const statusMap: Record<string, Record<string, string>> = {
    ASAAS: {
      'RECEIVED': 'COMPLETED',
      'CONFIRMED': 'COMPLETED', 
      'PENDING': 'PENDING',
      'OVERDUE': 'PENDING',
      'CANCELLED': 'FAILED',
      'REFUNDED': 'REFUNDED'
    },
    PAGARME: {
      'paid': 'COMPLETED',
      'pending_payment': 'PENDING',
      'refused': 'FAILED',
      'refunded': 'REFUNDED',
      'canceled': 'FAILED'
    },
    OTHER: {
      'paid': 'COMPLETED',
      'pending': 'PENDING',
      'failed': 'FAILED',
      'cancelled': 'FAILED',
      'refunded': 'REFUNDED'
    }
  }

  return statusMap[provider]?.[providerStatus] || 'PENDING'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-webhook-signature') || request.headers.get('x-signature')
    
    // Verify webhook signature (optional but recommended for security)
    if (process.env.PAYMENT_WEBHOOK_SECRET && signature) {
      const isValidSignature = verifyWebhookSignature(body, signature, process.env.PAYMENT_WEBHOOK_SECRET)
      if (!isValidSignature) {
        console.error('Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const webhookData = JSON.parse(body)
    console.log('Payment webhook received:', webhookData)

    // Extract relevant information from webhook
    // This structure may vary based on your payment provider
    const {
      event, // e.g., 'payment.paid', 'payment.failed', etc.
      payment,
      order_id: externalOrderId,
      transaction_id: transactionId,
      status: paymentStatus,
      amount,
      payment_method: paymentMethod,
      metadata
    } = webhookData

    // Find the order by external payment ID or order number
    let order = await prisma.order.findFirst({
      where: {
        OR: [
          { paymentId: externalOrderId },
          { paymentId: transactionId },
          { orderNumber: metadata?.orderNumber || '' },
          // Also support finding by order ID for mock payments
          { id: externalOrderId }
        ]
      },
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
      console.error('Order not found for payment webhook:', { externalOrderId, transactionId, orderNumber: metadata?.orderNumber })
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Map provider status to our internal status
    const provider = (process.env.PAYMENT_PROVIDER?.toUpperCase() || 'OTHER') as 'ASAAS' | 'PAGARME' | 'OTHER'
    const mappedStatus = mapPaymentStatus(paymentStatus, provider)
    const previousStatus = order.paymentStatus

    // Skip if status hasn't changed
    if (previousStatus === mappedStatus) {
      console.log(`Payment status unchanged for order ${order.orderNumber}: ${mappedStatus}`)
      return NextResponse.json({ status: 'no_change' })
    }

    // Update order payment status and order status if needed
    const updates: any = {
      paymentStatus: mappedStatus,
      updatedAt: new Date()
    }

    // Update order status based on payment status
    if (mappedStatus === 'PAID' && order.status === 'AWAITING_PAYMENT') {
      updates.status = 'PAYMENT_CONFIRMED'
    } else if (mappedStatus === 'CANCELLED' || mappedStatus === 'REFUNDED') {
      updates.status = 'CANCELLED'
    }

    // Store payment details if payment is successful  
    if (mappedStatus === 'COMPLETED') {
      updates.paidAt = new Date()
      if (transactionId) updates.paymentId = transactionId
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: updates,
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

    // Create order history entry
    await prisma.orderHistory.create({
      data: {
        orderId: order.id,
        previousStatus: order.status,
        newStatus: updatedOrder.status,
        changedById: null, // System change
        notes: `Payment webhook: ${event || 'status_update'} - Status changed to ${mappedStatus}`,
        metadata: {
          webhookEvent: event,
          paymentStatus: mappedStatus,
          transactionId,
          provider
        }
      }
    })

    // Send appropriate email based on payment status
    let emailResult = { success: false, error: 'No email sent' }

    if (mappedStatus === 'COMPLETED') {
      // Send payment confirmation email
      emailResult = await sendPaymentConfirmationEmail({
        to: updatedOrder.user.email,
        name: updatedOrder.user.name || 'Cliente',
        orderNumber: updatedOrder.orderNumber,
        amount: `R$ ${updatedOrder.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        paymentMethod: paymentMethod || updatedOrder.paymentMethod
      })

      // Also send processing started email if order status changed to PAYMENT_CONFIRMED
      if (updatedOrder.status === 'PAYMENT_CONFIRMED') {
        const processingEmailResult = await emailService.sendEmail({
          to: updatedOrder.user.email,
          ...getEmailTemplate('order-processing', {
            name: updatedOrder.user.name || 'Cliente',
            orderNumber: updatedOrder.orderNumber,
            serviceType: updatedOrder.serviceType === 'PROTEST_QUERY' ? 'Consulta de Protesto' : 'Certidão de Protesto'
          }),
          metadata: {
            type: 'order-processing',
            orderNumber: updatedOrder.orderNumber,
            userEmail: updatedOrder.user.email,
            triggeredBy: 'payment_webhook'
          }
        })

        if (processingEmailResult.success) {
          console.log('Order processing email sent successfully')
        }
      }

    } else if (mappedStatus === 'CANCELLED' || mappedStatus === 'REFUNDED') {
      // Send status update email for cancelled/refunded payments
      const statusMessage = mappedStatus === 'CANCELLED' 
        ? 'Seu pagamento foi cancelado. Se você não cancelou esta transação, entre em contato conosco.'
        : 'Seu pagamento foi estornado. O valor será devolvido ao método de pagamento original em até 5 dias úteis.'

      emailResult = await emailService.sendEmail({
        to: updatedOrder.user.email,
        ...getEmailTemplate('status-update', {
          name: updatedOrder.user.name || 'Cliente',
          orderNumber: updatedOrder.orderNumber,
          orderStatus: mappedStatus === 'CANCELLED' ? 'Cancelado' : 'Estornado',
          message: statusMessage,
          requiresAction: false
        }),
        metadata: {
          type: 'status-update',
          orderNumber: updatedOrder.orderNumber,
          userEmail: updatedOrder.user.email,
          triggeredBy: 'payment_webhook'
        }
      })
    }

    // Log email results
    if (emailResult.success) {
      console.log(`Payment status email sent successfully for order ${updatedOrder.orderNumber}`)
      
      await prisma.auditLog.create({
        data: {
          userId: updatedOrder.user.id,
          action: 'PAYMENT_STATUS_EMAIL_SENT',
          resource: 'EMAIL',
          resourceId: updatedOrder.id,
          metadata: { 
            email: updatedOrder.user.email, 
            orderNumber: updatedOrder.orderNumber,
            paymentStatus: mappedStatus,
            messageId: emailResult.messageId 
          }
        }
      })
    } else if (emailResult.error !== 'No email sent') {
      console.error('Failed to send payment status email:', emailResult.error)
      
      await prisma.auditLog.create({
        data: {
          userId: updatedOrder.user.id,
          action: 'EMAIL_FAILED',
          resource: 'EMAIL',
          resourceId: updatedOrder.id,
          metadata: { 
            email: updatedOrder.user.email, 
            orderNumber: updatedOrder.orderNumber,
            error: emailResult.error,
            emailType: 'payment-status',
            paymentStatus: mappedStatus
          }
        }
      })
    }

    // Log webhook processing
    await prisma.auditLog.create({
      data: {
        userId: updatedOrder.user.id,
        action: 'PAYMENT_WEBHOOK_PROCESSED',
        resource: 'PAYMENT',
        resourceId: updatedOrder.id,
        metadata: {
          webhookEvent: event,
          paymentStatus: mappedStatus,
          previousPaymentStatus: previousStatus,
          orderStatus: updatedOrder.status,
          transactionId,
          provider
        }
      }
    })

    return NextResponse.json({ 
      status: 'success', 
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      paymentStatus: mappedStatus,
      emailSent: emailResult.success
    })

  } catch (error) {
    console.error('Payment webhook processing error:', error)
    
    // Log webhook error
    await prisma.auditLog.create({
      data: {
        action: 'WEBHOOK_ERROR',
        resource: 'PAYMENT',
        metadata: { 
          error: (error as any).message || 'Unknown webhook error',
          provider: process.env.PAYMENT_PROVIDER || 'unknown'
        }
      }
    })
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    service: 'payment-webhook',
    timestamp: new Date().toISOString()
  })
}