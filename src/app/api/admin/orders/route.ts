import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

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

// Helper function to validate admin role
function isAdmin(user: { id: string; role: string } | null): boolean {
  return user?.role === 'ADMIN' || user?.role === 'SUPPORT'
}

export async function GET(request: NextRequest) {
  try {
    // Validate user session and admin role
    const user = await getUserFromSession()
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Acesso negado: permissões de administrador necessárias' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const serviceType = searchParams.get('serviceType')
    const search = searchParams.get('search')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 100) // Max 100 per page
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'

    // Build where clause
    const where: any = {}

    // Status filter
    if (status && status !== 'ALL') {
      where.status = status
    }

    // Service type filter
    if (serviceType && serviceType !== 'ALL') {
      where.serviceType = serviceType
    }

    // Search filter (CPF/CNPJ, name, email)
    if (search) {
      const cleanSearch = search.replace(/\D/g, '') // Remove non-numeric for document search
      
      where.OR = [
        // Search by document number
        {
          documentNumber: {
            contains: cleanSearch
          }
        },
        {
          invoiceDocument: {
            contains: cleanSearch
          }
        },
        // Search by user name/email
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            email: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          invoiceName: {
            contains: search,
            mode: 'insensitive'
          }
        },
        // Search by order number
        {
          orderNumber: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        // Add 1 day and subtract 1ms to include the entire day
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999)
        where.createdAt.lte = endDate
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.order.count({ where })

    // Calculate pagination
    const offset = (page - 1) * limit
    const totalPages = Math.ceil(totalCount / limit)

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'user') {
      orderBy.user = { name: sortOrder }
    } else if (sortBy === 'amount') {
      orderBy.amount = sortOrder
    } else {
      orderBy[sortBy] = sortOrder
    }

    // Fetch orders with pagination
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            cpf: true,
            cnpj: true,
            phone: true
          }
        },
        processedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            orderHistories: true
          }
        }
      },
      orderBy,
      skip: offset,
      take: limit
    })

    // Format response
    const formattedOrders = orders.map(order => ({
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
      
      // Counts
      historyCount: order._count.orderHistories
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

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      pagination,
      filters: {
        status,
        serviceType,
        search,
        dateFrom,
        dateTo
      }
    })

  } catch (error) {
    console.error('Order listing error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}