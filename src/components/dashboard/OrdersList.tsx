import React, { useState, useEffect } from 'react'
import { 
  Filter, 
  Search, 
  RefreshCw,
  ChevronDown,
  X,
  AlertCircle
} from 'lucide-react'
import OrderCard from './OrderCard'
import OrderStatus from './OrderStatus'

interface Order {
  id: string
  orderNumber: string
  serviceType: string
  serviceTypeDisplay: string
  status: string
  statusDisplay: string
  paymentStatus: string
  documentNumber: string
  documentType: string
  invoiceName: string
  amount: number
  paymentMethod?: string
  paidAt?: string
  hasResults: boolean
  resultText?: string
  attachmentUrl?: string
  quotedAmount?: number
  protocolNumber?: string
  state?: string
  city?: string
  notaryOffice?: string
  reason?: string
  createdAt: string
  updatedAt: string
}

interface OrdersSummary {
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  cancelledOrders: number
  totalSpent: number
}

interface Pagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface OrdersListProps {
  compact?: boolean
  limit?: number
  showFilters?: boolean
  showPagination?: boolean
  onOrderClick?: (order: Order) => void
  onOrderDownload?: (order: Order) => void
}

const OrdersList: React.FC<OrdersListProps> = ({
  compact = false,
  limit = 10,
  showFilters = true,
  showPagination = true,
  onOrderClick,
  onOrderDownload
}) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [summary, setSummary] = useState<OrdersSummary | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Filter states
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [serviceTypeFilter, setServiceTypeFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)

  const fetchOrders = async (page = 1, showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })

      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter)
      }

      if (serviceTypeFilter !== 'ALL') {
        params.append('serviceType', serviceTypeFilter)
      }

      const response = await fetch(`/api/user/orders?${params}`)
      
      if (!response.ok) {
        throw new Error('Falha ao carregar pedidos')
      }

      const data = await response.json()

      if (data.success) {
        setOrders(data.orders)
        setSummary(data.summary)
        setPagination(data.pagination)
        setCurrentPage(page)
      } else {
        throw new Error(data.error || 'Erro desconhecido')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos')
      setOrders([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchOrders(1)
  }, [statusFilter, serviceTypeFilter])

  const handleRefresh = () => {
    fetchOrders(currentPage, false)
  }

  const handlePageChange = (newPage: number) => {
    fetchOrders(newPage)
  }

  const handleDownload = async (order: Order) => {
    if (!order.attachmentUrl) return

    try {
      // Create a temporary link and trigger download
      const link = document.createElement('a')
      link.href = order.attachmentUrl
      link.download = `${order.serviceTypeDisplay}-${order.orderNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      if (onOrderDownload) {
        onOrderDownload(order)
      }
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  // Filter orders by search term
  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.documentNumber.toLowerCase().includes(searchLower) ||
      order.serviceTypeDisplay.toLowerCase().includes(searchLower) ||
      order.statusDisplay.toLowerCase().includes(searchLower)
    )
  })

  const statusOptions = [
    { value: 'ALL', label: 'Todos os Status' },
    { value: 'AWAITING_PAYMENT', label: 'Aguardando Pagamento' },
    { value: 'PAYMENT_CONFIRMED', label: 'Pagamento Confirmado' },
    { value: 'ORDER_CONFIRMED', label: 'Pedido Confirmado' },
    { value: 'PROCESSING', label: 'Processando' },
    { value: 'COMPLETED', label: 'Finalizado' },
    { value: 'CANCELLED', label: 'Cancelado' }
  ]

  const serviceTypeOptions = [
    { value: 'ALL', label: 'Todos os Serviços' },
    { value: 'PROTEST_QUERY', label: 'Consulta de Protesto' },
    { value: 'CERTIFICATE_REQUEST', label: 'Certidão de Protesto' }
  ]

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-4">
        {showFilters && (
          <div className="card-elevated">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="h-10 bg-neutral-200 rounded"></div>
                <div className="h-10 bg-neutral-200 rounded"></div>
                <div className="h-10 bg-neutral-200 rounded"></div>
                <div className="h-10 bg-neutral-200 rounded"></div>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-elevated animate-pulse">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-neutral-200 rounded-lg"></div>
                    <div>
                      <div className="h-4 bg-neutral-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-neutral-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-neutral-200 rounded w-20"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="h-3 bg-neutral-200 rounded w-16 mb-1"></div>
                    <div className="h-4 bg-neutral-200 rounded w-24"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-neutral-200 rounded w-12 mb-1"></div>
                    <div className="h-4 bg-neutral-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card-elevated text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Erro ao carregar pedidos</h3>
        <p className="text-neutral-600 mb-4">{error}</p>
        <button
          onClick={() => fetchOrders(1)}
          className="btn-primary"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Filtros</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
                title="Atualizar"
              >
                <RefreshCw className={`w-4 h-4 text-neutral-600 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="lg:hidden btn-secondary-sm"
              >
                <Filter className="w-4 h-4" />
                Filtros
                <ChevronDown className={`w-4 h-4 transition-transform ${showFiltersPanel ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          <div className={`grid grid-cols-1 lg:grid-cols-4 gap-4 ${showFiltersPanel ? 'block' : 'hidden lg:grid'}`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Buscar pedidos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-primary pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-primary"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={serviceTypeFilter}
              onChange={(e) => setServiceTypeFilter(e.target.value)}
              className="input-primary"
            >
              {serviceTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {(statusFilter !== 'ALL' || serviceTypeFilter !== 'ALL' || searchTerm) && (
              <button
                onClick={() => {
                  setStatusFilter('ALL')
                  setServiceTypeFilter('ALL')
                  setSearchTerm('')
                }}
                className="btn-secondary-sm flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Limpar Filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              compact={compact}
              onViewDetails={onOrderClick}
              onDownload={handleDownload}
            />
          ))}
        </div>
      ) : (
        <div className="card-elevated text-center py-12">
          <Search className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            {searchTerm || statusFilter !== 'ALL' || serviceTypeFilter !== 'ALL'
              ? 'Nenhum pedido encontrado'
              : 'Nenhum pedido ainda'
            }
          </h3>
          <p className="text-neutral-600">
            {searchTerm || statusFilter !== 'ALL' || serviceTypeFilter !== 'ALL'
              ? 'Tente ajustar os filtros de busca'
              : 'Faça sua primeira consulta ou solicite uma certidão'
            }
          </p>
        </div>
      )}

      {/* Pagination */}
      {showPagination && pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-600">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.totalCount)} de{' '}
            {pagination.totalCount} pedidos
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage || loading}
              className="btn-secondary-sm disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-neutral-600">
              {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage || loading}
              className="btn-secondary-sm disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersList