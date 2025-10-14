import { NextRequest, NextResponse } from 'next/server'
import Redis from 'ioredis'

// Redis client for webhook queue
const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('🔔 ASAAS Webhook received:', JSON.stringify(body, null, 2))

    const { event, payment } = body

    if (!payment?.id) {
      console.log('❌ Webhook: No payment ID found')
      return NextResponse.json({ error: 'No payment ID' }, { status: 400 })
    }

    // Save webhook to Redis queue for async processing
    const webhookId = `webhook:${payment.id}:${Date.now()}`
    const webhookData = {
      id: webhookId,
      event,
      payment,
      receivedAt: new Date().toISOString()
    }

    // Store webhook data in Redis (expires in 24 hours)
    await redis.setex(webhookId, 86400, JSON.stringify(webhookData))

    // Add to processing queue
    await redis.lpush('webhook:queue:asaas', webhookId)

    console.log(`✅ Webhook queued: ${webhookId}`)

    // Return 200 immediately to ASAAS
    return NextResponse.json({
      success: true,
      message: 'Webhook received and queued for processing',
      webhookId
    })

  } catch (error) {
    console.error('💥 Webhook error:', error)

    // Still return 200 to avoid blocking ASAAS queue
    return NextResponse.json({
      success: false,
      message: 'Webhook received but failed to queue',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'ASAAS Webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}