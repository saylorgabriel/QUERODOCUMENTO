'use client'

import React, { useState, useEffect } from 'react'
import { 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Loader2
} from 'lucide-react'

interface FilePreviewProps {
  document: {
    id: string
    filename: string
    fileSize: number
    mimeType: string
    documentType: string
    uploadedAt: string
    uploadedBy: {
      name: string
    }
  }
  orderId?: string
  onClose: () => void
  onDownload?: (document: any) => void
}

export default function FilePreview({ 
  document, 
  orderId,
  onClose, 
  onDownload 
}: FilePreviewProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [scale, setScale] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  // Load PDF for preview
  const loadPdfPreview = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use the orderId from props or try to extract from context
      const orderIdToUse = orderId || document.id // fallback
      
      const response = await fetch(
        `/api/orders/${orderIdToUse}/download?documentId=${document.id}&preview=true`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/pdf'
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || `Erro ${response.status}: Não foi possível carregar o arquivo`)
      }

      // Create blob URL for PDF
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)

    } catch (err) {
      console.error('Error loading PDF preview:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar visualização')
    } finally {
      setLoading(false)
    }
  }

  // Handle download
  const handleDownload = async () => {
    if (onDownload) {
      onDownload(document)
    } else {
      try {
        const orderIdToUse = orderId || document.id
        const response = await fetch(
          `/api/orders/${orderIdToUse}/download?documentId=${document.id}`
        )
        
        if (!response.ok) {
          throw new Error('Erro ao baixar arquivo')
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = document.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
      } catch (err) {
        console.error('Error downloading file:', err)
        setError(err instanceof Error ? err.message : 'Erro ao baixar arquivo')
      }
    }
  }

  // Handle zoom controls
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.25))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleReset = () => {
    setScale(1.0)
    setRotation(0)
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false)
        } else {
          onClose()
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isFullscreen, onClose])

  // Load preview when component mounts
  useEffect(() => {
    loadPdfPreview()

    // Cleanup blob URL when component unmounts
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [document.id])

  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-black bg-opacity-95"
    : "fixed inset-0 z-50 bg-black bg-opacity-50"

  const modalClass = isFullscreen
    ? "w-full h-full bg-white"
    : "w-full max-w-6xl h-5/6 bg-white rounded-lg shadow-xl mx-auto mt-8"

  return (
    <div className={containerClass} onClick={onClose}>
      <div className={modalClass} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {document.filename}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <span>{formatFileSize(document.fileSize)}</span>
                <span>Enviado por {document.uploadedBy.name}</span>
                <span>{formatDate(document.uploadedAt)}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {!loading && !error && pdfUrl && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                  title="Diminuir zoom"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                
                <span className="text-sm text-gray-600 min-w-16 text-center">
                  {Math.round(scale * 100)}%
                </span>
                
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                  title="Aumentar zoom"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
                
                <button
                  onClick={handleRotate}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                  title="Rotacionar"
                >
                  <RotateCw className="h-5 w-5" />
                </button>
                
                <button
                  onClick={handleReset}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                  title="Redefinir visualização"
                >
                  Reset
                </button>
              </>
            )}

            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
              title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
              title="Baixar arquivo"
            >
              <Download className="h-5 w-5" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
              title="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative" style={{ height: 'calc(100% - 80px)' }}>
          {loading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-600">Carregando visualização...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Erro na Visualização
                </h3>
                <p className="text-gray-600 mb-4 max-w-md">
                  {error}
                </p>
                <div className="space-x-3">
                  <button
                    onClick={loadPdfPreview}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Tentar Novamente
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                  >
                    Baixar Arquivo
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && pdfUrl && (
            <div className="h-full overflow-auto bg-gray-100 flex items-center justify-center">
              <div 
                className="shadow-lg bg-white"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-in-out'
                }}
              >
                {/* PDF Embed */}
                <iframe
                  src={pdfUrl}
                  className="w-full border-0"
                  style={{
                    width: '794px', // A4 width at 96 DPI
                    height: '1123px', // A4 height at 96 DPI
                    minHeight: '600px'
                  }}
                  title={`Preview: ${document.filename}`}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}