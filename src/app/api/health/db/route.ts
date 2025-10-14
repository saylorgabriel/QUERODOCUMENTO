import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const startTime = Date.now()

    // Test database connection with a simple query
    await prisma.$queryRaw`SELECT 1`

    const responseTime = Date.now() - startTime

    // Get some basic stats
    const [userCount, orderCount, leadCount] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.lead.count(),
    ])

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      stats: {
        users: userCount,
        orders: orderCount,
        leads: leadCount,
      },
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    console.error('Database health check failed:', error)

    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
      { status: 503 }
    )
  }
}
