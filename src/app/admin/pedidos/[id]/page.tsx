'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Printer, AlertTriangle } from 'lucide-react'
import OrderHeader from '@/components/admin/OrderHeader'
import ClientInfo from '@/components/admin/ClientInfo'
import ServiceDetails from '@/components/admin/ServiceDetails'
import OrderTimeline from '@/components/admin/OrderTimeline'
import ProcessingPanel from '@/components/admin/processing/ProcessingPanel'
import DocumentManager from '@/components/admin/DocumentManager'

interface User {
  id: string
  name: string
  email: string
  cpf?: string
  cnpj?: string
  phone?: string
  createdAt: string
}

interface ProcessedBy {
  id: string
  name: string
  email: string
}

interface OrderHistory {
  id: string
  previousStatus: string
  newStatus: string
  notes?: string
  changedAt: string
  changedBy: {
    id: string
    name: string
    email: string
  }
}

interface OrderDetails {
  id: string
  orderNumber: string
  serviceType: 'PROTEST_QUERY' | 'CERTIFICATE_REQUEST'
  status: 'AWAITING_PAYMENT' | 'PAYMENT_CONFIRMED' | 'PAYMENT_REFUSED' | 'ORDER_CONFIRMED' | 'AWAITING_QUOTE' | 'DOCUMENT_REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  
  // Document information
  documentNumber: string
  documentType: 'CPF' | 'CNPJ'
  
  // Invoice information
  invoiceName: string
  invoiceDocument: string
  
  // Processing information
  protocolNumber?: string
  processingNotes?: string
  resultText?: string
  quotedAmount?: number
  
  // Payment information
  amount: number
  paymentMethod: 'PIX' | 'CREDIT_CARD' | 'BOLETO'
  paidAt?: string
  
  // Attachments
  attachmentUrl?: string
  
  // Certificate specific
  state?: string
  city?: string
  notaryOffice?: string
  reason?: string
  
  // Timestamps
  createdAt: string
  updatedAt: string
  
  // Relations
  user: User
  processedBy?: ProcessedBy
  orderHistories: OrderHistory[]
}

interface ApiResponse {
  success: boolean
  order: OrderDetails
}

export default function AdminOrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()

  const loadOrderDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/orders/${resolvedParams.id}`)
      const data: ApiResponse = await response.json()

      if (data.success) {
        setOrder(data.order)
      } else {
        if (response.status === 404) {
          setError('Pedido não encontrado')
        } else {
          setError('Erro ao carregar detalhes do pedido')
        }
      }
    } catch (error) {
      console.error('Failed to load order details:', error)
      setError('Erro ao carregar detalhes do pedido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrderDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id])

  const handleStatusUpdate = async (newStatus: string, notes?: string) => {
    if (!order) return

    try {
      setUpdating(true)
      
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          notes
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Reload order details to get updated data
        await loadOrderDetails()
      } else {
        setError(data.error || 'Erro ao atualizar status')
      }
    } catch (error) {
      console.error('Failed to update status:', error)
      setError('Erro ao atualizar status')
    } finally {
      setUpdating(false)
    }
  }

  const handleProcessingUpdate = async (data: {
    processingNotes?: string
    resultText?: string
    protocolNumber?: string
    quotedAmount?: number
  }) => {
    if (!order) return

    try {
      setUpdating(true)
      
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()
      
      if (result.success) {
        // Reload order details to get updated data
        await loadOrderDetails()
      } else {
        setError(result.error || 'Erro ao atualizar dados')
      }
    } catch (error) {
      console.error('Failed to update processing data:', error)
      setError('Erro ao atualizar dados')
    } finally {
      setUpdating(false)
    }
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const handleBackToOrders = () => {
    router.push('/admin/pedidos')
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="h-4 bg-gray-200 rounded w-64 mb-6"></div>
          
          {/* Header skeleton */}
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          
          {/* Content skeleton */}
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !order) {
    return (
      <div className="p-6">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <button
                onClick={handleBackToOrders}
                className="text-gray-400 hover:text-gray-500 flex items-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Admin
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <span className="text-gray-500">/</span>
                <button
                  onClick={handleBackToOrders}
                  className="ml-4 text-gray-400 hover:text-gray-500"
                >
                  Pedidos
                </button>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="text-gray-500">/</span>
                <span className="ml-4 text-gray-700">Erro</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Error message */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {error || 'Pedido não encontrado'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Verifique se o ID do pedido está correto ou tente novamente.
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button
              onClick={handleBackToOrders}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Voltar aos Pedidos
            </button>
            <button
              onClick={loadOrderDetails}
              className="bg-gray-200 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <button
              onClick={handleBackToOrders}
              className="text-gray-400 hover:text-gray-500 flex items-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Admin
            </button>
          </li>
          <li>
            <div className="flex items-center">
              <span className="text-gray-500">/</span>
              <button
                onClick={handleBackToOrders}
                className="ml-4 text-gray-400 hover:text-gray-500"
              >
                Pedidos
              </button>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="text-gray-500">/</span>
              <span className="ml-4 text-gray-700">#{order.orderNumber}</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Pedido #{order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Detalhes completos do pedido
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleBackToOrders}
            className="bg-gray-200 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Printer className="w-5 h-5 mr-2" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="space-y-6">
        {/* Order Header */}
        <OrderHeader 
          order={order}
          onStatusUpdate={handleStatusUpdate}
          updating={updating}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Information */}
            <ClientInfo order={order} />
            
            {/* Service Details */}
            <ServiceDetails order={order} />
            
            {/* Processing Panel - Comprehensive workflow management */}
            <ProcessingPanel
              order={order}
              onUpdate={handleProcessingUpdate}
              onStatusChange={handleStatusUpdate}
              updating={updating}
            />

            {/* Document Manager */}
            <DocumentManager
              orderId={order.id}
              onDocumentsChange={() => loadOrderDetails()} // Reload order when documents change
            />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Order Timeline */}
            <OrderTimeline order={order} />
          </div>
        </div>
      </div>
    </div>
  )
}