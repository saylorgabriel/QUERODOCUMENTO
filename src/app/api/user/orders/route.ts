import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { asaasService } from '@/lib/payment/asaas'

// Helper function to get user from session
async function getUserFromSession(): Promise<{ id: string; role: string } | null> {
  try {
    const cookieStore = await cookies()
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

// Helper function to get status display names
function getStatusDisplayName(status: string): string {
  const statusNames: { [key: string]: string } = {
    'AWAITING_PAYMENT': 'Aguardando Pagamento',
    'PAYMENT_CONFIRMED': 'Pagamento Confirmado',
    'PAYMENT_REFUSED': 'Pagamento Recusado',
    'ORDER_CONFIRMED': 'Pedido Confirmado',
    'AWAITING_QUOTE': 'Aguardando Orçamento',
    'DOCUMENT_REQUESTED': 'Documento Solicitado',
    'PROCESSING': 'Processando',
    'COMPLETED': 'Finalizado',
    'CANCELLED': 'Cancelado'
  }
  
  return statusNames[status] || status
}

// Helper function to get service type display names
function getServiceTypeDisplayName(serviceType: string): string {
  const serviceNames: { [key: string]: string } = {
    'PROTEST_QUERY': 'Consulta de Protesto',
    'CERTIFICATE_REQUEST': 'Certidão de Protesto'
  }
  
  return serviceNames[serviceType] || serviceType
}

// Helper function to format document number for display
function formatDocumentForDisplay(document: string, type: string): string {
  if (type === 'CPF' && document.length === 11) {
    return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  } else if (type === 'CNPJ' && document.length === 14) {
    return document.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  return document
}

// Helper function to sync payment status from ASAAS
async function syncPaymentStatusFromAsaas(order: any): Promise<any> {
  // Only sync if order has ASAAS payment ID and is not already completed
  if (!order.asaasPaymentId || order.paymentStatus === 'COMPLETED') {
    return order
  }

  try {
    console.log(`🔄 Syncing payment status for order #${order.orderNumber}`)

    // Get current status from ASAAS
    const asaasPayment = await asaasService.getPayment(order.asaasPaymentId)

    console.log(`   DB status: ${order.paymentStatus} → ASAAS status: ${asaasPayment.status}`)

    // Check if status changed
    if (asaasPayment.status !== order.paymentStatus) {
      const isPaid = asaasPayment.status === 'CONFIRMED' || asaasPayment.status === 'RECEIVED'

      console.log(`   ✅ Updating order status`)

      // Update order in database
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: asaasPayment.status,
          paidAt: isPaid ? (order.paidAt || new Date()) : order.paidAt,
          status: isPaid && order.status === 'AWAITING_PAYMENT' ? 'PROCESSING' : order.status,
          metadata: {
            ...(order.metadata as any || {}),
            asaasPayment: {
              ...(order.metadata as any)?.asaasPayment,
              status: asaasPayment.status,
              syncedAt: new Date().toISOString()
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
          changedById: order.userId,
          notes: `Status sincronizado do ASAAS: ${order.paymentStatus} → ${asaasPayment.status}`,
          metadata: {
            autoSync: true,
            oldPaymentStatus: order.paymentStatus,
            newPaymentStatus: asaasPayment.status
          }
        }
      })

      return updatedOrder
    }
  } catch (error) {
    console.error(`❌ Error syncing payment status for order #${order.orderNumber}:`, (error as Error).message)
    // Return original order if sync fails - don't break the request
  }

  return order
}

export async function GET(request: NextRequest) {
  try {
    // Validate user session
    const user = await getUserFromSession()
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('id') // Single order ID lookup
    const status = searchParams.get('status')
    const serviceType = searchParams.get('serviceType')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50) // Max 50 per page for users
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

    // If orderId is provided, return single order
    if (orderId) {
      let order = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId: user.id // Security: only user's own orders
        },
        select: {
          id: true,
          orderNumber: true,
          serviceType: true,
          status: true,
          paymentStatus: true,
          documentNumber: true,
          documentType: true,
          invoiceName: true,
          invoiceDocument: true,
          amount: true,
          paymentMethod: true,
          paidAt: true,
          resultText: true,
          attachmentUrl: true,
          quotedAmount: true,
          protocolNumber: true,
          state: true,
          city: true,
          notaryOffice: true,
          reason: true,
          createdAt: true,
          updatedAt: true,
          asaasPaymentId: true, // Include for sync
          metadata: true, // Include for sync
          userId: true, // Include for sync
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

      // Sync payment status from ASAAS
      order = await syncPaymentStatusFromAsaas(order)

      // Format single order response
      const formattedOrder = {
        id: order.id,
        orderNumber: order.orderNumber,
        serviceType: order.serviceType,
        serviceTypeDisplay: getServiceTypeDisplayName(order.serviceType),
        status: order.status,
        statusDisplay: getStatusDisplayName(order.status),
        paymentStatus: order.paymentStatus,
        documentNumber: formatDocumentForDisplay(order.documentNumber, order.documentType),
        documentType: order.documentType,
        invoiceName: order.invoiceName,
        invoiceDocument: formatDocumentForDisplay(order.invoiceDocument, order.documentType),
        amount: order.amount,
        paymentMethod: order.paymentMethod,
        paidAt: order.paidAt,
        hasResults: !!order.resultText || !!order.attachmentUrl,
        resultText: order.resultText,
        attachmentUrl: order.attachmentUrl,
        quotedAmount: order.quotedAmount,
        protocolNumber: order.protocolNumber,
        state: order.state,
        city: order.city,
        notaryOffice: order.notaryOffice,
        reason: order.reason,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        user: order.user
      }

      return NextResponse.json({
        success: true,
        order: formattedOrder // Single order response
      })
    }

    // Build where clause - only show user's own orders
    const where: any = {
      userId: user.id
    }

    // Status filter
    if (status && status !== 'ALL') {
      where.status = status
    }

    // Service type filter
    if (serviceType && serviceType !== 'ALL') {
      where.serviceType = serviceType
    }

    // Get total count for pagination
    const totalCount = await prisma.order.count({ where })

    // Calculate pagination
    const offset = (page - 1) * limit
    const totalPages = Math.ceil(totalCount / limit)

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'amount') {
      orderBy.amount = sortOrder
    } else {
      orderBy[sortBy] = sortOrder
    }

    // Fetch user's orders with pagination
    let orders = await prisma.order.findMany({
      where,
      select: {
        // Order information (hide sensitive admin fields)
        id: true,
        orderNumber: true,
        serviceType: true,
        status: true,
        paymentStatus: true,

        // Document information
        documentNumber: true,
        documentType: true,

        // Invoice information (user can see their own invoice data)
        invoiceName: true,
        invoiceDocument: true,

        // Payment information
        amount: true,
        paymentMethod: true,
        paidAt: true,
        asaasPaymentId: true, // Include for sync

        // Results (if available)
        resultText: true,
        attachmentUrl: true,
        quotedAmount: true,
        protocolNumber: true,

        // Certificate specific fields
        state: true,
        city: true,
        notaryOffice: true,
        reason: true,

        // Timestamps
        createdAt: true,
        updatedAt: true,

        // Metadata for sync
        metadata: true,
        userId: true,

        // Hide sensitive admin fields:
        // - processingNotes: false (internal admin notes)
        // - processedBy: false (admin who processed)
        // - processedById: false

        // Include basic user info for verification
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy,
      skip: offset,
      take: limit
    })

    // Sync payment status for all PENDING orders
    orders = await Promise.all(
      orders.map(async (order) => {
        if (order.paymentStatus === 'PENDING' && order.asaasPaymentId) {
          return await syncPaymentStatusFromAsaas(order)
        }
        return order
      })
    )

    // Format response with display-friendly data
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      serviceType: order.serviceType,
      serviceTypeDisplay: getServiceTypeDisplayName(order.serviceType),
      status: order.status,
      statusDisplay: getStatusDisplayName(order.status),
      paymentStatus: order.paymentStatus,
      
      // Document information (formatted for display)
      documentNumber: formatDocumentForDisplay(order.documentNumber, order.documentType),
      documentType: order.documentType,
      
      // Invoice information (formatted for display)
      invoiceName: order.invoiceName,
      invoiceDocument: formatDocumentForDisplay(order.invoiceDocument, order.documentType),
      
      // Payment information
      amount: order.amount,
      paymentMethod: order.paymentMethod,
      paidAt: order.paidAt,
      
      // Results (if available)
      hasResults: !!order.resultText || !!order.attachmentUrl,
      resultText: order.resultText,
      attachmentUrl: order.attachmentUrl,
      quotedAmount: order.quotedAmount,
      protocolNumber: order.protocolNumber,
      
      // Certificate specific fields
      state: order.state,
      city: order.city,
      notaryOffice: order.notaryOffice,
      reason: order.reason,
      
      // Timestamps
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      
      // User verification
      user: order.user
    }))

    // Build pagination metadata
    const pagination = {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }

    // Calculate summary statistics
    const summary = {
      totalOrders: totalCount,
      completedOrders: formattedOrders.filter(o => o.status === 'COMPLETED').length,
      pendingOrders: formattedOrders.filter(o => ['AWAITING_PAYMENT', 'PAYMENT_CONFIRMED', 'ORDER_CONFIRMED', 'PROCESSING'].includes(o.status)).length,
      cancelledOrders: formattedOrders.filter(o => o.status === 'CANCELLED').length,
      totalSpent: formattedOrders
        .filter(o => o.paymentStatus === 'COMPLETED')
        .reduce((sum, o) => sum + o.amount, 0)
    }

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      pagination,
      summary,
      filters: {
        status,
        serviceType
      }
    })

  } catch (error) {
    console.error('User orders fetch error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}