import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import crypto from 'crypto'
import { getEmailTemplate } from '@/lib/email/templates'
import { emailService } from '@/lib/email/email-service'

// Helper function to get user from session
async function getUserFromSession(): Promise<{ id: string; role: string } | null> {
  try {
    const cookieStore = await cookies()
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

// Helper function to generate secure filename
function generateSecureFilename(originalName: string): string {
  const timestamp = Date.now()
  const randomBytes = crypto.randomBytes(8).toString('hex')
  const extension = originalName.split('.').pop() || 'pdf'
  return `${timestamp}_${randomBytes}.${extension}`
}

// Helper function to calculate file checksum
async function calculateChecksum(buffer: Buffer): Promise<string> {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

// Helper function to validate file
function validateFile(file: File): { isValid: boolean; error?: string } {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB in bytes
  if (file.size > maxSize) {
    return { isValid: false, error: 'Arquivo muito grande. Tamanho máximo permitido: 10MB' }
  }

  // Check file type (only PDFs allowed)
  const allowedTypes = ['application/pdf']
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Tipo de arquivo não permitido. Apenas arquivos PDF são aceitos.' }
  }

  // Check file extension
  const allowedExtensions = ['.pdf']
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!allowedExtensions.includes(extension)) {
    return { isValid: false, error: 'Extensão de arquivo não permitida. Apenas arquivos .pdf são aceitos.' }
  }

  return { isValid: true }
}

// Helper function to send document ready notification
async function sendDocumentReadyNotification(
  order: any, 
  documents: any[], 
  documentType: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (documentType !== 'RESULT' && documentType !== 'CERTIFICATE') {
      // Only send notifications for result documents and certificates
      return { success: false, error: 'No notification needed for this document type' }
    }

    const serviceTypeName = order.serviceType === 'PROTEST_QUERY' ? 'Consulta de Protesto' : 'Certidão de Protesto'
    const downloadUrl = `${process.env.NEXTAUTH_URL}/api/orders/${order.id}/download`

    const emailTemplate = getEmailTemplate('order-completed', {
      name: order.user.name || 'Cliente',
      orderNumber: order.orderNumber,
      serviceType: serviceTypeName,
      downloadUrl,
      hasProtests: false, // This would be determined based on the actual results
      documents: documents.map(doc => ({
        name: doc.filename,
        url: `${process.env.NEXTAUTH_URL}/api/orders/${order.id}/download?token=${doc.downloadToken}`
      })),
      expiresAt: documents[0]?.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    })

    const result = await emailService.sendEmail({
      to: order.user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      metadata: {
        type: 'document-ready',
        orderNumber: order.orderNumber,
        documentType,
        documentCount: documents.length.toString(),
        userEmail: order.user.email
      }
    })

    if (result.success) {
      console.log(`Document ready email sent for order ${order.orderNumber}`)
      return { success: true, messageId: result.messageId }
    } else {
      console.error('Failed to send document ready email:', result.error)
      return { success: false, error: result.error || 'Failed to send email' }
    }
  } catch (error) {
    console.error('Document ready email error:', error)
    return { success: false, error: (error as any).message || 'Email service error' }
  }
}

