import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

interface LeadCaptureRequest {
  documentNumber: string
  name: string
  phone?: string
  email?: string
  source?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  metadata?: Record<string, any>
}

export async function POST(request: Request) {
  try {
    const body: LeadCaptureRequest = await request.json()
    
    const {
      documentNumber,
      name,
      phone,
      email,
      source = 'landing_page',
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      metadata = {}
    } = body

    // Validate required fields
    if (!documentNumber || !name) {
      return NextResponse.json(
        { error: 'CPF/CNPJ e nome são obrigatórios' },
        { status: 400 }
      )
    }

    // Get client IP and user agent for tracking
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Add IP and user agent to metadata
    const enrichedMetadata = {
      ...metadata,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    }

    try {
      // Try to update existing lead first
      const existingLead = await prisma.lead.findUnique({
        where: { documentNumber }
      })

      let lead
      
      if (existingLead) {
        // Update existing lead with new information
        lead = await prisma.lead.update({
          where: { documentNumber },
          data: {
            name, // Update name in case it changed
            phone: phone || existingLead.phone, // Keep existing phone if not provided
            email: email || existingLead.email, // Keep existing email if not provided
            lastActivity: new Date(),
            metadata: JSON.stringify(enrichedMetadata),
            // Update UTM parameters if provided
            ...(utm_source && { utm_source }),
            ...(utm_medium && { utm_medium }),
            ...(utm_campaign && { utm_campaign }),
            ...(utm_content && { utm_content }),
            ...(utm_term && { utm_term }),
          }
        })
      } else {
        // Create new lead
        lead = await prisma.lead.create({
          data: {
            documentNumber,
            name,
            phone,
            email,
            source,
            utm_source,
            utm_medium,
            utm_campaign,
            utm_content,
            utm_term,
            status: 'NEW',
            stage: 'FORM_FILLED',
            score: calculateInitialLeadScore({ name, phone, email, source }),
            metadata: JSON.stringify(enrichedMetadata)
          }
        })
      }

      // Log the lead capture for analytics
      console.log(`Lead captured/updated: ${documentNumber} - ${name} (${source})`)

      return NextResponse.json({
        success: true,
        leadId: lead.id,
        isNewLead: !existingLead,
        message: existingLead 
          ? 'Lead atualizado com sucesso' 
          : 'Lead capturado com sucesso'
      })

    } catch (prismaError) {
      console.error('Prisma error:', prismaError)
      
      // Handle unique constraint violation gracefully
      if (prismaError instanceof Prisma.PrismaClientKnownRequestError) {
        if (prismaError.code === 'P2002') {
          // Unique constraint failed - try to update instead
          const lead = await prisma.lead.update({
            where: { documentNumber },
            data: {
              name,
              phone: phone || undefined,
              email: email || undefined,
              lastActivity: new Date(),
              metadata: JSON.stringify(enrichedMetadata)
            }
          })
          
          return NextResponse.json({
            success: true,
            leadId: lead.id,
            isNewLead: false,
            message: 'Lead atualizado com sucesso'
          })
        }
      }
      
      throw prismaError
    }

  } catch (error) {
    console.error('Error capturing lead:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// Calculate initial lead score based on available data
function calculateInitialLeadScore(data: {
  name: string
  phone?: string
  email?: string
  source?: string
}): number {
  let score = 10 // Base score

  // Name quality
  if (data.name.trim().split(' ').length >= 2) {
    score += 10 // Has full name
  }

  // Contact information
  if (data.phone) {
    score += 20 // Has phone
  }

  if (data.email) {
    score += 25 // Has email
  }

  // Source quality
  switch (data.source) {
    case 'google_ads':
      score += 15
      break
    case 'facebook_ads':
      score += 10
      break
    case 'organic':
      score += 20
      break
    case 'direct':
      score += 25
      break
    default:
      score += 5
  }

  return Math.min(score, 100) // Cap at 100
}

// GET method for lead lookup (optional, for debugging)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const documentNumber = searchParams.get('document')
  
  if (!documentNumber) {
    return NextResponse.json({ error: 'Document number required' }, { status: 400 })
  }

  try {
    const lead = await prisma.lead.findUnique({
      where: { documentNumber },
      select: {
        id: true,
        documentNumber: true,
        name: true,
        phone: true,
        email: true,
        status: true,
        stage: true,
        score: true,
        consultations: true,
        converted: true,
        createdAt: true,
        lastActivity: true
      }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({ lead })
  } catch (error) {
    console.error('Error fetching lead:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}