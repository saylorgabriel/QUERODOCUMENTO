'use client'

import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Upload,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import FileUpload from './FileUpload'
import FilePreview from './FilePreview'

interface DocumentManagerProps {
  orderId: string
  onDocumentsChange?: (documents: any[]) => void
  readOnly?: boolean
}

interface OrderDocument {
  id: string
  filename: string
  storedFilename: string
  filePath: string
  fileSize: number
  mimeType: string
  documentType: 'RESULT' | 'CERTIFICATE' | 'INVOICE' | 'RECEIPT' | 'OTHER'
  version: number
  uploadedAt: string
  expiresAt?: string
  downloadCount: number
  lastDownloaded?: string
  uploadedBy: {
    id: string
    name: string
    email: string
  }
}

export default function DocumentManager({
  orderId,
  onDocumentsChange,
  readOnly = false
}: DocumentManagerProps) {
  const [documents, setDocuments] = useState<OrderDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [selectedDocumentType, setSelectedDocumentType] = useState<'RESULT' | 'CERTIFICATE' | 'INVOICE' | 'RECEIPT' | 'OTHER'>('RESULT')
  const [previewDocument, setPreviewDocument] = useState<OrderDocument | null>(null)
  const [deletingDocument, setDeletingDocument] = useState<string | null>(null)

  // Document type labels
  const documentTypeLabels = {
    RESULT: 'Resultado da Consulta',
    CERTIFICATE: 'Certidão',
    INVOICE: 'Nota Fiscal',
    RECEIPT: 'Comprovante',
    OTHER: 'Outros'
  }

  // Document type colors
  const documentTypeColors = {
    RESULT: 'bg-blue-100 text-blue-800',
    CERTIFICATE: 'bg-green-100 text-green-800',
    INVOICE: 'bg-purple-100 text-purple-800',
    RECEIPT: 'bg-yellow-100 text-yellow-800',
    OTHER: 'bg-gray-100 text-gray-800'
  }

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/orders/${orderId}/upload`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar documentos')
      }

      const data = await response.json()
      setDocuments(data.documents || [])
      onDocumentsChange?.(data.documents || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching documents:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Delete document
  const deleteDocument = async (documentId: string) => {
    if (!confirm('Tem certeza que deseja remover este documento?')) {
      return
    }

    try {
      setDeletingDocument(documentId)
      
      const response = await fetch(
        `/api/admin/orders/${orderId}/upload?documentId=${documentId}`,
        { method: 'DELETE' }
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao remover documento')
      }

      // Refresh documents list
      await fetchDocuments()
      
    } catch (err) {
      console.error('Error deleting document:', err)
      setError(err instanceof Error ? err.message : 'Erro ao remover documento')
    } finally {
      setDeletingDocument(null)
    }
  }

  // Download document
  const downloadDocument = async (document: OrderDocument) => {
    try {
      const response = await fetch(
        `/api/orders/${orderId}/download?documentId=${document.id}`
      )
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao baixar documento')
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = document.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      // Refresh documents to update download count
      await fetchDocuments()
      
    } catch (err) {
      console.error('Error downloading document:', err)
      setError(err instanceof Error ? err.message : 'Erro ao baixar documento')
    }
  }

  // Preview document
  const handlePreviewDocument = async (document: OrderDocument) => {
    setPreviewDocument(document)
  }

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

  // Check if document is expired
  const isExpired = (document: OrderDocument): boolean => {
    if (!document.expiresAt) return false
    return new Date(document.expiresAt) <= new Date()
  }

  // Handle upload success
  const handleUploadSuccess = (uploadedFiles: any[]) => {
    setShowUpload(false)
    fetchDocuments() // Refresh the list
    setError(null)
  }

  // Handle upload error
  const handleUploadError = (error: string) => {
    setError(error)
  }

  useEffect(() => {
    fetchDocuments()
  }, [orderId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Carregando documentos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Documentos do Pedido
          </h3>
          <p className="text-sm text-gray-500">
            {documents.length} documento(s) anexado(s)
          </p>
        </div>
        
        {!readOnly && (
          <div className="flex space-x-2">
            <button
              onClick={() => fetchDocuments()}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Enviar Documento</span>
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      {showUpload && !readOnly && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Documento
            </label>
            <select
              value={selectedDocumentType}
              onChange={(e) => setSelectedDocumentType(e.target.value as any)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {Object.entries(documentTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <FileUpload
            orderId={orderId}
            documentType={selectedDocumentType}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </div>
      )}

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nenhum documento
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Nenhum documento foi anexado a este pedido ainda.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((document) => (
            <div
              key={document.id}
              className={`border rounded-lg p-4 ${
                isExpired(document) ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <FileText className={`h-8 w-8 mt-1 ${
                    isExpired(document) ? 'text-red-400' : 'text-gray-400'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {document.filename}
                      </h4>
                      
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        documentTypeColors[document.documentType]
                      }`}>
                        {documentTypeLabels[document.documentType]}
                      </span>
                      
                      {isExpired(document) && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Expirado
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatFileSize(document.fileSize)}</span>
                      <span className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {document.uploadedBy.name}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(document.uploadedAt)}
                      </span>
                      {document.downloadCount > 0 && (
                        <span className="flex items-center">
                          <Download className="h-3 w-3 mr-1" />
                          {document.downloadCount} download(s)
                        </span>
                      )}
                    </div>
                    
                    {document.expiresAt && (
                      <div className="mt-1 text-xs text-gray-500">
                        <span className="flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Expira em: {formatDate(document.expiresAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handlePreviewDocument(document)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => downloadDocument(document)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                    title="Baixar"
                    disabled={isExpired(document)}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  
                  {!readOnly && (
                    <button
                      onClick={() => deleteDocument(document.id)}
                      disabled={deletingDocument === document.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
                      title="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewDocument && (
        <FilePreview
          document={previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </div>
  )
}