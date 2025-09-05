/**
 * PDF Download API Endpoint
 * Handles downloading of generated PDF files
 */

import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Ensure temp directory path
function getTempDirectory(): string {
  return join(process.cwd(), 'tmp', 'pdf')
}

// Validate filename to prevent directory traversal attacks
function isValidFilename(filename: string): boolean {
  // Only allow alphanumeric characters, dots, dashes, and underscores
  const safeFilenameRegex = /^[a-zA-Z0-9._-]+\.pdf$/
  return safeFilenameRegex.test(filename) && !filename.includes('..')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('file')

    if (!filename) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Nome do arquivo é obrigatório' 
        },
        { status: 400 }
      )
    }

    // Validate filename for security
    if (!isValidFilename(filename)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Nome do arquivo inválido' 
        },
        { status: 400 }
      )
    }

    const tempDir = getTempDirectory()
    const filePath = join(tempDir, filename)

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Arquivo não encontrado' 
        },
        { status: 404 }
      )
    }

    try {
      // Get file stats
      const fileStats = await stat(filePath)
      
      // Read the file
      const fileBuffer = await readFile(filePath)

      // Return the PDF file
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': fileStats.size.toString(),
          'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY'
        }
      })

    } catch (fileError) {
      console.error('File read error:', fileError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro ao ler o arquivo' 
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('PDF download error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}

// POST method to trigger file cleanup (optional)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('file')

    if (!filename) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Nome do arquivo é obrigatório' 
        },
        { status: 400 }
      )
    }

    // Validate filename for security
    if (!isValidFilename(filename)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Nome do arquivo inválido' 
        },
        { status: 400 }
      )
    }

    const tempDir = getTempDirectory()
    const filePath = join(tempDir, filename)

    // Check if file exists before trying to delete
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Arquivo não encontrado' 
        },
        { status: 404 }
      )
    }

    try {
      // Delete the file
      const { unlink } = await import('fs/promises')
      await unlink(filePath)

      return NextResponse.json({
        success: true,
        message: 'Arquivo removido com sucesso'
      })

    } catch (deleteError) {
      console.error('File delete error:', deleteError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro ao remover o arquivo' 
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('PDF delete error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}