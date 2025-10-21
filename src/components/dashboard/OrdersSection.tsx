'use client'

import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  ExternalLink
} from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  serviceType: 'PROTEST_QUERY' | 'CERTIFICATE_REQUEST'
  status: string
  paymentStatus: string
  documentNumber: string
  documentType: 'CPF' | 'CNPJ'
  amount: number
  paymentMethod: string
  createdAt: string
  updatedAt: string
  documents?: OrderDocument[]
}

interface OrderDocument {
  id: string
  filename: string
  fileSize: number
  mimeType: string
  documentType: 'RESULT' | 'CERTIFICATE' | 'INVOICE' | 'RECEIPT' | 'OTHER'
  uploadedAt: string
  downloadCount: number
  expiresAt?: string
  downloadToken?: string
}

export default function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null)

  // Service type labels
  const serviceTypeLabels = {
    PROTEST_QUERY: 'Consulta de Protesto',
    CERTIFICATE_REQUEST: 'Certidão de Protesto'
  }

  // Payment method labels
  const paymentMethodLabels: { [key: string]: string } = {
    'CREDIT_CARD': 'Cartão de Crédito',
    'PIX': 'PIX',
    'BOLETO': 'Boleto Bancário',
    'BANK_SLIP': 'Boleto Bancário'
  }

  // Status labels and colors
  const statusConfig = {
    AWAITING_PAYMENT: { label: 'Aguardando Pagamento', color: 'bg-yellow-100 text-yellow-800' },
    PAYMENT_CONFIRMED: { label: 'Pagamento Confirmado', color: 'bg-blue-100 text-blue-800' },
    PAYMENT_REFUSED: { label: 'Pagamento Recusado', color: 'bg-red-100 text-red-800' },
    ORDER_CONFIRMED: { label: 'Pedido Confirmado', color: 'bg-blue-100 text-blue-800' },
    AWAITING_QUOTE: { label: 'Aguardando Orçamento', color: 'bg-purple-100 text-purple-800' },
    DOCUMENT_REQUESTED: { label: 'Documento Solicitado', color: 'bg-indigo-100 text-indigo-800' },
    PROCESSING: { label: 'Processando', color: 'bg-orange-100 text-orange-800' },
    COMPLETED: { label: 'Finalizado', color: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' }
  }

  // Document type labels
  const documentTypeLabels = {
    RESULT: 'Resultado',
    CERTIFICATE: 'Certidão',
    INVOICE: 'Nota Fiscal',
    RECEIPT: 'Comprovante',
    OTHER: 'Outros'
  }

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/orders')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao carregar pedidos')
      }

      const data = await response.json()
      setOrders(data.orders || [])

    } catch (err) {
      console.error('Error fetching orders:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos')
    } finally {
      setLoading(false)
    }
  }

  // Download document
  const downloadDocument = async (orderId: string, document: OrderDocument) => {
    try {
      setDownloadingDoc(document.id)
      
      // Build download URL with token if available
      let downloadUrl = `/api/orders/${orderId}/download?documentId=${document.id}`
      if (document.downloadToken) {
        downloadUrl += `&token=${document.downloadToken}`
      }

      const response = await fetch(downloadUrl)
      
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

      // Refresh orders to update download count
      await fetchOrders()
      
    } catch (err) {
      console.error('Error downloading document:', err)
      setError(err instanceof Error ? err.message : 'Erro ao baixar documento')
    } finally {
      setDownloadingDoc(null)
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

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  // Check if document is expired
  const isExpired = (document: OrderDocument): boolean => {
    if (!document.expiresAt) return false
    return new Date(document.expiresAt) <= new Date()
  }

  // Get order icon
  const getOrderIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'PROTEST_QUERY':
        return <Eye className="w-5 h-5" />
      case 'CERTIFICATE_REQUEST':
        return <FileText className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Carregando pedidos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-neutral-900">Meus Pedidos</h2>
          <p className="text-sm text-neutral-600 mt-1">
            {orders.length} pedido(s) encontrado(s)
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
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

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="card-elevated text-center py-12">
          <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">
            Nenhum pedido encontrado
          </h3>
          <p className="text-neutral-600 mb-6">
            Você ainda não fez nenhum pedido. Comece fazendo uma consulta ou solicitando uma certidão.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="btn-secondary">
              Nova Consulta
            </button>
            <a href="/certidao-protesto" className="btn-primary">
              Solicitar Certidão
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card-elevated">
              {/* Order Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                    {getOrderIcon(order.serviceType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-neutral-900">
                        {serviceTypeLabels[order.serviceType]}
                      </h3>
                      <span className="text-sm text-neutral-500">
                        #{order.orderNumber}
                      </span>
                    </div>
                    
                    <p className="text-sm text-neutral-600 mt-1">
                      {order.documentType}: {order.documentNumber}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-neutral-500 mt-2">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(order.createdAt)}
                      </span>
                      <span className="flex items-center">
                        <CreditCard className="h-3 w-3 mr-1" />
                        R$ {order.amount.toFixed(2)}
                      </span>
                      <span>{paymentMethodLabels[order.paymentMethod] || order.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-col items-end space-y-2">
                  {/* Only show status badge if payment is not CONFIRMED */}
                  {!(order.paymentStatus === 'CONFIRMED' || order.paymentStatus === 'RECEIVED') && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusConfig[order.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800'
                    }`}>
                      {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
                    </span>
                  )}

                  {/* Payment Status Badge */}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.paymentStatus === 'CONFIRMED' || order.paymentStatus === 'RECEIVED'
                      ? 'bg-green-100 text-green-800' :
                    order.paymentStatus === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800' :
                    order.paymentStatus === 'FAILED'
                      ? 'bg-red-100 text-red-800' :
                    order.paymentStatus === 'COMPLETED'
                      ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    Pagamento: {
                      order.paymentStatus === 'CONFIRMED' || order.paymentStatus === 'RECEIVED'
                        ? 'CONFIRMADO' :
                      order.paymentStatus === 'PENDING'
                        ? 'PENDENTE' :
                      order.paymentStatus === 'FAILED'
                        ? 'FALHOU' :
                      order.paymentStatus === 'COMPLETED'
                        ? 'CONCLUÍDO' :
                      order.paymentStatus
                    }
                  </span>
                </div>
              </div>

              {/* Documents Section */}
              {order.documents && order.documents.length > 0 && (
                <div className="border-t border-neutral-200 pt-4">
                  <h4 className="text-sm font-medium text-neutral-900 mb-3">
                    Documentos Disponíveis ({order.documents.length})
                  </h4>
                  
                  <div className="space-y-2">
                    {order.documents.map((document) => (
                      <div
                        key={document.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isExpired(document) ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <FileText className={`h-5 w-5 ${
                            isExpired(document) ? 'text-red-400' : 'text-gray-400'
                          }`} />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-neutral-900 truncate">
                                {document.filename}
                              </p>
                              
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {documentTypeLabels[document.documentType]}
                              </span>
                              
                              {isExpired(document) && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  Expirado
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-3 text-xs text-neutral-500 mt-1">
                              <span>{formatFileSize(document.fileSize)}</span>
                              <span>Enviado em {formatDate(document.uploadedAt)}</span>
                              {document.downloadCount > 0 && (
                                <span>{document.downloadCount} download(s)</span>
                              )}
                              {document.expiresAt && (
                                <span>Expira em {formatDate(document.expiresAt)}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Document Actions */}
                        <div className="flex items-center space-x-1 ml-3">
                          <button
                            onClick={() => downloadDocument(order.id, document)}
                            disabled={downloadingDoc === document.id || isExpired(document)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            title={isExpired(document) ? 'Documento expirado' : 'Baixar documento'}
                          >
                            {downloadingDoc === document.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Documents Available */}
              {(!order.documents || order.documents.length === 0) && order.status !== 'COMPLETED' && (
                <div className="border-t border-neutral-200 pt-4">
                  <div className="text-center py-4 text-neutral-500">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-neutral-300" />
                    <p className="text-sm">Documentos ainda não disponíveis</p>
                    <p className="text-xs mt-1">
                      Os documentos aparecerão aqui quando o pedido for processado
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}