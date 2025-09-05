import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/admin/leads - List and filter leads
export async function GET(request: Request) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Filters
    const status = searchParams.get('status')
    const stage = searchParams.get('stage')
    const source = searchParams.get('source')
    const search = searchParams.get('search')
    const minScore = searchParams.get('minScore')
    const maxScore = searchParams.get('maxScore')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const converted = searchParams.get('converted')

    // Build where clause
    const where: any = {}
    
    if (status) where.status = status
    if (stage) where.stage = stage
    if (source) where.source = { contains: source, mode: 'insensitive' }
    if (converted !== null && converted !== undefined) {
      where.converted = converted === 'true'
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { documentNumber: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (minScore || maxScore) {
      where.score = {}
      if (minScore) where.score.gte = parseInt(minScore)
      if (maxScore) where.score.lte = parseInt(maxScore)
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }

    // Fetch leads with pagination
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          consultations_records: {
            select: { id: true, createdAt: true, status: true }
          },
          _count: {
            select: { consultations_records: true }
          }
        }
      }),
      prisma.lead.count({ where })
    ])

    // Calculate summary statistics
    const stats = await prisma.lead.aggregate({
      where,
      _avg: { score: true },
      _count: { id: true }
    })

    const conversionStats = await prisma.lead.groupBy({
      by: ['converted'],
      where,
      _count: { id: true }
    })

    const statusStats = await prisma.lead.groupBy({
      by: ['status'],
      where,
      _count: { id: true }
    })

    const stageStats = await prisma.lead.groupBy({
      by: ['stage'],
      where,
      _count: { id: true }
    })

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        total: stats._count.id,
        averageScore: Math.round(stats._avg.score || 0),
        conversion: {
          converted: conversionStats.find(s => s.converted)?._count.id || 0,
          notConverted: conversionStats.find(s => !s.converted)?._count.id || 0
        },
        byStatus: statusStats.reduce((acc, s) => ({ ...acc, [s.status]: s._count.id }), {}),
        byStage: stageStats.reduce((acc, s) => ({ ...acc, [s.stage]: s._count.id }), {})
      }
    })

  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/leads - Update lead status or create manual lead
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      action,
      leadId,
      status,
      stage,
      score,
      notes,
      // For manual lead creation
      documentNumber,
      name,
      phone,
      email,
      source
    } = body

    if (action === 'update' && leadId) {
      // Update existing lead
      const updateData: any = { lastActivity: new Date() }
      
      if (status) updateData.status = status
      if (stage) updateData.stage = stage
      if (score !== undefined) updateData.score = score
      if (notes) updateData.notes = notes

      const lead = await prisma.lead.update({
        where: { id: leadId },
        data: updateData,
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { consultations_records: true } }
        }
      })

      return NextResponse.json({ success: true, lead })
      
    } else if (action === 'create') {
      // Create manual lead
      if (!documentNumber || !name) {
        return NextResponse.json(
          { error: 'Document number and name are required' },
          { status: 400 }
        )
      }

      const lead = await prisma.lead.create({
        data: {
          documentNumber,
          name,
          phone,
          email,
          source: source || 'manual_admin',
          status: 'NEW',
          stage: 'FORM_FILLED',
          score: 20, // Base score for manual leads
          notes
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { consultations_records: true } }
        }
      })

      return NextResponse.json({ success: true, lead })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Error in lead operation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}