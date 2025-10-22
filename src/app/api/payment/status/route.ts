import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const paymentId = searchParams.get('paymentId')
    const orderId = searchParams.get('orderId')

    if (!paymentId && !orderId) {
      return NextResponse.json(
        { success: false, error: 'paymentId or orderId required' },
        { status: 400 }
      )
    }

    // Find order by ASAAS payment ID or order ID
    const order = await prisma.order.findFirst({
      where: paymentId
        ? { asaasPaymentId: paymentId }
        : { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        amount: true,
        paidAt: true,
        asaasPaymentId: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Return payment status
    return NextResponse.json({
      success: true,
      payment: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentId: order.asaasPaymentId,
        status: order.paymentStatus === 'COMPLETED' ? 'paid'
              : order.paymentStatus === 'PENDING' ? 'pending'
              : order.paymentStatus === 'FAILED' ? 'failed'
              : 'pending',
        amount: order.amount,
        paidAt: order.paidAt,
        orderStatus: order.status
      }
    })
  } catch (error) {
    console.error('Error fetching payment status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: (error as Error).message
      },
      { status: 500 }
    )
  }
}
