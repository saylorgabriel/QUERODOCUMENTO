import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mock payment confirmation endpoint - simulates payment provider webhook
// In production, this would be called by the actual payment provider
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, paymentId, simulatePayment = true } = body

    if (!orderId || !paymentId) {
      return NextResponse.json(
        { error: 'Order ID and Payment ID are required' },
        { status: 400 }
      )
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        paymentId: true,
        paymentStatus: true,
        amount: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.paymentId !== paymentId) {
      return NextResponse.json(
        { error: 'Payment ID does not match order' },
        { status: 400 }
      )
    }

    if (order.paymentStatus === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment already confirmed' },
        { status: 400 }
      )
    }

    // Simulate webhook call to our own webhook endpoint
    if (simulatePayment) {
      const webhookPayload = {
        event: 'payment.paid',
        payment: {
          id: paymentId,
          status: 'paid',
          amount: order.amount
        },
        order_id: orderId,
        transaction_id: paymentId,
        status: 'RECEIVED', // ASAAS format
        amount: order.amount,
        payment_method: 'PIX',
        metadata: {
          orderNumber: order.orderNumber,
          source: 'mock_payment_confirmation'
        }
      }

      // Call our webhook endpoint internally
      const webhookUrl = `${request.nextUrl.origin}/api/webhooks/payment`
      
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MockPaymentProvider/1.0'
        },
        body: JSON.stringify(webhookPayload)
      })

      if (!webhookResponse.ok) {
        const errorData = await webhookResponse.json()
        console.error('Webhook call failed:', errorData)
        return NextResponse.json(
          { error: 'Failed to process payment webhook' },
          { status: 500 }
        )
      }

      const webhookResult = await webhookResponse.json()

      return NextResponse.json({
        success: true,
        message: 'Payment confirmed successfully',
        orderId: orderId,
        paymentId: paymentId,
        webhookResult
      })
    } else {
      // Direct database update without webhook simulation
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'PAYMENT_CONFIRMED',
          paidAt: new Date(),
          updatedAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Payment confirmed directly',
        orderId: updatedOrder.id,
        paymentId: paymentId
      })
    }

  } catch (error) {
    console.error('Payment confirmation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET method to trigger payment confirmation for testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')
  const paymentId = searchParams.get('paymentId')

  if (!orderId || !paymentId) {
    return NextResponse.json(
      { error: 'orderId and paymentId parameters are required' },
      { status: 400 }
    )
  }

  // Trigger payment confirmation
  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ orderId, paymentId, simulatePayment: true }),
    headers: { 'Content-Type': 'application/json' }
  }))
}