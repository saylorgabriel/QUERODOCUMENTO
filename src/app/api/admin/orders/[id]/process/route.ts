import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { getEmailTemplate } from '@/lib/email/templates'
import { emailService } from '@/lib/email/email-service'

// Helper function to get user from session
async function getUserFromSession(): Promise<{ id: string; role: string } | null> {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('simple-session')
    
    if (!sessionCookie) {
      return null
    }

    const sessionData = JSON.parse(sessionCookie.value)
    
    // Check if session hasn't expired
    const expires = new Date(sessionData.expires)
    if (expires <= new Date()) {
      return null
    }

    return sessionData.user
  } catch (error) {
    console.error('Session validation error:', error)
    return null
  }
}

// Helper function to validate admin role
function isAdmin(user: { id: string; role: string } | null): boolean {
  return user?.role === 'ADMIN' || user?.role === 'SUPPORT'
}

// Helper function to get status display names
function getStatusDisplayName(status: string): string {
  const statusNames: { [key: string]: string } = {
    'AWAITING_PAYMENT': 'Aguardando Pagamento',
    'PAYMENT_CONFIRMED': 'Pagamento Confirmado',
    'PAYMENT_REFUSED': 'Pagamento Recusado',
    'ORDER_CONFIRMED': 'Pedido Confirmado',
    'AWAITING_QUOTE': 'Aguardando Orçamento',
    'DOCUMENT_REQUESTED': 'Documento Solicitado',
    'PROCESSING': 'Processando',
    'COMPLETED': 'Finalizado',
    'CANCELLED': 'Cancelado'
  }
  
  return statusNames[status] || status
}

