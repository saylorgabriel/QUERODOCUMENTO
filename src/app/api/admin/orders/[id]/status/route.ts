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

// Helper function to validate status transitions
function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  const validTransitions: { [key: string]: string[] } = {
    'AWAITING_PAYMENT': ['PAYMENT_CONFIRMED', 'PAYMENT_REFUSED', 'CANCELLED'],
    'PAYMENT_CONFIRMED': ['ORDER_CONFIRMED', 'CANCELLED'],
    'PAYMENT_REFUSED': ['AWAITING_PAYMENT', 'CANCELLED'],
    'ORDER_CONFIRMED': ['AWAITING_QUOTE', 'DOCUMENT_REQUESTED', 'PROCESSING', 'CANCELLED'],
    'AWAITING_QUOTE': ['ORDER_CONFIRMED', 'PROCESSING', 'CANCELLED'],
    'DOCUMENT_REQUESTED': ['PROCESSING', 'CANCELLED'],
    'PROCESSING': ['COMPLETED', 'CANCELLED'],
    'COMPLETED': [], // Final state
    'CANCELLED': [] // Final state
  }

  return validTransitions[currentStatus]?.includes(newStatus) || false
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

// Enhanced email notification function with proper email service integration
async function sendStatusUpdateNotification(
  order: any, 
  newStatus: string, 
  oldStatus: string, 
  changedByUserId: string,
  notes?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const statusMessages = getStatusUpdateMessage(oldStatus, newStatus, order)
    
    if (!statusMessages) {
      // No email needed for this status transition
      return { success: false, error: 'No email required for this status transition' }
    }

    const emailTemplate = getEmailTemplate('status-update', {
      name: order.user.name || 'Cliente',
      orderNumber: order.orderNumber,
      orderStatus: getStatusDisplayName(newStatus),
      previousStatus: getStatusDisplayName(oldStatus),
      message: statusMessages.message,
      nextSteps: statusMessages.nextSteps,
      requiresAction: statusMessages.requiresAction,
      actionRequired: statusMessages.actionRequired,
      actionUrl: statusMessages.actionUrl,
      estimatedTime: statusMessages.estimatedTime,
      additionalInfo: notes || statusMessages.additionalInfo
    })

    const result = await emailService.sendEmail({
      to: order.user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      metadata: {
        type: 'status-update',
        orderNumber: order.orderNumber,
        oldStatus,
        newStatus,
        changedBy: changedByUserId,
        userEmail: order.user.email
      }
    })

    if (result.success) {
      console.log(`Status update email sent successfully for order ${order.orderNumber}`)
      return { success: true, messageId: result.messageId }
    } else {
      console.error('Failed to send status update email:', result.error)
      return { success: false, error: result.error || 'Failed to send email' }
    }
  } catch (error) {
    console.error('Status update email error:', error)
    return { success: false, error: (error as any).message || 'Email service error' }
  }
}

// Helper function to determine appropriate email message for status transitions
function getStatusUpdateMessage(oldStatus: string, newStatus: string, order: any) {
  const serviceTypeName = order.serviceType === 'PROTEST_QUERY' ? 'Consulta de Protesto' : 'Certidão de Protesto'
  
  const statusTransitions: Record<string, any> = {
    'AWAITING_PAYMENT-PAYMENT_CONFIRMED': {
      message: 'Seu pagamento foi confirmado com sucesso! Agora vamos processar sua solicitação.',
      nextSteps: ['Processaremos sua solicitação em até 48 horas', 'Você receberá atualizações por email', 'O resultado estará disponível em sua conta'],
      requiresAction: false,
      estimatedTime: '48 horas'
    },
    'PAYMENT_CONFIRMED-ORDER_CONFIRMED': {
      message: 'Seu pedido foi confirmado e está sendo preparado para processamento.',
      nextSteps: ['Iniciamos o processamento do seu pedido', 'Nossa equipe está trabalhando na sua solicitação', 'Você receberá o resultado em breve'],
      requiresAction: false,
      estimatedTime: '24-48 horas'
    },
    'ORDER_CONFIRMED-PROCESSING': {
      message: 'Seu pedido está sendo processado ativamente por nossa equipe.',
      nextSteps: ['Estamos consultando os cartórios competentes', 'O processamento está em andamento', 'Você será notificado quando concluído'],
      requiresAction: false,
      estimatedTime: '24-48 horas'
    },
    'PROCESSING-COMPLETED': {
      message: `Seu ${serviceTypeName.toLowerCase()} foi concluído e está disponível para download!`,
      nextSteps: ['Acesse sua conta para baixar o documento', 'O documento também foi enviado por email', 'Mantenha o documento em local seguro'],
      requiresAction: true,
      actionRequired: 'Baixar documento',
      actionUrl: `${process.env.NEXTAUTH_URL}/dashboard`
    },
    'ORDER_CONFIRMED-AWAITING_QUOTE': {
      message: 'Identificamos protestos em seu nome. Um orçamento personalizado foi preparado.',
      nextSteps: ['Verifique o orçamento detalhado em sua conta', 'Aprove o orçamento para prosseguir', 'Entre em contato se tiver dúvidas'],
      requiresAction: true,
      actionRequired: 'Aprovar orçamento',
      actionUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
      estimatedTime: 'Aguardando aprovação'
    },
    'AWAITING_QUOTE-PROCESSING': {
      message: 'Orçamento aprovado! Estamos processando sua certidão de protesto.',
      nextSteps: ['Processamento da certidão iniciado', 'Nossa equipe está preparando seu documento', 'Resultado disponível em breve'],
      requiresAction: false,
      estimatedTime: '24-48 horas'
    },
    'AWAITING_PAYMENT-CANCELLED': {
      message: 'Seu pedido foi cancelado devido ao não pagamento.',
      nextSteps: ['Você pode criar um novo pedido a qualquer momento', 'Entre em contato se teve problemas com o pagamento', 'Nossa equipe está disponível para ajudar'],
      requiresAction: false
    },
    'PAYMENT_CONFIRMED-CANCELLED': {
      message: 'Seu pedido foi cancelado. Se você já efetuou o pagamento, ele será estornado.',
      nextSteps: ['O estorno será processado em até 5 dias úteis', 'Entre em contato para mais informações', 'Você pode criar um novo pedido'],
      requiresAction: false
    }
  }

  const transitionKey = `${oldStatus}-${newStatus}`
  return statusTransitions[transitionKey] || null
}

