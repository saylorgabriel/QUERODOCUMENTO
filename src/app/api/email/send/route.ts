/**
 * API Endpoint: Send Email
 * POST /api/email/send
 * 
 * Allows admins to manually send emails through the email service
 * Supports all configured providers with automatic fallback
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { emailService, EmailMessage } from '@/lib/email/email-service'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for email sending
const sendEmailSchema = z.object({
  to: z.union([
    z.string().email('Invalid email address'),
    z.array(z.string().email('Invalid email address')).min(1, 'At least one recipient required')
  ]),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  html: z.string().optional(),
  text: z.string().optional(),
  from: z.string().email('Invalid from email address').optional(),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  template: z.object({
    name: z.string(),
    variables: z.record(z.any())
  }).optional(),
  metadata: z.record(z.string()).optional(),
  orderId: z.string().optional(),
  userId: z.string().optional(),
}).refine(
  (data) => data.html || data.text || data.template,
  {
    message: "At least one of 'html', 'text', or 'template' must be provided",
    path: ['html']
  }
)

export async function POST(request: NextRequest) {
  try {
    // Check authentication - only admins can manually send emails
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
    const validationResult = sendEmailSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.errors
        },
        { status: 400 }
      )
    }
    
    const emailData = validationResult.data
    
    // Prepare email message
    const emailMessage: EmailMessage = {
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      from: emailData.from,
      priority: emailData.priority,
      template: emailData.template,
      metadata: {
        ...emailData.metadata,
        sentBy: user.id,
        sentViaAPI: 'true',
        timestamp: new Date().toISOString(),
      }
    }
    
    // Add order and user associations if provided
    if (emailData.orderId) {
      emailMessage.metadata!.orderId = emailData.orderId
    }
    
    if (emailData.userId) {
      emailMessage.metadata!.targetUserId = emailData.userId
    }
    
    // Send email
    const result = await emailService.sendEmail(emailMessage)
    
    if (result.success) {
      // Log the successful send in audit logs
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'EMAIL_SEND',
          resource: 'EMAIL',
          resourceId: result.messageId,
          metadata: {
            to: emailData.to,
            subject: emailData.subject,
            provider: result.provider,
            messageId: result.messageId,
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      })
      
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        provider: result.provider,
        retries: result.retries || 0,
        message: 'Email sent successfully'
      })
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: result.error,
          provider: result.provider,
          retries: result.retries || 0
        },
        { status: 500 }
      )
    }
    
  } catch (error: any) {
    console.error('Email send API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

// GET method to check email service status
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
    
    // Get service information
    const serviceInfo = emailService.getServiceInfo()
    
    // Test connections to all providers
    const connectionTests = await emailService.testConnections()
    
    // Get recent email statistics
    const stats = await emailService.getEmailStats(7) // Last 7 days
    
    return NextResponse.json({
      serviceInfo,
      connectionTests,
      stats,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Email service status error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get email service status',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}