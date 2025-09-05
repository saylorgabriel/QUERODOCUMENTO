import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// Helper function to get user from session
async function getUserFromSession(): Promise<{ id: string; role: string } | null> {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('simple-session')
    
    if (!sessionCookie) {
      return null
    }

    const sessionData = JSON.parse(sessionCookie.value)
    
    // Check if session hasn't expired
    const expires = new Date(sessionData.expires)
    if (expires <= new Date()) {
      return null
    }

    return sessionData.user
  } catch (error) {
    console.error('Session validation error:', error)
    return null
  }
}

// Generate mock PIX QR code (simplified base64 QR code)
function generateMockPixQrCode(amount: number, orderId: string): string {
  // This is a simplified mock. In production, you'd use the payment provider's API
  const pixKey = process.env.PIX_KEY || '12345678000100' // Mock PIX key
  const pixData = `00020126580014br.gov.bcb.pix0136${pixKey}52040000530398654${amount.toFixed(2).padStart(10, '0')}5802BR5925QUERODOCUMENTO LTDA6009Sao Paulo62070503${orderId.slice(-3)}6304`
  
  // Generate a mock QR code data (in production, use a QR code library)
  const qrCodeBase64 = Buffer.from(`data:mock-qr-code:${pixData}`).toString('base64')
  
  return `data:image/png;base64,${qrCodeBase64}`
}

// Generate mock PIX copy-paste code
function generateMockPixCopyPaste(amount: number, orderId: string): string {
  const pixKey = process.env.PIX_KEY || '12345678000100'
  // Mock PIX copy-paste format
  return `00020126580014br.gov.bcb.pix0136${pixKey}52040000530398654${amount.toFixed(2).padStart(10, '0')}5802BR5925QUERODOCUMENTO LTDA6009Sao Paulo62070503${orderId.slice(-3)}6304${crypto.randomUUID().slice(0, 4)}`
}

export async function POST(request: NextRequest) {
  try {
    // Validate user session
    const user = await getUserFromSession()
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { orderId, paymentMethod = 'PIX' } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID do pedido é obrigatório' },
        { status: 400 }
      )
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    // Verify order belongs to user
    if (order.userId !== user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Check if payment is already created or if order is not awaiting payment
    if (order.status !== 'AWAITING_PAYMENT') {
      return NextResponse.json(
        { error: 'Pedido não está aguardando pagamento' },
        { status: 400 }
      )
    }

    // Generate payment ID for tracking
    const paymentId = `PAY-${Date.now()}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`

    // Generate mock payment data based on method
    let paymentData: any = {
      paymentId,
      amount: order.amount,
      currency: 'BRL',
      status: 'pending',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      createdAt: new Date()
    }

    if (paymentMethod === 'PIX') {
      paymentData = {
        ...paymentData,
        method: 'PIX',
        pixQrCode: generateMockPixQrCode(order.amount, order.orderNumber),
        pixCopyPaste: generateMockPixCopyPaste(order.amount, order.orderNumber),
        pixExpiresAt: new Date(Date.now() + 30 * 60 * 1000) // PIX expires in 30 minutes
      }
    } else if (paymentMethod === 'CREDIT_CARD') {
      paymentData = {
        ...paymentData,
        method: 'CREDIT_CARD',
        requiresCardData: true
      }
    } else if (paymentMethod === 'BOLETO') {
      paymentData = {
        ...paymentData,
        method: 'BOLETO',
        boletoUrl: `https://mock-payment-provider.com/boleto/${paymentId}`,
        boletoBarcode: `34191000000000000000000000000000000000000000${order.amount.toFixed(0).padStart(8, '0')}`,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Boleto expires in 3 days
      }
    }

    // Update order with payment information
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: paymentId,
        paymentMethod: paymentMethod,
        updatedAt: new Date()
      }
    })

    // Create order history entry
    await prisma.orderHistory.create({
      data: {
        orderId: order.id,
        previousStatus: order.status,
        newStatus: order.status, // Status remains the same, just payment created
        changedById: user.id,
        notes: `Pagamento criado - Método: ${paymentMethod}`,
        metadata: {
          paymentId,
          paymentMethod,
          amount: order.amount
        }
      }
    })

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PAYMENT_CREATED',
        resource: 'PAYMENT',
        resourceId: orderId,
        metadata: {
          paymentId,
          paymentMethod,
          amount: order.amount,
          orderNumber: order.orderNumber
        }
      }
    })

    return NextResponse.json({
      success: true,
      payment: paymentData,
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        amount: updatedOrder.amount,
        status: updatedOrder.status
      }
    })

  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET method to check payment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID do pagamento é obrigatório' },
        { status: 400 }
      )
    }

    // Find order by payment ID
    const order = await prisma.order.findFirst({
      where: { paymentId },
      select: {
        id: true,
        orderNumber: true,
        amount: true,
        paymentStatus: true,
        status: true,
        paidAt: true,
        createdAt: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pagamento não encontrado' },
        { status: 404 }
      )
    }

    // Mock payment status check - in production, you'd check with the payment provider
    // For demo purposes, we'll simulate different states based on time elapsed
    const minutesElapsed = Math.floor((Date.now() - order.createdAt.getTime()) / (1000 * 60))
    
    let status = 'pending'
    let mockPaidAt = null

    // Simulate payment progression over time for demo
    if (minutesElapsed >= 2) {
      status = 'paid'
      mockPaidAt = new Date(order.createdAt.getTime() + 2 * 60 * 1000) // Paid 2 minutes after creation
    }

    return NextResponse.json({
      success: true,
      payment: {
        paymentId,
        status,
        amount: order.amount,
        paidAt: mockPaidAt,
        orderNumber: order.orderNumber,
        orderStatus: order.status
      }
    })

  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}