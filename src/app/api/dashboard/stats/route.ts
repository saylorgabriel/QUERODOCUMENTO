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
      protestQueries,
      certificates, 
      orders,
      totalProtests
    ] = await Promise.all([
      // Count total protest queries
      prisma.protestQuery.count({
        where: { userId }
      }),
      
      // Count certificates requested
      prisma.certificate.count({
        where: { userId }
      }),
      
      // Get orders with their status
      prisma.order.findMany({
        where: { userId },
        select: {
          id: true,
          status: true,
          serviceType: true,
          amount: true,
          createdAt: true
        }
      }),
      
      // Count total protests found (from query results)
      prisma.protestQuery.findMany({
        where: { 
          userId,
          status: 'COMPLETED',
          result: { not: null }
        },
        select: {
          result: true
        }
      })
    ])

    // Calculate protests found from query results
    let protestsFound = 0
    totalProtests.forEach(query => {
      if (query.result && typeof query.result === 'object') {
        // Assuming the result JSON has a structure like { protests: [...] }
        const result = query.result as any
        if (result.protests && Array.isArray(result.protests)) {
          protestsFound += result.protests.length
        }
      }
    })

    // Count ready documents (certificates and completed orders)
    const readyCertificates = await prisma.certificate.count({
      where: {
        userId,
        status: 'READY'
      }
    })

    const completedOrders = orders.filter(order => order.status === 'COMPLETED').length

    const stats = {
      consultasRealizadas: protestQueries,
      certidoesSolicitadas: certificates, 
      protestosEncontrados: protestsFound,
      documentosProntos: readyCertificates + completedOrders,
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