import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { asaasService } from '@/lib/payment/asaas'

export async function GET() {
  try {
    const cookieStore = await cookies()
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
    let orders = await prisma.order.findMany({
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
        asaasPaymentId: true, // For sync
        metadata: true, // For sync
        userId: true, // For sync
        paidAt: true, // For sync
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

    // Sync payment status for PENDING orders
    orders = await Promise.all(
      orders.map(async (order) => {
        if (order.paymentStatus === 'PENDING' && order.asaasPaymentId) {
          try {
            console.log(`🔄 [Dashboard] Syncing payment status for order #${order.orderNumber}`)

            const asaasPayment = await asaasService.getPayment(order.asaasPaymentId)
            console.log(`   DB status: ${order.paymentStatus} → ASAAS status: ${asaasPayment.status}`)

            if (asaasPayment.status !== order.paymentStatus) {
              const isPaid = asaasPayment.status === 'CONFIRMED' || asaasPayment.status === 'RECEIVED'
              console.log(`   ✅ Updating order status`)

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
                  notes: `[Dashboard] Status sincronizado do ASAAS: ${order.paymentStatus} → ${asaasPayment.status}`,
                  metadata: {
                    autoSync: true,
                    source: 'dashboard',
                    oldPaymentStatus: order.paymentStatus,
                    newPaymentStatus: asaasPayment.status
                  }
                }
              })

              return updatedOrder
            }
          } catch (error) {
            console.error(`❌ Error syncing payment for order #${order.orderNumber}:`, (error as Error).message)
          }
        }
        return order
      })
    )

    // Separate orders by type
    const protestQueryOrders = orders.filter(o => o.serviceType === 'PROTEST_QUERY')
    const certificateOrders = orders.filter(o => o.serviceType === 'CERTIFICATE_REQUEST')

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
    const transformedCertificates = certificateOrders.map(order => {
      // Extract certificate info from metadata if available
      const metadata = order.metadata as any
      const certificateType = metadata?.certificateType || 'POSITIVE'
      const state = metadata?.state || ''
      const city = metadata?.city || ''

      return {
        id: order.id,
        type: 'Certidão de Protesto',
        document: order.documentNumber || '',
        documentType: order.documentType || 'CPF',
        requestDate: order.createdAt.toISOString(),
        status: order.status.toLowerCase(),
        state: state,
        city: city,
        documentUrl: order.documents[0]?.downloadToken
          ? `/api/download/${order.documents[0].downloadToken}`
          : null
      }
    })

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

    // Calculate statistics
    const stats = {
      protestQueriesCount: protestQueryOrders.length,
      certificatesCount: certificateOrders.length,
      protestsFoundCount: protestQueryOrders.reduce((sum, order) => {
        if (order.status === 'COMPLETED' && order.resultText) {
          const resultLower = order.resultText.toLowerCase()
          const protestMatch = resultLower.match(/(\d+)\s*protesto/i)
          if (protestMatch) {
            return sum + parseInt(protestMatch[1])
          } else if (resultLower.includes('protesto') && !resultLower.includes('sem protesto')) {
            return sum + 1
          }
        }
        return sum
      }, 0),
      completedOrdersCount: orders.filter(o => o.status === 'COMPLETED').length
    }

    return NextResponse.json({
      stats,
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