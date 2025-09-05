'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface FileUploadProps {
  orderId: string
  onUploadSuccess: (files: any[]) => void
  onUploadError: (error: string) => void
  maxFiles?: number
  maxSizeBytes?: number
  acceptedTypes?: string[]
  documentType?: 'RESULT' | 'CERTIFICATE' | 'INVOICE' | 'RECEIPT' | 'OTHER'
  disabled?: boolean
}

interface UploadFile {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
  result?: any
}

export default function FileUpload({
  orderId,
  onUploadSuccess,
  onUploadError,
  maxFiles = 5,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ['application/pdf'],
  documentType = 'RESULT',
  disabled = false
}: FileUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Generate unique ID for files
  const generateFileId = () => Date.now() + Math.random().toString(36).substr(2, 9)

  // Validate file before adding to upload queue
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Tipo de arquivo não permitido. Apenas arquivos PDF são aceitos.'
      }
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      const maxSizeMB = maxSizeBytes / (1024 * 1024)
      return {
        isValid: false,
        error: `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`
      }
    }

    // Check file name length
    if (file.name.length > 255) {
      return {
        isValid: false,
        error: 'Nome do arquivo muito longo (máximo 255 caracteres)'
      }
    }

    return { isValid: true }
  }

  // Add files to upload queue
  const addFiles = useCallback((files: File[]) => {
    const newFiles: UploadFile[] = []
    const errors: string[] = []

    files.forEach(file => {
      // Check if we haven't exceeded max files
      if (uploadFiles.length + newFiles.length >= maxFiles) {
        errors.push(`Máximo de ${maxFiles} arquivos permitido`)
        return
      }

      // Check for duplicates
      const isDuplicate = uploadFiles.some(uf => 
        uf.file.name === file.name && uf.file.size === file.size
      )
      if (isDuplicate) {
        errors.push(`Arquivo duplicado: ${file.name}`)
        return
      }

      // Validate file
      const validation = validateFile(file)
      if (!validation.isValid) {
        errors.push(`${file.name}: ${validation.error}`)
        return
      }

      newFiles.push({
        file,
        id: generateFileId(),
        status: 'pending',
        progress: 0
      })
    })

    if (newFiles.length > 0) {
      setUploadFiles(prev => [...prev, ...newFiles])
    }

    if (errors.length > 0) {
      onUploadError(errors.join('\n'))
    }
  }, [uploadFiles, maxFiles, maxSizeBytes, acceptedTypes, onUploadError])

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      addFiles(files)
    }
  }, [disabled, addFiles])

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      addFiles(files)
      // Reset input
      e.target.value = ''
    }
  }

  // Remove file from queue
  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(uf => uf.id !== fileId))
  }

  // Upload single file
  const uploadFile = async (uploadFile: UploadFile): Promise<void> => {
    const formData = new FormData()
    formData.append('files', uploadFile.file)
    formData.append('documentType', documentType)

    try {
      setUploadFiles(prev => 
        prev.map(uf => 
          uf.id === uploadFile.id 
            ? { ...uf, status: 'uploading', progress: 0 }
            : uf
        )
      )

      const response = await fetch(`/api/admin/orders/${orderId}/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro no upload')
      }

      setUploadFiles(prev => 
        prev.map(uf => 
          uf.id === uploadFile.id 
            ? { ...uf, status: 'success', progress: 100, result: data.uploadedFiles?.[0] }
            : uf
        )
      )

      return data

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setUploadFiles(prev => 
        prev.map(uf => 
          uf.id === uploadFile.id 
            ? { ...uf, status: 'error', error: errorMessage }
            : uf
        )
      )
      throw error
    }
  }

  // Upload all pending files
  const uploadAllFiles = async () => {
    const pendingFiles = uploadFiles.filter(uf => uf.status === 'pending')
    if (pendingFiles.length === 0) return

    setIsUploading(true)

    try {
      const results = []
      const errors = []

      // Upload files sequentially to avoid overwhelming server
      for (const uploadFile of pendingFiles) {
        try {
          const result = await uploadFile(uploadFile)
          results.push(result)
        } catch (error) {
          console.error(`Error uploading ${uploadFile.file.name}:`, error)
          errors.push(`${uploadFile.file.name}: ${error.message}`)
        }
      }

      // Call success callback with successful uploads
      const successfulUploads = uploadFiles
        .filter(uf => uf.status === 'success')
        .map(uf => uf.result)
        .filter(Boolean)

      if (successfulUploads.length > 0) {
        onUploadSuccess(successfulUploads)
      }

      // Report any errors
      if (errors.length > 0) {
        onUploadError(errors.join('\n'))
      }

    } finally {
      setIsUploading(false)
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get status icon
  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return <File className="h-5 w-5 text-gray-400" />
      case 'uploading':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
    }
  }

  const hasFilesToUpload = uploadFiles.some(uf => uf.status === 'pending')
  const hasErrors = uploadFiles.some(uf => uf.status === 'error')

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-900">
              Clique para selecionar arquivos ou arraste aqui
            </p>
            <p className="text-sm text-gray-500 mt-1">
              PDF, até {formatFileSize(maxSizeBytes)}, máximo {maxFiles} arquivos
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {uploadFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            Arquivos ({uploadFiles.length})
          </h4>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {uploadFiles.map(uploadFile => (
              <div
                key={uploadFile.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getStatusIcon(uploadFile.status)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadFile.file.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-gray-500">
                        {formatFileSize(uploadFile.file.size)}
                      </p>
                      {uploadFile.status === 'uploading' && (
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-32">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadFile.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    {uploadFile.error && (
                      <p className="text-xs text-red-600 mt-1">
                        {uploadFile.error}
                      </p>
                    )}
                  </div>
                </div>

                {uploadFile.status === 'pending' && (
                  <button
                    onClick={() => removeFile(uploadFile.id)}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {hasFilesToUpload && (
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center space-x-2">
            {hasErrors && (
              <p className="text-sm text-red-600">
                Alguns arquivos falharam no upload
              </p>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setUploadFiles([])}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              disabled={isUploading}
            >
              Limpar Tudo
            </button>
            
            <button
              onClick={uploadAllFiles}
              disabled={isUploading || !hasFilesToUpload}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>
                {isUploading ? 'Enviando...' : 'Enviar Arquivos'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}