// PUT - Update order status specifically
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
    const { status: newStatus, notes } = body

    // Validate required fields
    if (!newStatus) {
      return NextResponse.json(
        { error: 'Novo status é obrigatório' },
        { status: 400 }
      )
    }

    // Validate status value
    const validStatuses = [
      'AWAITING_PAYMENT', 'PAYMENT_CONFIRMED', 'PAYMENT_REFUSED',
      'ORDER_CONFIRMED', 'AWAITING_QUOTE', 'DOCUMENT_REQUESTED',
      'PROCESSING', 'COMPLETED', 'CANCELLED'
    ]

    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      )
    }

    // Fetch existing order with user details
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

    // Check if status is actually changing
    if (existingOrder.status === newStatus) {
      return NextResponse.json(
        { error: 'O pedido já possui este status' },
        { status: 400 }
      )
    }

    // Validate status transition
    if (!isValidStatusTransition(existingOrder.status, newStatus)) {
      return NextResponse.json(
        { 
          error: `Transição de status inválida: de "${getStatusDisplayName(existingOrder.status)}" para "${getStatusDisplayName(newStatus)}"` 
        },
        { status: 400 }
      )
    }

    // Perform status update and create history entry in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          processedById: existingOrder.processedById || user.id,
          // Set paidAt timestamp for payment confirmation
          ...(newStatus === 'PAYMENT_CONFIRMED' && !existingOrder.paidAt && {
            paidAt: new Date(),
            paymentStatus: 'COMPLETED'
          }),
          // Set payment status for refused payments
          ...(newStatus === 'PAYMENT_REFUSED' && {
            paymentStatus: 'FAILED'
          })
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

      // Create order history entry
      await tx.orderHistory.create({
        data: {
          orderId,
          previousStatus: existingOrder.status,
          newStatus,
          changedById: user.id,
          notes: notes || `Status alterado para ${getStatusDisplayName(newStatus)}`
        }
      })

      return updatedOrder
    })

    // Send email notification with proper logging
    const emailResult = await sendStatusUpdateNotification(result, newStatus, existingOrder.status, user.id, notes)
    
    // Log email results
    if (emailResult.success) {
      await prisma.auditLog.create({
        data: {
          userId: result.user.id,
          action: 'STATUS_UPDATE_EMAIL_SENT',
          resource: 'EMAIL',
          resourceId: result.id,
          metadata: { 
            email: result.user.email, 
            orderNumber: result.orderNumber,
            oldStatus: existingOrder.status,
            newStatus,
            messageId: emailResult.messageId,
            changedBy: user.id
          }
        }
      })
    } else if (emailResult.error !== 'No email required for this status transition') {
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
            emailType: 'status-update',
            oldStatus: existingOrder.status,
            newStatus
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
        paymentStatus: result.paymentStatus,
        paidAt: result.paidAt,
        updatedAt: result.updatedAt
      },
      message: `Status alterado para "${getStatusDisplayName(newStatus)}" com sucesso`,
      previousStatus: getStatusDisplayName(existingOrder.status),
      newStatus: getStatusDisplayName(newStatus)
    })

  } catch (error) {
    console.error('Order status update error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}