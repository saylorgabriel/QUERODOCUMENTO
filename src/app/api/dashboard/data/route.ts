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
    const [protestQueries, certificates, orders] = await Promise.all([
      // Get protest queries with their results
      prisma.protestQuery.findMany({
        where: { userId },
        select: {
          id: true,
          document: true,
          documentType: true,
          status: true,
          result: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      
      // Get certificates 
      prisma.certificate.findMany({
        where: { userId },
        include: {
          query: {
            select: {
              document: true,
              documentType: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      
      // Get orders
      prisma.order.findMany({
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
    ])

    // Transform data for frontend consumption
    const transformedQueries = protestQueries.map(query => {
      let protestsCount = 0
      
      // Extract protest count from result JSON
      if (query.result && typeof query.result === 'object') {
        const result = query.result as any
        if (result.protests && Array.isArray(result.protests)) {
          protestsCount = result.protests.length
        }
      }

      return {
        id: query.id,
        document: query.document,
        documentType: query.documentType,
        date: query.createdAt.toISOString().split('T')[0],
        status: query.status.toLowerCase(),
        protests: protestsCount,
        documentUrl: null // Will be null until we implement PDF generation
      }
    })

    const transformedCertificates = certificates.map(cert => ({
      id: cert.id,
      type: cert.type === 'NEGATIVE' ? 'Certidão Negativa' : 
            cert.type === 'POSITIVE' ? 'Certidão Positiva' : 'Certidão Detalhada',
      document: cert.query.document,
      documentType: cert.query.documentType,
      requestDate: cert.createdAt.toISOString().split('T')[0],
      status: cert.status.toLowerCase(),
      documentUrl: cert.documentUrl
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