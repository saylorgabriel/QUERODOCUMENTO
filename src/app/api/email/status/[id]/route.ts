/**
 * API Endpoint: Check Email Status
 * GET /api/email/status/[id]
 * 
 * Check the delivery status of a specific email by ID
 * Returns delivery information, tracking data, and bounce status
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check authentication
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Get user info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, role: true }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    const emailId = params.id
    
    // Find email log
    const emailLog = await prisma.emailLog.findUnique({
      where: { id: emailId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        order: {
          select: { id: true, orderNumber: true, serviceType: true }
        }
      }
    })
    
    if (!emailLog) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      )
    }
    
    // Authorization check
    // Admins can view any email, users can only view their own emails
    const isAdmin = ['ADMIN', 'SUPPORT'].includes(user.role)
    const isOwner = emailLog.userId === user.id
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }
    
    // Get bounce information if available
    const bounces = await prisma.emailBounce.findMany({
      where: { emailLogId: emailId },
      orderBy: { timestamp: 'desc' }
    })
    
    // Parse metadata if it exists
    let metadata: Record<string, any> = {}
    if (emailLog.metadata) {
      try {
        metadata = JSON.parse(emailLog.metadata)
      } catch (error) {
        console.error('Failed to parse email metadata:', error)
      }
    }
    
    // Calculate delivery metrics
    const deliveryMetrics = {
      sent: emailLog.sentAt !== null,
      delivered: emailLog.deliveredAt !== null,
      opened: emailLog.openedAt !== null,
      clicked: emailLog.clickedAt !== null,
      bounced: bounces.length > 0,
      failed: emailLog.status === 'FAILED',
      timings: {
        created: emailLog.createdAt,
        sent: emailLog.sentAt,
        delivered: emailLog.deliveredAt,
        opened: emailLog.openedAt,
        clicked: emailLog.clickedAt,
      }
    }
    
    // Calculate delivery time if available
    let deliveryTime: number | null = null
    if (emailLog.sentAt && emailLog.deliveredAt) {
      deliveryTime = emailLog.deliveredAt.getTime() - emailLog.sentAt.getTime()
    }
    
    // Build response based on user role
    const responseData: any = {
      id: emailLog.id,
      status: emailLog.status,
      provider: emailLog.provider,
      messageId: emailLog.messageId,
      subject: emailLog.subject,
      to: emailLog.to,
      createdAt: emailLog.createdAt,
      deliveryMetrics,
      deliveryTime,
      retryCount: emailLog.retryCount,
      bounces: bounces.map(bounce => ({
        type: bounce.bounceType,
        reason: bounce.reason,
        timestamp: bounce.timestamp,
        diagnosticCode: bounce.diagnosticCode
      }))
    }
    
    // Add additional details for admins
    if (isAdmin) {
      responseData.from = emailLog.from
      responseData.templateName = emailLog.templateName
      responseData.metadata = metadata
      responseData.error = emailLog.error
      responseData.user = emailLog.user
      responseData.order = emailLog.order
    }
    
    return NextResponse.json(responseData)
    
  } catch (error: any) {
    console.error('Email status check error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get email status',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}

// POST method to update email status (for webhooks)
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const emailId = params.id
    const body = await request.json()
    
    // Validate webhook signature if needed
    // This would typically involve checking a signature from the email provider
    // For now, we'll implement basic validation
    
    const { status, deliveredAt, openedAt, clickedAt, bounceData } = body
    
    // Update email log
    const updateData: any = {}
    
    if (status) {
      updateData.status = status.toUpperCase()
    }
    
    if (deliveredAt) {
      updateData.deliveredAt = new Date(deliveredAt)
    }
    
    if (openedAt) {
      updateData.openedAt = new Date(openedAt)
    }
    
    if (clickedAt) {
      updateData.clickedAt = new Date(clickedAt)
    }
    
    const updatedEmailLog = await prisma.emailLog.update({
      where: { id: emailId },
      data: updateData
    })
    
    // Handle bounce data if provided
    if (bounceData) {
      await prisma.emailBounce.create({
        data: {
          emailLogId: emailId,
          email: bounceData.email || updatedEmailLog.to,
          bounceType: bounceData.type?.toUpperCase() || 'HARD',
          reason: bounceData.reason,
          provider: updatedEmailLog.provider,
          messageId: updatedEmailLog.messageId,
          diagnosticCode: bounceData.diagnosticCode,
          action: bounceData.action,
          status: bounceData.status,
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Email status updated successfully',
      emailId,
      status: updatedEmailLog.status
    })
    
  } catch (error: any) {
    console.error('Email status update error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to update email status',
        message: error.message || 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}