// POST - Upload files to order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: orderId } = await params

    // Validate order ID format
    if (!orderId || orderId.length < 10) {
      return NextResponse.json(
        { error: 'ID do pedido inválido' },
        { status: 400 }
      )
    }

    // Check if order exists and get user details
    const order = await prisma.order.findUnique({
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

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const documentType = formData.get('documentType') as string || 'RESULT'

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum arquivo foi enviado' },
        { status: 400 }
      )
    }

    // Validate document type
    const validDocumentTypes = ['RESULT', 'CERTIFICATE', 'INVOICE', 'RECEIPT', 'OTHER']
    if (!validDocumentTypes.includes(documentType)) {
      return NextResponse.json(
        { error: 'Tipo de documento inválido' },
        { status: 400 }
      )
    }

    const uploadedFiles: any[] = []
    const errors: string[] = []

    for (const file of files) {
      try {
        // Validate file
        const validation = validateFile(file)
        if (!validation.isValid) {
          errors.push(`${file.name}: ${validation.error}`)
          continue
        }

        // Create upload directory
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'orders', orderId)
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true })
        }

        // Generate secure filename
        const secureFilename = generateSecureFilename(file.name)
        const filePath = join(uploadDir, secureFilename)
        const relativePath = join('uploads', 'orders', orderId, secureFilename)

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Calculate checksum
        const checksum = await calculateChecksum(buffer)

        // Write file to disk
        await writeFile(filePath, buffer)

        // Check for existing documents of the same type and mark as inactive
        await prisma.orderDocument.updateMany({
          where: {
            orderId,
            documentType,
            isActive: true
          },
          data: {
            isActive: false
          }
        })

        // Set expiration date (3 months from now)
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 3)

        // Generate secure download token
        const downloadToken = crypto.randomBytes(32).toString('hex')

        // Save file info to database
        const orderDocument = await prisma.orderDocument.create({
          data: {
            orderId,
            filename: file.name,
            storedFilename: secureFilename,
            filePath: relativePath,
            fileSize: file.size,
            mimeType: file.type,
            documentType,
            uploadedById: user.id,
            expiresAt,
            downloadToken,
            checksum
          },
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })

        uploadedFiles.push(orderDocument)

        // Create audit log
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'FILE_UPLOAD',
            resource: 'ORDER_DOCUMENT',
            resourceId: orderDocument.id,
            metadata: {
              orderId,
              filename: file.name,
              fileSize: file.size,
              documentType
            },
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
          }
        })

      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError)
        errors.push(`${file.name}: Erro ao processar arquivo`)
      }
    }

    // Update order to mark document availability and send notifications
    if (uploadedFiles.length > 0) {
      // Auto-update order status based on document type
      let newStatus = order.status
      if (documentType === 'RESULT' && order.status === 'PROCESSING') {
        newStatus = 'COMPLETED'
      }
      
      const updateData: any = { updatedAt: new Date() }
      if (newStatus !== order.status) {
        updateData.status = newStatus
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
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

      // Create order history entry if status changed
      if (newStatus !== order.status) {
        await prisma.orderHistory.create({
          data: {
            orderId,
            previousStatus: order.status,
            newStatus,
            changedById: user.id,
            notes: `Status atualizado automaticamente após upload de ${documentType.toLowerCase()}`
          }
        })
      }

      // Send document ready notification email
      const emailResult = await sendDocumentReadyNotification(updatedOrder, uploadedFiles, documentType)
      
      // Log email results
      if (emailResult.success) {
        await prisma.auditLog.create({
          data: {
            userId: updatedOrder.user.id,
            action: 'DOCUMENT_READY_EMAIL_SENT',
            resource: 'EMAIL',
            resourceId: updatedOrder.id,
            metadata: { 
              email: updatedOrder.user.email, 
              orderNumber: updatedOrder.orderNumber,
              documentType,
              documentCount: uploadedFiles.length,
              messageId: emailResult.messageId
            }
          }
        })
      } else if (emailResult.error !== 'No notification needed for this document type') {
        console.error('Failed to send document ready email:', emailResult.error)
        
        await prisma.auditLog.create({
          data: {
            userId: updatedOrder.user.id,
            action: 'EMAIL_FAILED',
            resource: 'EMAIL',
            resourceId: updatedOrder.id,
            metadata: { 
              email: updatedOrder.user.email, 
              orderNumber: updatedOrder.orderNumber,
              error: emailResult.error,
              emailType: 'document-ready',
              documentType
            }
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `${uploadedFiles.length} arquivo(s) enviado(s) com sucesso`,
      uploadedFiles,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - List uploaded documents for an order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: orderId } = await params

    // Validate order ID format
    if (!orderId || orderId.length < 10) {
      return NextResponse.json(
        { error: 'ID do pedido inválido' },
        { status: 400 }
      )
    }

    // Fetch order documents
    const documents = await prisma.orderDocument.findMany({
      where: {
        orderId,
        isActive: true
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      documents
    })

  } catch (error) {
    console.error('Documents list error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remove uploaded document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: orderId } = await params
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')

    if (!documentId) {
      return NextResponse.json(
        { error: 'ID do documento não fornecido' },
        { status: 400 }
      )
    }

    // Find and validate document
    const document = await prisma.orderDocument.findFirst({
      where: {
        id: documentId,
        orderId,
        isActive: true
      }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Documento não encontrado' },
        { status: 404 }
      )
    }

    // Mark document as inactive (soft delete)
    await prisma.orderDocument.update({
      where: { id: documentId },
      data: { isActive: false }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'FILE_DELETE',
        resource: 'ORDER_DOCUMENT',
        resourceId: document.id,
        metadata: {
          orderId,
          filename: document.filename,
          documentType: document.documentType
        },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Documento removido com sucesso'
    })

  } catch (error) {
    console.error('Document delete error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}