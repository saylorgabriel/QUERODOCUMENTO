import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('simple-session')
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const sessionData = JSON.parse(sessionCookie.value)
    
    // Check if session hasn't expired
    const expires = new Date(sessionData.expires)
    if (expires <= new Date()) {
      return NextResponse.json({ error: 'Sessão expirada' }, { status: 401 })
    }

    const userId = sessionData.user.id

    // Get real data from database
    const orders = await prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        orderNumber: true,
        serviceType: true,
        status: true,
        documentNumber: true,
        documentType: true,
        amount: true,
        paymentStatus: true,
        resultText: true,
        createdAt: true,
        updatedAt: true,
        documents: {
          where: { isActive: true },
          select: {
            id: true,
            filename: true,
            documentType: true,
            downloadToken: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Separate orders by type
    const protestQueryOrders = orders.filter(o => o.serviceType === 'PROTEST_QUERY')
    const certificateOrders = orders.filter(o => o.serviceType === 'CERTIFICATE')

    // Transform protest query orders for frontend
    const transformedQueries = protestQueryOrders.map(order => {
      // Only show protests count if order is COMPLETED
      // Otherwise it's still being processed
      let protestsCount = null // null means "processing" or "not ready yet"

      if (order.status === 'COMPLETED') {
        // Default to 0 (no protests) if completed
        protestsCount = 0

        // Check if result text indicates protests found
        if (order.resultText) {
          const resultLower = order.resultText.toLowerCase()

          // Try to extract number of protests from result text
          const protestMatch = resultLower.match(/(\d+)\s*protesto/i)
          if (protestMatch) {
            protestsCount = parseInt(protestMatch[1])
          } else if (resultLower.includes('protesto') && !resultLower.includes('sem protesto')) {
            protestsCount = 1 // At least one protest found
          }
        }
      }

      return {
        id: order.id,
        document: order.documentNumber,
        documentType: order.documentType,
        date: order.createdAt.toISOString().split('T')[0],
        status: order.status.toLowerCase(),
        protests: protestsCount, // null = processing, number = result
        documentUrl: order.documents[0]?.downloadToken
          ? `/api/download/${order.documents[0].downloadToken}`
          : null
      }
    })

    // Transform certificate orders for frontend
    const transformedCertificates = certificateOrders.map(order => ({
      id: order.id,
      type: 'Certidão de Protesto',
      document: order.documentNumber,
      documentType: order.documentType,
      requestDate: order.createdAt.toISOString().split('T')[0],
      status: order.status.toLowerCase(),
      documentUrl: order.documents[0]?.downloadToken
        ? `/api/download/${order.documents[0].downloadToken}`
        : null
    }))

    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      serviceType: order.serviceType,
      status: order.status,
      document: order.documentNumber,
      documentType: order.documentType,
      amount: order.amount,
      paymentStatus: order.paymentStatus,
      date: order.createdAt.toISOString().split('T')[0],
      documents: order.documents.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        type: doc.documentType,
        downloadUrl: doc.downloadToken ? `/api/download/${doc.downloadToken}` : null
      }))
    }))

    return NextResponse.json({
      protestQueries: transformedQueries,
      certificates: transformedCertificates, 
      orders: transformedOrders
    })
  } catch (error) {
    console.error('Dashboard data error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados' },
      { status: 500 }
    )
  }
}