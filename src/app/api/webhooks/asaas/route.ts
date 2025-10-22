import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { rateLimit, getClientIp, createRateLimitResponse, RateLimits, isRateLimitEnabled } from '@/lib/rate-limiter'

// Redis client for webhook queue (optional)
let redis: any = null

// Initialize Redis only if REDIS_URL is configured and ioredis is available
async function initRedis() {
  if (!process.env.REDIS_URL) return null

  try {
    // Dynamic import to make ioredis optional
    const Redis = (await import('ioredis')).default

    const client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        if (times > 3) {
          console.warn('⚠️ Redis connection failed, webhooks will be processed synchronously')
          return null // Stop retrying
        }
        return Math.min(times * 100, 3000)
      },
      lazyConnect: true
    })

    client.on('error', (err: Error) => {
      console.warn('⚠️ Redis error (webhooks will process synchronously):', err.message)
    })

    return client
  } catch (error) {
    console.warn('⚠️ Redis not available, webhooks will be processed synchronously')
    return null
  }
}

// Verify ASAAS webhook authenticity
async function verifyWebhookSignature(request: NextRequest): Promise<boolean> {
  const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN

  if (!webhookToken) {
    console.error('🚨 ASAAS_WEBHOOK_TOKEN not configured - webhook security disabled!')
    return false
  }

  // ASAAS sends the token in the 'asaas-access-token' header
  const signature = request.headers.get('asaas-access-token')

  if (!signature) {
    console.warn('🚨 Webhook received without asaas-access-token header')
    return false
  }

  // Verify the token matches
  const isValid = signature === webhookToken

  if (!isValid) {
    console.warn('🚨 Invalid webhook signature received')
  }

  return isValid
}

async function processWebhookDirectly(event: string, payment: any) {
  // Direct processing without Redis queue
  try {
    const order = await prisma.order.findFirst({
      where: { asaasPaymentId: payment.id }
    })

    if (!order) {
      console.log(`❌ Order not found for payment ${payment.id}`)
      return { success: false, message: 'Order not found' }
    }

    console.log(`📋 Found order ${order.orderNumber} for payment ${payment.id}`)

    // Map ASAAS payment status
    let newPaymentStatus = order.paymentStatus
    let newOrderStatus = order.status

    switch (payment.status) {
      case 'RECEIVED':
      case 'CONFIRMED':
        newPaymentStatus = 'COMPLETED'
        newOrderStatus = 'PAYMENT_CONFIRMED'
        break
      case 'PENDING':
        newPaymentStatus = 'PENDING'
        newOrderStatus = 'AWAITING_PAYMENT'
        break
      case 'OVERDUE':
        newPaymentStatus = 'FAILED'
        newOrderStatus = 'PAYMENT_REFUSED'
        break
      case 'REFUNDED':
        newPaymentStatus = 'REFUNDED'
        newOrderStatus = 'CANCELLED'
        break
    }

    // Update order
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
              receivedAt: new Date().toISOString(),
              processedAt: new Date().toISOString()
            }
          }
        }
      })

      await prisma.orderHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.status,
          newStatus: newOrderStatus,
          notes: `Webhook: ${event} - Payment: ${payment.status}`,
          metadata: { webhook: { event, paymentId: payment.id, paymentStatus: payment.status } }
        }
      })

      // Log successful webhook processing for audit trail
      await prisma.auditLog.create({
        data: {
          action: 'WEBHOOK_PROCESSED',
          resource: 'ASAAS_WEBHOOK',
          resourceId: order.id,
          metadata: {
            event,
            paymentId: payment.id,
            paymentStatus: payment.status,
            orderNumber: order.orderNumber,
            previousStatus: order.status,
            newStatus: newOrderStatus,
            processedAt: new Date().toISOString()
          }
        }
      }).catch(e => console.error('Failed to log webhook processing:', e))

      console.log(`✅ Order ${order.orderNumber} updated (direct processing)`)
      return { success: true, message: 'Order updated' }
    }

    return { success: true, message: 'No status change needed' }
  } catch (error) {
    console.error('💥 Direct webhook processing error:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for webhooks - protect against flooding
    if (isRateLimitEnabled()) {
      const clientIp = getClientIp(request)
      const rateLimitResult = await rateLimit(
        `webhook-asaas:${clientIp}`,
        RateLimits.WEBHOOK.limit,
        RateLimits.WEBHOOK.windowMs
      )

      if (!rateLimitResult.success) {
        // Log rate limit violation
        await prisma.auditLog.create({
          data: {
            action: 'RATE_LIMIT_EXCEEDED',
            resource: 'WEBHOOK_ASAAS',
            metadata: {
              ip: clientIp,
              limit: rateLimitResult.limit,
              resetAt: rateLimitResult.resetAt.toISOString()
            }
          }
        }).catch(err => console.error('Failed to log rate limit:', err))

        return createRateLimitResponse(
          rateLimitResult,
          'Too many webhook requests'
        )
      }
    }

    // CRITICAL SECURITY: Verify webhook signature before processing
    const isValidSignature = await verifyWebhookSignature(request)

    if (!isValidSignature) {
      // Log security incident with audit trail
      await prisma.auditLog.create({
        data: {
          action: 'WEBHOOK_UNAUTHORIZED',
          resource: 'ASAAS_WEBHOOK',
          metadata: {
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
            signature: request.headers.get('asaas-access-token')?.substring(0, 10) || 'missing',
            timestamp: new Date().toISOString(),
            securityEvent: 'INVALID_WEBHOOK_SIGNATURE'
          }
        }
      }).catch(e => console.error('Failed to log security incident:', e))

      console.error('🚨 SECURITY: Unauthorized webhook attempt blocked')

      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    console.log('🔔 ASAAS Webhook received (verified):', JSON.stringify(body, null, 2))

    const { event, payment } = body

    if (!payment?.id) {
      console.log('❌ Webhook: No payment ID found')
      return NextResponse.json({ error: 'No payment ID' }, { status: 400 })
    }

    // Initialize Redis if not already done (lazy loading)
    if (!redis && process.env.REDIS_URL) {
      redis = await initRedis()
    }

    // Check if Redis is available
    if (redis) {
      try {
        // Try to use Redis queue
        const webhookId = `webhook:${payment.id}:${Date.now()}`
        const webhookData = {
          id: webhookId,
          event,
          payment,
          receivedAt: new Date().toISOString()
        }

        await redis.setex(webhookId, 86400, JSON.stringify(webhookData))
        await redis.lpush('webhook:queue:asaas', webhookId)

        console.log(`✅ Webhook queued: ${webhookId}`)

        return NextResponse.json({
          success: true,
          message: 'Webhook received and queued for processing',
          webhookId
        })
      } catch (redisError) {
        console.warn('⚠️ Redis operation failed, falling back to direct processing:', redisError)
        // Fall through to direct processing
      }
    }

    // Direct processing (no Redis or Redis failed)
    console.log('ℹ️ Processing webhook directly (Redis not available)')
    const result = await processWebhookDirectly(event, payment)

    return NextResponse.json({
      success: result.success,
      message: result.message,
      mode: 'direct'
    })

  } catch (error) {
    console.error('💥 Webhook error:', error)

    // Still return 200 to avoid blocking ASAAS queue
    return NextResponse.json({
      success: false,
      message: 'Webhook processing failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 }) // Return 200 to prevent ASAAS from retrying
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'ASAAS Webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}