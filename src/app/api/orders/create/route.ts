import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { sendOrderConfirmationEmail } from '@/lib/email'

// Helper function to generate order number
function generateOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  
  return `ORD-${year}${month}${day}-${random}`
}

// Helper function to validate CPF/CNPJ
function isValidDocument(document: string): boolean {
  // Remove non-numeric characters
  const cleaned = document.replace(/\D/g, '')
  
  // Check CPF (11 digits) or CNPJ (14 digits)
  return cleaned.length === 11 || cleaned.length === 14
}

// Helper function to determine document type
function getDocumentType(document: string): 'CPF' | 'CNPJ' {
  const cleaned = document.replace(/\D/g, '')
  return cleaned.length === 11 ? 'CPF' : 'CNPJ'
}

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
    const {
      serviceType,
      documentNumber,
      invoiceName,
      invoiceDocument,
      amount,
      paymentMethod,
      // Certificate specific fields (optional)
      state,
      city,
      notaryOffice,
      reason
    } = body

    // Validate required fields
    if (!serviceType || !documentNumber || !invoiceName || !invoiceDocument || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Campos obrigatórios não preenchidos' },
        { status: 400 }
      )
    }

    // Validate service type
    if (!['PROTEST_QUERY', 'CERTIFICATE_REQUEST'].includes(serviceType)) {
      return NextResponse.json(
        { error: 'Tipo de serviço inválido' },
        { status: 400 }
      )
    }

    // Validate document numbers
    if (!isValidDocument(documentNumber) || !isValidDocument(invoiceDocument)) {
      return NextResponse.json(
        { error: 'CPF/CNPJ inválido' },
        { status: 400 }
      )
    }

    // Validate payment method
    if (!['PIX', 'CREDIT_CARD', 'BOLETO'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Método de pagamento inválido' },
        { status: 400 }
      )
    }

    // Validate amount
    const amountValue = parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      return NextResponse.json(
        { error: 'Valor inválido' },
        { status: 400 }
      )
    }

    // Generate unique order number
    let orderNumber: string
    let attempts = 0
    const maxAttempts = 10

    do {
      orderNumber = generateOrderNumber()
      const existingOrder = await prisma.order.findUnique({
        where: { orderNumber }
      })
      
      if (!existingOrder) break
      attempts++
    } while (attempts < maxAttempts)

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Erro interno: não foi possível gerar número do pedido' },
        { status: 500 }
      )
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        serviceType,
        documentNumber: documentNumber.replace(/\D/g, ''), // Store clean numbers
        documentType: getDocumentType(documentNumber),
        invoiceName,
        invoiceDocument: invoiceDocument.replace(/\D/g, ''),
        amount: amountValue,
        paymentMethod,
        status: 'AWAITING_PAYMENT',
        paymentStatus: 'PENDING',
        // Certificate specific fields (only if provided)
        ...(state && { state }),
        ...(city && { city }),
        ...(notaryOffice && { notaryOffice }),
        ...(reason && { reason })
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

    // Create initial order history entry
    await prisma.orderHistory.create({
      data: {
        orderId: order.id,
        newStatus: 'AWAITING_PAYMENT',
        changedById: user.id,
        notes: 'Pedido criado'
      }
    })

    // Send order confirmation email
    const emailResult = await sendOrderConfirmationEmail({
      to: order.user.email,
      name: order.user.name || 'Cliente',
      orderNumber: order.orderNumber,
      serviceType: serviceType === 'PROTEST_QUERY' ? 'Consulta de Protesto' : 'Certidão de Protesto',
      amount: `R$ ${amountValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    })

    if (emailResult.success) {
      console.log('Order confirmation email sent successfully to:', order.user.email)
      
      // Log email success
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'ORDER_CONFIRMATION_EMAIL_SENT',
          resource: 'EMAIL',
          resourceId: order.id,
          metadata: { 
            email: order.user.email, 
            orderNumber: order.orderNumber,
            messageId: emailResult.messageId 
          }
        }
      })
    } else {
      console.error('Failed to send order confirmation email:', emailResult.error)
      
      // Log email failure (but don't fail the order creation)
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'EMAIL_FAILED',
          resource: 'EMAIL',
          resourceId: order.id,
          metadata: { 
            email: order.user.email, 
            orderNumber: order.orderNumber,
            error: emailResult.error,
            emailType: 'order-confirmation'
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        serviceType: order.serviceType,
        status: order.status,
        amount: order.amount,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt
      }
    })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}