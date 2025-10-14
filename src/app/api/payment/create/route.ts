import { NextResponse } from 'next/server'
import { asaasService } from '@/lib/payment/asaas'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

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

export async function POST(request: Request) {
  try {
    console.log('🚀 Payment create API called')
    const user = await getUserFromSession()

    if (!user?.id) {
      console.log('❌ User not authenticated')
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      orderId,
      paymentMethod,
      creditCard
    } = body

    console.log('📋 Payment request:', { orderId, paymentMethod, userId: user.id })

    // Validate payment method
    if (!['PIX', 'CREDIT_CARD', 'BOLETO'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Método de pagamento inválido' },
        { status: 400 }
      )
    }

    // Get order data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true
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

    // Check if payment is already created
    if (order.asaasPaymentId) {
      return NextResponse.json(
        { error: 'Pagamento já foi criado para este pedido' },
        { status: 400 }
      )
    }

    const userData = order.user
    const cpfCnpj = asaasService.sanitizeCpfCnpj(userData.cpf || userData.cnpj || '')

    // Check if customer exists in ASAAS
    let asaasCustomer = null

    if (userData.asaasCustomerId) {
      // Try to get existing customer
      try {
        asaasCustomer = await asaasService.getCustomer(userData.asaasCustomerId)
      } catch (error) {
        console.log('Customer not found in ASAAS, will create new one')
      }
    }

    // If no customer or failed to get, try to find by CPF/CNPJ
    if (!asaasCustomer && cpfCnpj) {
      asaasCustomer = await asaasService.findCustomerByCpfCnpj(cpfCnpj)
    }

    // Create customer if doesn't exist
    if (!asaasCustomer) {
      asaasCustomer = await asaasService.createCustomer({
        name: userData.name || 'Cliente',
        email: userData.email,
        cpfCnpj: cpfCnpj,
        phone: asaasService.sanitizePhone(userData.phone || ''),
        externalReference: userData.id
      })

      // Save ASAAS customer ID in user
      await prisma.user.update({
        where: { id: userData.id },
        data: { asaasCustomerId: asaasCustomer.id }
      })
    }

    // Create payment data
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 3) // Due in 3 days

    const paymentData: any = {
      customer: asaasCustomer.id,
      billingType: paymentMethod,
      value: order.amount,
      dueDate: dueDate.toISOString().split('T')[0],
      description: `Pedido #${order.orderNumber} - ${order.serviceType}`,
      externalReference: order.id
    }

    // Add credit card data if payment method is credit card
    if (paymentMethod === 'CREDIT_CARD') {
      if (!creditCard) {
        return NextResponse.json(
          { error: 'Dados do cartão são obrigatórios' },
          { status: 400 }
        )
      }

      paymentData.creditCard = {
        holderName: creditCard.holderName,
        number: creditCard.number.replace(/\s/g, ''),
        expiryMonth: creditCard.expiryMonth,
        expiryYear: creditCard.expiryYear,
        ccv: creditCard.cvv || creditCard.ccv
      }

      paymentData.creditCardHolderInfo = {
        name: creditCard.holderName || userData.name || 'Cliente',
        email: userData.email,
        cpfCnpj: cpfCnpj,
        postalCode: creditCard.postalCode || '00000000',
        addressNumber: creditCard.addressNumber || 'SN',
        phone: asaasService.sanitizePhone(userData.phone || '11999999999')
      }
    }

    // Create payment in ASAAS
    const asaasPayment = await asaasService.createPayment(paymentData)

    // Get PIX QR Code if payment method is PIX
    let pixQrCode = null
    if (paymentMethod === 'PIX' && asaasPayment.id) {
      try {
        pixQrCode = await asaasService.getPixQrCode(asaasPayment.id)
      } catch (error) {
        console.error('Error getting PIX QR Code:', error)
      }
    }

    // Update order with payment information
    await prisma.order.update({
      where: { id: order.id },
      data: {
        asaasPaymentId: asaasPayment.id,
        paymentMethod: paymentMethod,
        paymentStatus: 'PENDING',
        metadata: {
          ...(order.metadata as any || {}),
          asaasCustomerId: asaasCustomer.id,
          asaasPayment: {
            id: asaasPayment.id,
            status: asaasPayment.status,
            invoiceUrl: asaasPayment.invoiceUrl,
            bankSlipUrl: asaasPayment.bankSlipUrl,
            pixQrCode: pixQrCode
          }
        }
      }
    })

    // Create order history entry
    await prisma.orderHistory.create({
      data: {
        orderId: order.id,
        previousStatus: order.status,
        newStatus: order.status,
        changedById: user.id,
        notes: `Pagamento criado via ASAAS - Método: ${paymentMethod}`,
        metadata: {
          asaasPaymentId: asaasPayment.id,
          paymentMethod,
          amount: order.amount
        }
      }
    })

    // Log the payment creation
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PAYMENT_CREATED',
        resource: 'ORDER',
        resourceId: order.id,
        metadata: {
          paymentMethod,
          value: order.amount,
          asaasPaymentId: asaasPayment.id
        }
      }
    })

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: 'PENDING',
        paymentMethod: paymentMethod,
        amount: order.amount
      },
      payment: {
        id: asaasPayment.id,
        status: asaasPayment.status,
        invoiceUrl: asaasPayment.invoiceUrl,
        bankSlipUrl: asaasPayment.bankSlipUrl,
        pixQrCode: pixQrCode,
        dueDate: asaasPayment.dueDate
      }
    })
  } catch (error) {
    console.error('Payment creation error:', error)

    return NextResponse.json(
      {
        error: 'Erro ao criar pagamento',
        details: (error as any).message
      },
      { status: 500 }
    )
  }
}

// GET method to check payment status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')
    const orderId = searchParams.get('orderId')

    if (!paymentId && !orderId) {
      return NextResponse.json(
        { error: 'ID do pagamento ou pedido é obrigatório' },
        { status: 400 }
      )
    }

    let order = null

    if (orderId) {
      order = await prisma.order.findUnique({
        where: { id: orderId }
      })
    } else if (paymentId) {
      order = await prisma.order.findFirst({
        where: { asaasPaymentId: paymentId }
      })
    }

    if (!order || !order.asaasPaymentId) {
      return NextResponse.json(
        { error: 'Pagamento não encontrado' },
        { status: 404 }
      )
    }

    // Get payment status from ASAAS
    const asaasPayment = await asaasService.getPayment(order.asaasPaymentId)

    // Update order status if changed
    if (asaasPayment.status !== order.paymentStatus) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: asaasPayment.status,
          paidAt: asaasPayment.status === 'RECEIVED' || asaasPayment.status === 'CONFIRMED'
            ? new Date()
            : null,
          status: asaasPayment.status === 'RECEIVED' || asaasPayment.status === 'CONFIRMED'
            ? 'PROCESSING'
            : order.status
        }
      })
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: asaasPayment.id,
        status: asaasPayment.status,
        amount: asaasPayment.value,
        dueDate: asaasPayment.dueDate,
        invoiceUrl: asaasPayment.invoiceUrl,
        bankSlipUrl: asaasPayment.bankSlipUrl,
        transactionReceiptUrl: asaasPayment.transactionReceiptUrl
      },
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: asaasPayment.status
      }
    })
  } catch (error) {
    console.error('Payment status check error:', error)

    return NextResponse.json(
      {
        error: 'Erro ao verificar status do pagamento',
        details: (error as any).message
      },
      { status: 500 }
    )
  }
}