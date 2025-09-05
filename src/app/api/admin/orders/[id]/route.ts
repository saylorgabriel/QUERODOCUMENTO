import { NextRequest, NextResponse } from 'next/server'
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

// Helper function to validate admin role
function isAdmin(user: { id: string; role: string } | null): boolean {
  return user?.role === 'ADMIN' || user?.role === 'SUPPORT'
}

// Helper function to validate status transitions
function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  const validTransitions: { [key: string]: string[] } = {
    'AWAITING_PAYMENT': ['PAYMENT_CONFIRMED', 'PAYMENT_REFUSED', 'CANCELLED'],
    'PAYMENT_CONFIRMED': ['ORDER_CONFIRMED', 'CANCELLED'],
    'PAYMENT_REFUSED': ['AWAITING_PAYMENT', 'CANCELLED'],
    'ORDER_CONFIRMED': ['AWAITING_QUOTE', 'DOCUMENT_REQUESTED', 'PROCESSING', 'CANCELLED'],
    'AWAITING_QUOTE': ['ORDER_CONFIRMED', 'PROCESSING', 'CANCELLED'],
    'DOCUMENT_REQUESTED': ['PROCESSING', 'CANCELLED'],
    'PROCESSING': ['COMPLETED', 'CANCELLED'],
    'COMPLETED': [], // Final state
    'CANCELLED': [] // Final state
  }

  return validTransitions[currentStatus]?.includes(newStatus) || false
}

// GET - Fetch single order with full details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate user session and admin role
    const user = await getUserFromSession()
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Acesso negado: permissões de administrador necessárias' },
        { status: 403 }
      )
    }

    const orderId = params.id

    // Validate order ID format
    if (!orderId || orderId.length < 10) {
      return NextResponse.json(
        { error: 'ID do pedido inválido' },
        { status: 400 }
      )
    }

    // Fetch order with all related data
    const order = await prisma.order.findUnique({
      where: {
        id: orderId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            cpf: true,
            cnpj: true,
            phone: true,
            createdAt: true
          }
        },
        processedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        orderHistories: {
          include: {
            changedBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            changedAt: 'desc'
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

    // Format the response
    const formattedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      serviceType: order.serviceType,
      status: order.status,
      paymentStatus: order.paymentStatus,
      
      // Document information
      documentNumber: order.documentNumber,
      documentType: order.documentType,
      
      // Invoice information
      invoiceName: order.invoiceName,
      invoiceDocument: order.invoiceDocument,
      
      // Processing information
      protocolNumber: order.protocolNumber,
      processingNotes: order.processingNotes,
      resultText: order.resultText,
      quotedAmount: order.quotedAmount,
      
      // Payment information
      amount: order.amount,
      paymentMethod: order.paymentMethod,
      paidAt: order.paidAt,
      
      // Attachments
      attachmentUrl: order.attachmentUrl,
      
      // Certificate specific
      state: order.state,
      city: order.city,
      notaryOffice: order.notaryOffice,
      reason: order.reason,
      
      // Timestamps
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      
      // Relations
      user: order.user,
      processedBy: order.processedBy,
      orderHistories: order.orderHistories
    }

    return NextResponse.json({
      success: true,
      order: formattedOrder
    })

  } catch (error) {
    console.error('Order details fetch error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Update order details (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate user session and admin role
    const user = await getUserFromSession()
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Acesso negado: permissões de administrador necessárias' },
        { status: 403 }
      )
    }

    const orderId = params.id

    // Validate order ID format
    if (!orderId || orderId.length < 10) {
      return NextResponse.json(
        { error: 'ID do pedido inválido' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      status,
      processingNotes,
      resultText,
      protocolNumber,
      quotedAmount,
      paymentStatus,
      notes // For history entry
    } = body

    // Fetch existing order
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    // Validate status transition if status is being changed
    if (status && status !== existingOrder.status) {
      if (!isValidStatusTransition(existingOrder.status, status)) {
        return NextResponse.json(
          { error: `Transição de status inválida: ${existingOrder.status} para ${status}` },
          { status: 400 }
        )
      }
    }

    // Validate quotedAmount if provided
    if (quotedAmount !== undefined) {
      const quotedValue = parseFloat(quotedAmount)
      if (isNaN(quotedValue) || quotedValue < 0) {
        return NextResponse.json(
          { error: 'Valor do orçamento inválido' },
          { status: 400 }
        )
      }
    }

    // Build update data
    const updateData: any = {}
    
    if (status) updateData.status = status
    if (processingNotes !== undefined) updateData.processingNotes = processingNotes
    if (resultText !== undefined) updateData.resultText = resultText
    if (protocolNumber !== undefined) updateData.protocolNumber = protocolNumber
    if (quotedAmount !== undefined) updateData.quotedAmount = parseFloat(quotedAmount)
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    
    // Set processedById if not already set
    if (!existingOrder.processedById) {
      updateData.processedById = user.id
    }

    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        processedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Create history entry if status changed
    if (status && status !== existingOrder.status) {
      await prisma.orderHistory.create({
        data: {
          orderId,
          previousStatus: existingOrder.status,
          newStatus: status,
          changedById: user.id,
          notes: notes || `Status alterado para ${status}`
        }
      })
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Pedido atualizado com sucesso'
    })

  } catch (error) {
    console.error('Order update error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}