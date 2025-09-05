import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper function to validate CPF/CNPJ
function isValidDocument(document: string): boolean {
  // Remove non-numeric characters
  const cleaned = document.replace(/\D/g, '')
  
  // Check CPF (11 digits) or CNPJ (14 digits)
  return cleaned.length === 11 || cleaned.length === 14
}

// Helper function to determine document type
function getDocumentType(document: string): 'CPF' | 'CNPJ' {
  const cleaned = document.replace(/\D/g, '')
  return cleaned.length === 11 ? 'CPF' : 'CNPJ'
}

// Mock data generator for different scenarios
function generateMockProtestData(documentNumber: string, documentType: 'CPF' | 'CNPJ', name: string, isPaidConsultation: boolean = false) {
  const cleanDocument = documentNumber.replace(/\D/g, '')
  
  // Create different scenarios based on document ending digits for testing
  const lastDigit = parseInt(cleanDocument.slice(-1))
  const hasProtests = lastDigit % 3 === 0 // Documents ending in 0, 3, 6, 9 have protests
  
  const baseResult = {
    queryId: `QRY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    documentSearched: documentNumber,
    documentType,
    name,
    searchDate: new Date().toISOString(),
    status: 'COMPLETED' as const,
    totalProtests: 0,
    protests: [] as Array<{
      id: string
      date: string
      value: number
      creditor: string
      notaryOffice: string
      city: string
      state: string
      protocol: string
      status: 'ACTIVE' | 'PAID' | 'CANCELLED'
    }>,
    isPaidConsultation,
    consultationType: isPaidConsultation ? 'DETAILED' : 'BASIC'
  }

  if (!hasProtests) {
    // No protests found - clean record
    return {
      ...baseResult,
      summary: isPaidConsultation 
        ? 'Nenhum protesto encontrado para o documento consultado. Certidão negativa disponível para download.'
        : 'Nenhum protesto encontrado. Para certidão oficial, solicite a certidão negativa.',
      totalProtests: 0,
      canRequestCertificate: true,
      certificateType: 'NEGATIVE'
    }
  }

  // Generate mock protests for testing
  const mockProtests = [
    {
      id: `PROT-${Date.now()}-1`,
      date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
      value: 1250.50,
      creditor: 'Banco Exemplo S.A.',
      notaryOffice: '1º Cartório de Protestos',
      city: 'São Paulo',
      state: 'SP',
      protocol: 'PR2024001234',
      status: 'ACTIVE' as const
    },
    {
      id: `PROT-${Date.now()}-2`, 
      date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago
      value: 890.00,
      creditor: 'Financeira XYZ Ltda.',
      notaryOffice: '2º Cartório de Protestos',
      city: 'Rio de Janeiro',
      state: 'RJ',
      protocol: 'PR2023005678',
      status: 'ACTIVE' as const
    }
  ]

  // Vary number of protests based on last digit
  const numberOfProtests = lastDigit === 0 ? 1 : (lastDigit === 3 ? 2 : 1)
  
  // For basic consultations, show limited information
  const protestsToShow = isPaidConsultation 
    ? mockProtests.slice(0, numberOfProtests)
    : mockProtests.slice(0, numberOfProtests).map(protest => ({
        ...protest,
        // Hide sensitive details in basic consultation
        creditor: protest.creditor.replace(/\w/g, '*').slice(0, -10) + ' [Detalhes na certidão paga]',
        value: 0, // Hide value
        protocol: '***HIDDEN***'
      }))
  
  return {
    ...baseResult,
    totalProtests: numberOfProtests,
    protests: protestsToShow,
    summary: isPaidConsultation 
      ? `Encontrado(s) ${numberOfProtests} protesto(s) para o documento consultado. Certidão detalhada disponível para download.`
      : `Encontrado(s) ${numberOfProtests} protesto(s) para o documento consultado. Para detalhes completos e certidão oficial, solicite a certidão paga.`,
    canRequestCertificate: true,
    certificateType: 'POSITIVE'
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const {
      documentNumber,
      documentType, // This might be provided by client or auto-detected
      name,
      phone,
      consultationType = 'BASIC', // 'BASIC' (paid basic) or 'DETAILED' (paid detailed)
      orderId // If provided, this is a paid consultation linked to an order
    } = body

    // Validate required fields
    if (!documentNumber || !name) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Documento e nome são obrigatórios' 
        },
        { status: 400 }
      )
    }

    // Validate document format
    if (!isValidDocument(documentNumber)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'CPF ou CNPJ inválido' 
        },
        { status: 400 }
      )
    }

    // Auto-detect document type if not provided
    const detectedDocumentType = documentType || getDocumentType(documentNumber)
    const cleanDocument = documentNumber.replace(/\D/g, '')

    // Check if this is a paid consultation
    const isPaidConsultation = consultationType === 'DETAILED'
    let order = null

    // If orderId is provided, validate the order and payment status
    if (orderId) {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          orderNumber: true,
          documentNumber: true,
          paymentStatus: true,
          status: true,
          userId: true
        }
      })

      // Verify order exists and payment is confirmed
      if (!order || order.paymentStatus !== 'COMPLETED') {
        return NextResponse.json(
          { 
            success: false,
            error: 'Pedido não encontrado ou pagamento não confirmado' 
          },
          { status: 400 }
        )
      }

      // Verify document matches the order
      if (order.documentNumber !== cleanDocument) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Documento não confere com o pedido' 
          },
          { status: 400 }
        )
      }
    }

    // Generate mock query result
    const mockResult = generateMockProtestData(documentNumber, detectedDocumentType, name, isPaidConsultation)
    
    const queryId = `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // If this is a basic consultation, save lead data for remarketing
    if (!isPaidConsultation) {
      try {
        await prisma.lead.upsert({
          where: { documentNumber: cleanDocument },
          update: {
            name,
            phone: phone || null,
            lastActivity: new Date(),
            consultations: { increment: 1 },
            stage: 'CONSULTATION'
          },
          create: {
            documentNumber: cleanDocument,
            name,
            phone: phone || null,
            consultations: 1,
            stage: 'CONSULTATION',
            status: 'NEW'
          }
        })
      } catch (error) {
        console.warn('Failed to save lead data:', error)
        // Don't fail the consultation if lead saving fails
      }
    }

    // Return the query result
    return NextResponse.json({
      success: true,
      data: {
        queryId,
        orderId: order?.id,
        orderNumber: order?.orderNumber,
        ...mockResult
      }
    })

  } catch (error) {
    console.error('Protest query error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor. Tente novamente.' 
      },
      { status: 500 }
    )
  }
}

// GET method for checking query status (if needed)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const queryId = searchParams.get('queryId')

  if (!queryId) {
    return NextResponse.json(
      { 
        success: false,
        error: 'ID da consulta é obrigatório' 
      },
      { status: 400 }
    )
  }

  try {
    const query = await prisma.protestQuery.findUnique({
      where: { id: queryId },
      select: {
        id: true,
        document: true,
        documentType: true,
        status: true,
        result: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!query) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Consulta não encontrada' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        queryId: query.id,
        status: query.status,
        result: query.result,
        createdAt: query.createdAt,
        updatedAt: query.updatedAt
      }
    })

  } catch (error) {
    console.error('Query status error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}