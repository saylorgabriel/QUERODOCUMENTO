'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  cpf?: string
  cnpj?: string
  phone?: string
}

interface ProcessedBy {
  id: string
  name: string
  email: string
}

interface Order {
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
  historyCount: number
}

interface ApiResponse {
  success: boolean
  orders: Order[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  filters: {
    status?: string
    serviceType?: string
    search?: string
    dateFrom?: string
    dateTo?: string
  }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  const ordersPerPage = 10

  const searchParams = useSearchParams()

  useEffect(() => {
    // Handle initial filters from URL
    const status = searchParams.get('status')
    const serviceType = searchParams.get('serviceType')
    if (status) setStatusFilter(status)
    if (serviceType) setServiceTypeFilter(serviceType)
    
    loadOrders()
  }, [searchParams])

  useEffect(() => {
    loadOrders()
  }, [statusFilter, serviceTypeFilter, searchTerm, currentPage])

  const loadOrders = async () => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ordersPerPage.toString()
      })
      
      if (statusFilter !== 'ALL') params.append('status', statusFilter)
      if (serviceTypeFilter !== 'ALL') params.append('serviceType', serviceTypeFilter)
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`/api/admin/orders?${params.toString()}`)
      const data: ApiResponse = await response.json()
      
      if (data.success) {
        setOrders(data.orders)
        setPagination(data.pagination)
      } else {
        console.error('Failed to load orders:', data)
        setOrders([])
      }
    } catch (error) {
      console.error('Failed to load orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      AWAITING_PAYMENT: 'bg-orange-100 text-orange-800 border-orange-200',
      PAYMENT_CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
      PAYMENT_REFUSED: 'bg-red-100 text-red-800 border-red-200',
      ORDER_CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
      AWAITING_QUOTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      DOCUMENT_REQUESTED: 'bg-purple-100 text-purple-800 border-purple-200',
      PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200'
    }

    const labels = {
      AWAITING_PAYMENT: 'Aguardando Pagamento',
      PAYMENT_CONFIRMED: 'Pagamento Confirmado',
      PAYMENT_REFUSED: 'Pagamento Recusado',
      ORDER_CONFIRMED: 'Pedido Confirmado',
      AWAITING_QUOTE: 'Aguardando Orçamento',
      DOCUMENT_REQUESTED: 'Documento Solicitado',
      PROCESSING: 'Processando',
      COMPLETED: 'Finalizado',
      CANCELLED: 'Cancelado'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getServiceTypeName = (serviceType: string) => {
    const types = {
      PROTEST_QUERY: 'Consulta',
      CERTIFICATE_REQUEST: 'Certidão'
    }
    return types[serviceType as keyof typeof types] || serviceType
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (value?: number) => {
    if (!value) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Pagination info from API
  const { totalPages, hasNextPage, hasPrevPage } = pagination
  const startIndex = (currentPage - 1) * ordersPerPage + 1
  const endIndex = Math.min(currentPage * ordersPerPage, pagination.totalCount)

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Pedidos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visualize e gerencie todos os pedidos de certidões
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="ALL">Todos os Status</option>
              <option value="AWAITING_PAYMENT">Aguardando Pagamento</option>
              <option value="PAYMENT_CONFIRMED">Pagamento Confirmado</option>
              <option value="PAYMENT_REFUSED">Pagamento Recusado</option>
              <option value="ORDER_CONFIRMED">Pedido Confirmado</option>
              <option value="AWAITING_QUOTE">Aguardando Orçamento</option>
              <option value="DOCUMENT_REQUESTED">Documento Solicitado</option>
              <option value="PROCESSING">Processando</option>
              <option value="COMPLETED">Finalizado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>

          <div>
            <label htmlFor="service-type-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Serviço
            </label>
            <select
              id="service-type-filter"
              value={serviceTypeFilter}
              onChange={(e) => setServiceTypeFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="PROTEST_QUERY">Consulta de Protesto</option>
              <option value="CERTIFICATE_REQUEST">Certidão de Protesto</option>
            </select>
          </div>

          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="CPF/CNPJ, nome, email ou pedido..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter('ALL')
                setServiceTypeFilter('ALL')
                setSearchTerm('')
                setCurrentPage(1)
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {pagination.totalCount} pedido(s) encontrado(s)
            </h3>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum pedido encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Tente alterar os filtros ou aguardar novos pedidos.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        #{order.orderNumber}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {getServiceTypeName(order.serviceType)}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{order.user.name || order.invoiceName}</p>
                        <p>{order.user.email}</p>
                        <p>{order.documentNumber} ({order.documentType})</p>
                        {order.protocolNumber && (
                          <p className="text-xs text-blue-600">Protocolo: {order.protocolNumber}</p>
                        )}
                      </div>
                      <div className="flex-1">
                        <p>Valor: {formatCurrency(order.amount)}</p>
                        <p>Pagamento: {order.paymentMethod}</p>
                        <p>Data: {formatDate(order.createdAt)}</p>
                        {order.processedBy && (
                          <p className="text-xs text-green-600">Processado por: {order.processedBy.name}</p>
                        )}
                      </div>
                    </div>
                    {order.resultText && (
                      <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <p className="font-medium">Resultado:</p>
                        <p className="truncate">{order.resultText}</p>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                    <button 
                      onClick={() => window.open(`/admin/pedidos/${order.id}`, '_blank')}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Ver Detalhes
                    </button>
                    {['ORDER_CONFIRMED', 'AWAITING_QUOTE', 'DOCUMENT_REQUESTED', 'PROCESSING'].includes(order.status) && (
                      <button 
                        onClick={() => window.open(`/admin/pedidos/${order.id}/process`, '_blank')}
                        className="text-green-600 hover:text-green-900 text-sm font-medium"
                      >
                        Processar
                      </button>
                    )}
                    {order.attachmentUrl && (
                      <button 
                        onClick={() => window.open(order.attachmentUrl, '_blank')}
                        className="text-purple-600 hover:text-purple-900 text-sm font-medium"
                      >
                        Baixar
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={!hasPrevPage}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={!hasNextPage}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Próximo
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{startIndex}</span> a{' '}
                    <span className="font-medium">{endIndex}</span> de{' '}
                    <span className="font-medium">{pagination.totalCount}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={!hasPrevPage}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={!hasNextPage}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Próximo
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}