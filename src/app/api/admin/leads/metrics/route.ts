import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const periodDays = parseInt(period)
    
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - periodDays)

    // Overall metrics
    const [
      totalLeads,
      newLeadsCount,
      convertedLeads,
      averageScore,
      leadsBySource,
      leadsByStage,
      leadsByStatus,
      conversionFunnel,
      recentActivity,
      topPerformingSources
    ] = await Promise.all([
      // Total leads ever
      prisma.lead.count(),
      
      // New leads in period
      prisma.lead.count({
        where: { createdAt: { gte: dateFrom } }
      }),
      
      // Converted leads
      prisma.lead.count({
        where: { converted: true }
      }),
      
      // Average score
      prisma.lead.aggregate({
        _avg: { score: true }
      }),
      
      // Leads by source
      prisma.lead.groupBy({
        by: ['source'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }),
      
      // Leads by stage
      prisma.lead.groupBy({
        by: ['stage'],
        _count: { id: true }
      }),
      
      // Leads by status
      prisma.lead.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      
      // Conversion funnel
      prisma.lead.groupBy({
        by: ['stage'],
        _count: { id: true },
        where: { createdAt: { gte: dateFrom } }
      }),
      
      // Recent activity (last 7 days by day)
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as leads_count
        FROM "Lead"
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `,
      
      // Top performing sources by conversion
      prisma.$queryRaw`
        SELECT 
          source,
          COUNT(*) as total_leads,
          COUNT(CASE WHEN converted = true THEN 1 END) as converted_leads,
          ROUND(
            (COUNT(CASE WHEN converted = true THEN 1 END) * 100.0 / COUNT(*)), 2
          ) as conversion_rate,
          AVG(score) as avg_score
        FROM "Lead"
        WHERE source IS NOT NULL
        GROUP BY source
        HAVING COUNT(*) >= 5
        ORDER BY conversion_rate DESC, total_leads DESC
        LIMIT 10
      `
    ])

    // Calculate conversion rate
    const conversionRate = totalLeads > 0 
      ? Math.round((convertedLeads * 100) / totalLeads) 
      : 0

    // Format funnel data
    const stageOrder = ['FORM_FILLED', 'CONSULTATION', 'QUOTE_REQUESTED', 'PAYMENT_STARTED', 'CUSTOMER']
    const funnelData = stageOrder.map(stage => {
      const stageData = conversionFunnel.find(f => f.stage === stage)
      return {
        stage,
        count: stageData?._count.id || 0,
        percentage: totalLeads > 0 ? Math.round(((stageData?._count.id || 0) * 100) / totalLeads) : 0
      }
    })

    // Lead score distribution
    const scoreDistribution = await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN score BETWEEN 0 AND 20 THEN '0-20'
          WHEN score BETWEEN 21 AND 40 THEN '21-40'
          WHEN score BETWEEN 41 AND 60 THEN '41-60'
          WHEN score BETWEEN 61 AND 80 THEN '61-80'
          WHEN score BETWEEN 81 AND 100 THEN '81-100'
          ELSE 'Unknown'
        END as score_range,
        COUNT(*) as count
      FROM "Lead"
      GROUP BY 
        CASE 
          WHEN score BETWEEN 0 AND 20 THEN '0-20'
          WHEN score BETWEEN 21 AND 40 THEN '21-40'
          WHEN score BETWEEN 41 AND 60 THEN '41-60'
          WHEN score BETWEEN 61 AND 80 THEN '61-80'
          WHEN score BETWEEN 81 AND 100 THEN '81-100'
          ELSE 'Unknown'
        END
      ORDER BY score_range
    `

    // Email marketing metrics
    const emailMetrics = await prisma.lead.aggregate({
      _sum: {
        emailsSent: true,
        emailOpens: true,
        emailClicks: true
      },
      _count: {
        id: true
      },
      where: {
        emailsSent: { gt: 0 }
      }
    })

    const emailEngagementRate = emailMetrics._sum.emailsSent && emailMetrics._sum.emailsSent > 0
      ? Math.round((emailMetrics._sum.emailOpens || 0) * 100 / emailMetrics._sum.emailsSent)
      : 0

    const emailClickRate = emailMetrics._sum.emailOpens && emailMetrics._sum.emailOpens > 0
      ? Math.round((emailMetrics._sum.emailClicks || 0) * 100 / emailMetrics._sum.emailOpens)
      : 0

    return NextResponse.json({
      overview: {
        totalLeads,
        newLeads: newLeadsCount,
        convertedLeads,
        conversionRate,
        averageScore: Math.round(averageScore._avg.score || 0)
      },
      sources: leadsBySource.map(s => ({
        name: s.source || 'Unknown',
        count: s._count.id
      })),
      stages: leadsByStage.map(s => ({
        name: s.stage,
        count: s._count.id
      })),
      statuses: leadsByStatus.map(s => ({
        name: s.status,
        count: s._count.id
      })),
      funnel: funnelData,
      activity: recentActivity,
      topSources: topPerformingSources,
      scoreDistribution,
      email: {
        totalSent: emailMetrics._sum.emailsSent || 0,
        totalOpens: emailMetrics._sum.emailOpens || 0,
        totalClicks: emailMetrics._sum.emailClicks || 0,
        engagementRate: emailEngagementRate,
        clickRate: emailClickRate,
        activeLeads: emailMetrics._count.id
      }
    })

  } catch (error) {
    console.error('Error fetching lead metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}