/**
 * PDF Generation API Endpoint
 * Handles PDF generation for protest consultation results
 */

// Ensure this route is dynamically rendered
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { generatePDFFilename } from '@/lib/pdf/utils'
import QRCode from 'qrcode'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Interface for the protest query result (matching the API)
interface ProtestItem {
  id: string
  date: string
  value: number
  creditor: string
  notaryOffice: string
  city: string
  state: string
  protocol: string
  status: 'ACTIVE' | 'PAID' | 'CANCELLED'
}

interface ProtestQueryResult {
  queryId: string
  documentSearched: string
  documentType: 'CPF' | 'CNPJ'
  name: string
  searchDate: string
  status: 'COMPLETED' | 'PROCESSING' | 'ERROR'
  totalProtests: number
  protests: ProtestItem[]
  summary: string
}

interface GeneratePDFRequest {
  queryResult: ProtestQueryResult
  options?: {
    includeQRCode?: boolean
    downloadFormat?: 'base64' | 'buffer' | 'file'
    filename?: string
  }
}

// Ensure temp directory exists
async function ensureTempDirectory(): Promise<string> {
  const tempDir = join(process.cwd(), 'tmp', 'pdf')
  
  if (!existsSync(tempDir)) {
    await mkdir(tempDir, { recursive: true })
  }
  
  return tempDir
}

// Generate QR code as base64 data URL
async function generateQRCodeDataURL(data: string): Promise<string> {
  try {
    const qrCodeBuffer = await QRCode.toBuffer(data, {
      type: 'png',
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    const base64 = qrCodeBuffer.toString('base64')
    return `data:image/png;base64,${base64}`
  } catch (error) {
    console.error('QR Code generation error:', error)
    return ''
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: GeneratePDFRequest = await request.json()
    const { queryResult, options = {} } = body

    // Validate required fields
    if (!queryResult || !queryResult.queryId || !queryResult.documentSearched || !queryResult.name) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Dados da consulta são obrigatórios (queryId, documentSearched, name)' 
        },
        { status: 400 }
      )
    }

    // Set default options
    const {
      includeQRCode = true,
      downloadFormat = 'base64',
      filename = generatePDFFilename('consulta_protesto', queryResult.documentSearched)
    } = options

    try {
      // Use jsPDF template instead of @react-pdf/renderer
      const { generateProtestPDF } = await import('@/lib/pdf/jspdf-template')

      // Generate the PDF using the jsPDF template
      const pdfBuffer = await generateProtestPDF(queryResult, includeQRCode)

      // Handle different response formats
      switch (downloadFormat) {
        case 'base64': {
          const base64 = Buffer.from(pdfBuffer).toString('base64')
          const dataUrl = `data:application/pdf;base64,${base64}`
          
          return NextResponse.json({
            success: true,
            data: {
              filename,
              content: base64,
              dataUrl,
              size: pdfBuffer.length,
              queryId: queryResult.queryId
            }
          })
        }

        case 'buffer': {
          return new NextResponse(Buffer.from(pdfBuffer), {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${filename}"`,
              'Content-Length': pdfBuffer.length.toString(),
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          })
        }

        case 'file': {
          // Save file to temp directory
          const tempDir = await ensureTempDirectory()
          const filePath = join(tempDir, filename)
          
          await writeFile(filePath, Buffer.from(pdfBuffer))
          
          return NextResponse.json({
            success: true,
            data: {
              filename,
              filePath,
              size: pdfBuffer.length,
              queryId: queryResult.queryId,
              downloadUrl: `/api/pdf/download?file=${encodeURIComponent(filename)}`
            }
          })
        }

        default: {
          return NextResponse.json(
            { 
              success: false,
              error: 'Formato de download inválido. Use: base64, buffer ou file' 
            },
            { status: 400 }
          )
        }
      }

    } catch (pdfError) {
      console.error('PDF generation error:', pdfError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro ao gerar PDF. Verifique os dados fornecidos.' 
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('PDF API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor. Tente novamente.' 
      },
      { status: 500 }
    )
  }
}

// GET method to retrieve generation status or list available PDFs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryId = searchParams.get('queryId')
    const action = searchParams.get('action') || 'status'

    if (action === 'status' && queryId) {
      // Check if PDF exists for this query
      const tempDir = await ensureTempDirectory()
      const possibleFiles = [
        `consulta_protesto_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${queryId.slice(-4)}.pdf`,
        `consulta_protesto_${queryId}.pdf`
      ]

      let fileExists = false
      let existingFile = ''

      for (const file of possibleFiles) {
        const filePath = join(tempDir, file)
        if (existsSync(filePath)) {
          fileExists = true
          existingFile = file
          break
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          queryId,
          pdfExists: fileExists,
          filename: existingFile,
          downloadUrl: fileExists ? `/api/pdf/download?file=${encodeURIComponent(existingFile)}` : null
        }
      })
    }

    if (action === 'list') {
      // List available PDFs (for admin purposes)
      const tempDir = await ensureTempDirectory()
      // This would require implementing directory listing
      // For now, return empty list
      return NextResponse.json({
        success: true,
        data: {
          files: [],
          count: 0
        }
      })
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Ação inválida. Use: status ou list' 
      },
      { status: 400 }
    )

  } catch (error) {
    console.error('PDF API GET error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}