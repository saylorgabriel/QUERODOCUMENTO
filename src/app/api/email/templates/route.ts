/**
 * API Endpoint: Email Templates
 * GET /api/email/templates
 * POST /api/email/templates/preview
 * 
 * List available email templates and preview them with sample data
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getEmailTemplates, EmailTemplate } from '@/lib/email/email-config'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Get list of all available email templates
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, role: true }
    })
    
    if (!user || !['ADMIN', 'SUPPORT'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    // Get all available templates
    const templates = getEmailTemplates()
    
    // Get usage statistics for templates
    const templateStats = await prisma.emailLog.groupBy({
      by: ['templateName'],
      where: {
        templateName: { not: null },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      _count: {
        id: true
      },
      _avg: {
        retryCount: true
      }
    })
    
    // Build response with usage stats
    const templatesWithStats = Object.entries(templates).map(([key, template]) => {
      const stats = templateStats.find(stat => stat.templateName === key)
      
      return {
        key,
        name: template.name,
        subject: template.subject,
        variables: template.variables,
        usage: {
          totalSent: stats?._count.id || 0,
          averageRetries: stats?._avg.retryCount || 0
        }
      }
    })
    
    return NextResponse.json({
      templates: templatesWithStats,
      totalTemplates: templatesWithStats.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Email templates list error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get email templates',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

// Preview email template with sample or provided data
const previewSchema = z.object({
  templateName: z.string().min(1, 'Template name is required'),
  variables: z.record(z.any()).optional(),
  useSampleData: z.boolean().default(true)
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, role: true }
    })
    
    if (!user || !['ADMIN', 'SUPPORT'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    // Parse and validate request body
    const body = await request.json()
    const validationResult = previewSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }
    
    const { templateName, variables, useSampleData } = validationResult.data
    
    // Get available templates
    const templates = getEmailTemplates()
    const template = templates[templateName]
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }
    
    // Prepare template variables
    let templateVariables: Record<string, any> = {}
    
    if (useSampleData || !variables) {
      // Generate sample data based on template requirements
      templateVariables = generateSampleData(template)
    } else {
      templateVariables = variables
    }
    
    // Load and process template content
    const processedTemplate = await processEmailTemplate(template, templateVariables)
    
    return NextResponse.json({
      template: {
        name: template.name,
        subject: processedTemplate.subject,
        variables: templateVariables,
        requiredVariables: template.variables
      },
      preview: {
        html: processedTemplate.html,
        text: processedTemplate.text,
        subject: processedTemplate.subject
      },
      metadata: {
        processedAt: new Date().toISOString(),
        usedSampleData: useSampleData || !variables
      }
    })
    
  } catch (error: any) {
    console.error('Email template preview error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to preview email template',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

/**
 * Generate sample data for template variables
 */
function generateSampleData(template: EmailTemplate): Record<string, any> {
  const sampleData: Record<string, any> = {}
  
  for (const variable of template.variables) {
    switch (variable) {
      case 'name':
        sampleData[variable] = 'João Silva'
        break
      case 'email':
        sampleData[variable] = 'joao.silva@example.com'
        break
      case 'orderNumber':
        sampleData[variable] = 'QD-2025-001234'
        break
      case 'amount':
        sampleData[variable] = 'R$ 89,90'
        break
      case 'serviceType':
        sampleData[variable] = 'Consulta de Protesto'
        break
      case 'paymentMethod':
        sampleData[variable] = 'PIX'
        break
      case 'resetUrl':
        sampleData[variable] = 'https://querodocumento.com.br/auth/reset-password?token=sample123'
        break
      case 'downloadUrl':
        sampleData[variable] = 'https://querodocumento.com.br/orders/123/download'
        break
      default:
        sampleData[variable] = `[${variable}]`
    }
  }
  
  return sampleData
}

/**
 * Process email template with variables
 * In a real implementation, you'd load actual template files
 */
async function processEmailTemplate(
  template: EmailTemplate,
  variables: Record<string, any>
): Promise<{ html: string; text: string; subject: string }> {
  // This is a simplified implementation
  // In production, you'd load actual template files from disk or database
  
  let subject = template.subject
  let html = getTemplateHTML(template.htmlTemplate)
  let text = getTemplateText(template.textTemplate)
  
  // Replace variables in all content
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    subject = subject.replace(regex, String(value))
    html = html.replace(regex, String(value))
    text = text.replace(regex, String(value))
  }
  
  return { html, text, subject }
}

/**
 * Get HTML template content (placeholder implementation)
 */
function getTemplateHTML(templateFile: string): string {
  // In a real implementation, you'd load this from files
  const baseHTML = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>{{subject}}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>QueroDocumento</h1>
        </div>
        <div class="content">
          <p>Olá {{name}},</p>
          <p>Esta é uma visualização do template de email.</p>
          <p><a href="#" class="button">Botão de Exemplo</a></p>
        </div>
      </div>
    </body>
    </html>
  `
  
  return baseHTML
}

/**
 * Get text template content (placeholder implementation)
 */
function getTemplateText(templateFile?: string): string {
  return `
QueroDocumento

Olá {{name}},

Esta é uma visualização do template de email em formato texto.

Atenciosamente,
Equipe QueroDocumento
  `.trim()
}