// Enhanced email notification function for order completion
async function sendOrderCompletionNotification(
  order: any, 
  quotedAmount?: number
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const serviceTypeName = order.serviceType === 'PROTEST_QUERY' ? 'Consulta de Protesto' : 'Certidão de Protesto'
    const downloadUrl = order.attachmentUrl || `${process.env.NEXTAUTH_URL}/dashboard`
    
    // If there's a quoted amount, it means protests were found - send quote ready email
    if (quotedAmount && quotedAmount > 0) {
      const emailTemplate = getEmailTemplate('quote-ready', {
        name: order.user.name || 'Cliente',
        orderNumber: order.orderNumber,
        serviceType: serviceTypeName,
        amount: `R$ ${quotedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        hasProtests: true,
        protests: [`Foram encontrados protestos em seu nome`],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      })

      const result = await emailService.sendEmail({
        to: order.user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
        metadata: {
          type: 'quote-ready',
          orderNumber: order.orderNumber,
          quotedAmount: quotedAmount.toString(),
          userEmail: order.user.email
        }
      })

      console.log(`Quote ready email sent for order ${order.orderNumber}`)
      return { success: result.success, messageId: result.messageId, error: result.error }
    }

    // Otherwise, send order completed email
    const emailTemplate = getEmailTemplate('order-completed', {
      name: order.user.name || 'Cliente',
      orderNumber: order.orderNumber,
      serviceType: serviceTypeName,
      downloadUrl,
      hasProtests: false,
      documents: order.attachmentUrl ? [{ name: 'Documento', url: order.attachmentUrl }] : [],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    })

    const result = await emailService.sendEmail({
      to: order.user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      metadata: {
        type: 'order-completed',
        orderNumber: order.orderNumber,
        downloadUrl,
        userEmail: order.user.email
      }
    })

    console.log(`Order completion email sent for order ${order.orderNumber}`)
    return { success: result.success, messageId: result.messageId, error: result.error }
  } catch (error) {
    console.error('Failed to send completion notification:', error)
    return { success: false, error: (error as any).message || 'Email service error' }
  }
}

// PUT - Process order with manual results
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate user session and admin role
    const user = await getUserFromSession()
    if (!user || !isAdmin(user)) {
      return NextResponse.json(
        { error: 'Acesso negado: permissões de administrador necessárias' },
        { status: 403 }
      )
    }

    const orderId = params.id

    // Validate order ID format
    if (!orderId || orderId.length < 10) {
      return NextResponse.json(
        { error: 'ID do pedido inválido' },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      resultText,
      attachmentUrl,
      protocolNumber,
      processingNotes,
      quotedAmount
    } = body

    // Validate that at least one result field is provided
    if (!resultText && !attachmentUrl) {
      return NextResponse.json(
        { error: 'É necessário fornecer pelo menos um resultado (texto ou anexo)' },
        { status: 400 }
      )
    }

    // Validate attachment URL format if provided
    if (attachmentUrl) {
      try {
        new URL(attachmentUrl)
      } catch {
        return NextResponse.json(
          { error: 'URL do anexo é inválida' },
          { status: 400 }
        )
      }
    }

    // Validate quoted amount if provided
    let quotedValue: number | undefined
    if (quotedAmount !== undefined && quotedAmount !== null && quotedAmount !== '') {
      quotedValue = parseFloat(quotedAmount.toString())
      if (isNaN(quotedValue) || quotedValue < 0) {
        return NextResponse.json(
          { error: 'Valor do orçamento inválido' },
          { status: 400 }
        )
      }
    }

    // Fetch existing order to validate state
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    // Check if order can be processed
    const processableStatuses = [
      'ORDER_CONFIRMED', 
      'AWAITING_QUOTE',
      'DOCUMENT_REQUESTED', 
      'PROCESSING'
    ]

    if (!processableStatuses.includes(existingOrder.status)) {
      return NextResponse.json(
        { 
          error: `Pedido não pode ser processado. Status atual: ${getStatusDisplayName(existingOrder.status)}` 
        },
        { status: 400 }
      )
    }

    // Check if order is already completed
    if (existingOrder.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Este pedido já foi finalizado' },
        { status: 400 }
      )
    }

    // Perform processing in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update order with processing results
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          // Set results
          resultText: resultText || existingOrder.resultText,
          attachmentUrl: attachmentUrl || existingOrder.attachmentUrl,
          protocolNumber: protocolNumber || existingOrder.protocolNumber,
          processingNotes: processingNotes || existingOrder.processingNotes,
          ...(quotedValue !== undefined && { quotedAmount: quotedValue }),
          
          // Update processing info
          processedById: user.id,
          status: 'COMPLETED',
          
          // Update timestamp
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          processedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      // Create history entry for completion
      await tx.orderHistory.create({
        data: {
          orderId,
          previousStatus: existingOrder.status,
          newStatus: 'COMPLETED',
          changedById: user.id,
          notes: 'Pedido processado e finalizado'
        }
      })

      return updatedOrder
    })

    // Send completion notification with proper logging
    const emailResult = await sendOrderCompletionNotification(result, quotedValue)
    
    // Log email results
    if (emailResult.success) {
      await prisma.auditLog.create({
        data: {
          userId: result.user.id,
          action: quotedValue ? 'QUOTE_READY_EMAIL_SENT' : 'ORDER_COMPLETION_EMAIL_SENT',
          resource: 'EMAIL',
          resourceId: result.id,
          metadata: { 
            email: result.user.email, 
            orderNumber: result.orderNumber,
            messageId: emailResult.messageId,
            ...(quotedValue && { quotedAmount: quotedValue })
          }
        }
      })
    } else {
      console.error('Failed to send completion email:', emailResult.error)
      
      await prisma.auditLog.create({
        data: {
          userId: result.user.id,
          action: 'EMAIL_FAILED',
          resource: 'EMAIL',
          resourceId: result.id,
          metadata: { 
            email: result.user.email, 
            orderNumber: result.orderNumber,
            error: emailResult.error,
            emailType: quotedValue ? 'quote-ready' : 'order-completed'
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      order: {
        id: result.id,
        orderNumber: result.orderNumber,
        status: result.status,
        resultText: result.resultText,
        attachmentUrl: result.attachmentUrl,
        protocolNumber: result.protocolNumber,
        quotedAmount: result.quotedAmount,
        processedBy: result.processedBy,
        updatedAt: result.updatedAt
      },
      message: 'Pedido processado e finalizado com sucesso'
    })

  } catch (error) {
    console.error('Order processing error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}