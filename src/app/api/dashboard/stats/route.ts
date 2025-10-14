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

    // Get dashboard statistics from real database
    const [
      orders
    ] = await Promise.all([
      // Get orders with their status and documents
      prisma.order.findMany({
        where: { userId },
        select: {
          id: true,
          status: true,
          serviceType: true,
          amount: true,
          createdAt: true,
          resultText: true,
          documents: {
            where: { isActive: true },
            select: {
              id: true
            }
          }
        }
      })
    ])

    // Count different types of services
    const protestQueryOrders = orders.filter(o => o.serviceType === 'PROTEST_QUERY').length
    const certificateOrders = orders.filter(o => o.serviceType === 'CERTIFICATE_REQUEST').length

    // Count completed documents (status COMPLETED AND has attached document)
    const completedOrders = orders.filter(order =>
      order.status === 'COMPLETED' && order.documents.length > 0
    ).length

    // Count protests found from resultText (mock data shows if protests were found)
    let protestsFound = 0
    orders.forEach(order => {
      if (order.resultText && order.resultText.includes('protesto')) {
        protestsFound++
      }
    })

    const stats = {
      consultasRealizadas: protestQueryOrders,
      certidoesSolicitadas: certificateOrders,
      protestosEncontrados: protestsFound,
      documentosProntos: completedOrders,
      pedidosTotal: orders.length,
      pedidosCompletos: completedOrders
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}