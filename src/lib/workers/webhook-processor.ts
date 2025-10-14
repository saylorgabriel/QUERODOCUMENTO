import Redis from 'ioredis'
import { prisma } from '@/lib/prisma'

const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379')

interface WebhookData {
  id: string
  event: string
  payment: {
    id: string
    status: string
    value?: number
    [key: string]: any
  }
  receivedAt: string
}

export async function processWebhookQueue() {
  console.log('🚀 Webhook processor started')

  while (true) {
    try {
      // Block and wait for webhook (30 second timeout)
      const result = await redis.brpop('webhook:queue:asaas', 30)

      if (!result) {
        // No webhooks, continue waiting
        continue
      }

      const [_, webhookId] = result
      await processWebhook(webhookId)

    } catch (error) {
      console.error('❌ Webhook processor error:', error)
      // Wait 5 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
}

async function processWebhook(webhookId: string) {
  try {
    console.log(`📥 Processing webhook: ${webhookId}`)

    // Get webhook data from Redis
    const data = await redis.get(webhookId)
    if (!data) {
      console.log(`⚠️ Webhook data not found: ${webhookId}`)
      return
    }

    const webhookData: WebhookData = JSON.parse(data)
    const { event, payment } = webhookData

    // Find order by ASAAS payment ID
    const order = await prisma.order.findFirst({
      where: {
        asaasPaymentId: payment.id
      }
    })

    if (!order) {
      console.log(`❌ Order not found for payment ${payment.id}`)
      // Keep in Redis for debugging
      await redis.hset('webhook:failed', webhookId, data)
      return
    }

    console.log(`📋 Found order ${order.orderNumber} for payment ${payment.id}`)

    // Map ASAAS payment status to our system
    let newPaymentStatus = order.paymentStatus
    let newOrderStatus = order.status

    switch (payment.status) {
      case 'RECEIVED':
      case 'CONFIRMED':
        newPaymentStatus = 'COMPLETED'
        newOrderStatus = 'PAYMENT_CONFIRMED'
        console.log('✅ Payment RECEIVED/CONFIRMED')
        break

      case 'PENDING':
        newPaymentStatus = 'PENDING'
        newOrderStatus = 'AWAITING_PAYMENT'
        console.log('⏳ Payment PENDING')
        break

      case 'OVERDUE':
        newPaymentStatus = 'FAILED'
        newOrderStatus = 'PAYMENT_REFUSED'
        console.log('❌ Payment OVERDUE')
        break

      case 'REFUNDED':
        newPaymentStatus = 'REFUNDED'
        newOrderStatus = 'CANCELLED'
        console.log('🔄 Payment REFUNDED')
        break

      default:
        console.log(`⚠️ Unknown payment status: ${payment.status}`)
        break
    }

    // Update order if status changed
    if (newPaymentStatus !== order.paymentStatus || newOrderStatus !== order.status) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: newPaymentStatus,
          status: newOrderStatus,
          paidAt: (payment.status === 'RECEIVED' || payment.status === 'CONFIRMED')
            ? new Date()
            : order.paidAt,
          metadata: {
            ...(order.metadata as any || {}),
            lastWebhook: {
              event,
              payment,
              receivedAt: webhookData.receivedAt,
              processedAt: new Date().toISOString()
            }
          }
        }
      })

      // Create order history entry
      await prisma.orderHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.status,
          newStatus: newOrderStatus,
          changedById: null, // System webhook - no user
          notes: `Webhook received: ${event} - Payment status: ${payment.status}`,
          metadata: {
            webhook: {
              event,
              paymentId: payment.id,
              paymentStatus: payment.status,
              value: payment.value,
              system: 'webhook-processor'
            }
          }
        }
      })

      console.log(`✅ Order ${order.orderNumber} updated:`)
      console.log(`   Payment: ${order.paymentStatus} → ${newPaymentStatus}`)
      console.log(`   Status: ${order.status} → ${newOrderStatus}`)

      // TODO: Send notification email to user
      // TODO: Trigger document processing if payment confirmed

      // Mark as processed
      await redis.hset('webhook:processed', webhookId, new Date().toISOString())
    } else {
      console.log(`ℹ️ No status change needed for order ${order.orderNumber}`)
    }

    // Delete from Redis after successful processing
    await redis.del(webhookId)

  } catch (error) {
    console.error(`💥 Error processing webhook ${webhookId}:`, error)

    // Store error for debugging
    await redis.hset('webhook:errors', webhookId, JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }))
  }
}

// Start processor if this file is run directly
if (require.main === module) {
  processWebhookQueue().catch(console.error)
}
