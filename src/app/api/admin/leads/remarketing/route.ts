import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// POST /api/admin/leads/remarketing - Send remarketing emails
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      action,
      filters = {},
      emailTemplate,
      subject,
      leadIds
    } = body

    if (action === 'send_email') {
      // Build where clause for filtering leads
      const where: any = {
        unsubscribed: false, // Never send to unsubscribed leads
        email: { not: null } // Must have email
      }

      // Apply filters
      if (filters.status) where.status = filters.status
      if (filters.stage) where.stage = filters.stage  
      if (filters.source) where.source = { contains: filters.source, mode: 'insensitive' }
      if (filters.minScore) where.score = { ...where.score, gte: filters.minScore }
      if (filters.maxScore) where.score = { ...where.score, lte: filters.maxScore }
      if (filters.lastEmailDaysAgo) {
        const daysAgo = new Date()
        daysAgo.setDate(daysAgo.getDate() - filters.lastEmailDaysAgo)
        where.OR = [
          { lastEmailSent: null },
          { lastEmailSent: { lt: daysAgo } }
        ]
      }

      // If specific leadIds provided, use those instead
      if (leadIds && leadIds.length > 0) {
        where.id = { in: leadIds }
      }

      // Get leads to send emails to
      const leads = await prisma.lead.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          documentNumber: true,
          phone: true,
          status: true,
          stage: true,
          score: true
        }
      })

      if (leads.length === 0) {
        return NextResponse.json({ 
          success: false, 
          message: 'Nenhuma lead encontrada com os filtros aplicados' 
        })
      }

      // Queue emails for sending
      const emailQueuePromises = leads.map(lead => {
        // Personalize email content
        const personalizedContent = emailTemplate
          .replace(/\{nome\}/g, lead.name)
          .replace(/\{documento\}/g, lead.documentNumber)
          .replace(/\{score\}/g, lead.score.toString())

        const personalizedSubject = subject
          .replace(/\{nome\}/g, lead.name)

        return prisma.emailQueue.create({
          data: {
            to: lead.email!,
            from: 'noreply@querodocumento.com.br',
            subject: personalizedSubject,
            body: personalizedContent,
            templateName: 'remarketing',
            priority: 'NORMAL',
            metadata: JSON.stringify({
              leadId: lead.id,
              campaign: 'remarketing',
              leadScore: lead.score,
              leadStage: lead.stage,
              timestamp: new Date().toISOString()
            })
          }
        })
      })

      // Update leads with email sent info
      const updateLeadsPromises = leads.map(lead => 
        prisma.lead.update({
          where: { id: lead.id },
          data: {
            lastEmailSent: new Date(),
            emailsSent: { increment: 1 },
            lastActivity: new Date()
          }
        })
      )

      await Promise.all([...emailQueuePromises, ...updateLeadsPromises])

      return NextResponse.json({
        success: true,
        message: `${leads.length} emails adicionados à fila de envio`,
        emailsQueued: leads.length,
        leads: leads.map(l => ({ id: l.id, name: l.name, email: l.email }))
      })

    } else if (action === 'get_preview') {
      // Get leads that match filters for preview
      const where: any = {
        unsubscribed: false,
        email: { not: null }
      }

      if (filters.status) where.status = filters.status
      if (filters.stage) where.stage = filters.stage
      if (filters.source) where.source = { contains: filters.source, mode: 'insensitive' }
      if (filters.minScore) where.score = { ...where.score, gte: filters.minScore }
      if (filters.maxScore) where.score = { ...where.score, lte: filters.maxScore }

      const count = await prisma.lead.count({ where })
      const preview = await prisma.lead.findMany({
        where,
        select: { id: true, name: true, email: true, status: true, stage: true, score: true },
        take: 5
      })

      return NextResponse.json({
        success: true,
        totalLeads: count,
        previewLeads: preview
      })

    } else if (action === 'unsubscribe') {
      // Unsubscribe lead
      const { leadId } = body
      
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          unsubscribed: true,
          status: 'UNSUBSCRIBED',
          lastActivity: new Date()
        }
      })

      return NextResponse.json({ success: true })

    } else if (action === 'track_email_open') {
      // Track email open
      const { leadId } = body
      
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          emailOpens: { increment: 1 },
          lastActivity: new Date()
        }
      })

      return NextResponse.json({ success: true })

    } else if (action === 'track_email_click') {
      // Track email click
      const { leadId } = body
      
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          emailClicks: { increment: 1 },
          lastActivity: new Date()
        }
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Error in remarketing operation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/admin/leads/remarketing - Get remarketing templates and stats
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get email templates
    const templates = [
      {
        id: 'welcome',
        name: 'Boas-vindas',
        subject: 'Bem-vindo(a) {nome}! Sua consulta de protesto está aqui',
        body: `Olá {nome},

Obrigado por usar o QueroDocumento! 

Notamos que você fez uma consulta de protesto recentemente. Que tal finalizar o processo e obter sua certidão oficial?

Com nossa certidão você pode:
✅ Comprovar a ausência de protestos
✅ Realizar financiamentos
✅ Participar de licitações
✅ Abrir contas bancárias

Sua consulta está salva e você pode continuar de onde parou.

[CONTINUAR CONSULTA]

Qualquer dúvida, responda este email ou entre em contato pelo WhatsApp.

Atenciosamente,
Equipe QueroDocumento`
      },
      {
        id: 'abandoned_cart',
        name: 'Carrinho Abandonado',
        subject: '{nome}, finalize sua certidão em apenas 1 clique',
        body: `Oi {nome},

Você estava quase finalizando sua certidão de protesto, mas algo aconteceu pelo caminho.

Não se preocupe! Salvamos tudo para você. Basta clicar no botão abaixo para continuar de onde parou.

[FINALIZAR PEDIDO]

⏰ Certificação em até 2 horas
📧 Enviada por email
🔒 100% seguro e oficial

Ainda tem dúvidas? Responda este email ou chame no WhatsApp.

Abraços,
Equipe QueroDocumento`
      },
      {
        id: 'reactivation',
        name: 'Reativação',
        subject: '{nome}, precisa de uma nova consulta de protesto?',
        body: `Olá {nome},

Há um tempo você utilizou nossos serviços de consulta de protesto.

Como sua situação pode ter mudado, que tal fazer uma nova consulta gratuita?

✨ Consulta 100% gratuita
⚡ Resultado instantâneo
📱 Acesse de qualquer dispositivo

[FAZER NOVA CONSULTA]

Se não desejar mais receber nossos emails, clique aqui para se descadastrar.

Atenciosamente,
QueroDocumento`
      }
    ]

    // Get remarketing stats
    const stats = await Promise.all([
      prisma.lead.count({ where: { email: { not: null }, unsubscribed: false } }),
      prisma.lead.count({ where: { status: 'NEW' } }),
      prisma.lead.count({ where: { stage: 'CONSULTATION', converted: false } }),
      prisma.emailQueue.count({ where: { templateName: 'remarketing', status: 'PENDING' } })
    ])

    return NextResponse.json({
      templates,
      stats: {
        eligibleLeads: stats[0],
        newLeads: stats[1], 
        consultationDropoffs: stats[2],
        emailsPending: stats[3]
      }
    })

  } catch (error) {
    console.error('Error fetching remarketing data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}