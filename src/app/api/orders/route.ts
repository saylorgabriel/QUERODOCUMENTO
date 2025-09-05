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

// GET - Fetch user orders
export async function GET(request: NextRequest) {
  try {
    // Validate user session
    const user = await getUserFromSession()
    if (!user) {
      return NextResponse.json(
        { error: 'Acesso negado: usuário não autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const status = searchParams.get('status')
    const serviceType = searchParams.get('serviceType')

    // Build where clause
    const whereClause: any = {
      userId: user.id
    }

    if (status) {
      whereClause.status = status
    }

    if (serviceType) {
      whereClause.serviceType = serviceType
    }

    // Calculate offset
    const offset = (page - 1) * limit

    // Fetch orders with documents
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          documents: {
            where: {
              isActive: true
            },
            orderBy: {
              uploadedAt: 'desc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.order.count({ where: whereClause })
    ])

    // Format the response
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      serviceType: order.serviceType,
      status: order.status,
      paymentStatus: order.paymentStatus,
      documentNumber: order.documentNumber,
      documentType: order.documentType,
      amount: order.amount,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      
      // Include documents
      documents: order.documents.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        documentType: doc.documentType,
        uploadedAt: doc.uploadedAt,
        downloadCount: doc.downloadCount,
        expiresAt: doc.expiresAt,
        downloadToken: doc.downloadToken // Include for secure downloads
      }))
    }))

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit
      }
    })

  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}