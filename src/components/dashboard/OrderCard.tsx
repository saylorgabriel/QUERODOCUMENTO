import React from 'react'
import { 
  Download, 
  Eye, 
  FileText, 
  Search, 
  Calendar,
  CreditCard,
  MapPin,
  Clock,
  ExternalLink
} from 'lucide-react'
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

interface OrderCardProps {
  order: Order
  onViewDetails?: (order: Order) => void
  onDownload?: (order: Order) => void
  compact?: boolean
}

const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  onViewDetails, 
  onDownload, 
  compact = false 
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'PROTEST_QUERY':
        return <Search className="w-5 h-5 text-primary-600" />
      case 'CERTIFICATE_REQUEST':
        return <FileText className="w-5 h-5 text-green-600" />
      default:
        return <FileText className="w-5 h-5 text-neutral-600" />
    }
  }

  const canDownload = order.hasResults && order.attachmentUrl
  const isCompleted = order.status === 'COMPLETED'
  const isPaid = order.paymentStatus === 'COMPLETED'

  if (compact) {
    return (
      <div className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50/30 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              {getServiceIcon(order.serviceType)}
            </div>
            <div>
              <p className="font-medium text-neutral-900">{order.serviceTypeDisplay}</p>
              <p className="text-sm text-neutral-600">
                {order.documentNumber} • {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <OrderStatus status={order.status} paymentStatus={order.paymentStatus} size="sm" />
            {canDownload && (
              <button
                onClick={() => onDownload?.(order)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                title="Baixar documento"
              >
                <Download className="w-4 h-4 text-neutral-600" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card-elevated hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            {getServiceIcon(order.serviceType)}
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">{order.serviceTypeDisplay}</h3>
            <p className="text-sm text-neutral-600">Pedido #{order.orderNumber}</p>
          </div>
        </div>
        <OrderStatus status={order.status} paymentStatus={order.paymentStatus} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-neutral-600 mb-1">Documento</p>
          <p className="font-medium text-neutral-900">{order.documentNumber}</p>
        </div>
        <div>
          <p className="text-neutral-600 mb-1">Valor</p>
          <p className="font-medium text-neutral-900">
            {order.quotedAmount ? formatCurrency(order.quotedAmount) : formatCurrency(order.amount)}
          </p>
        </div>
        <div>
          <p className="text-neutral-600 mb-1">Criado em</p>
          <p className="font-medium text-neutral-900 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(order.createdAt)}
          </p>
        </div>
        {order.paidAt && (
          <div>
            <p className="text-neutral-600 mb-1">Pago em</p>
            <p className="font-medium text-neutral-900 flex items-center gap-1">
              <CreditCard className="w-4 h-4" />
              {formatDateTime(order.paidAt)}
            </p>
          </div>
        )}
      </div>

      {/* Certificate specific info */}
      {order.serviceType === 'CERTIFICATE_REQUEST' && (order.city || order.notaryOffice) && (
        <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {order.city && order.state && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-700">{order.city}, {order.state}</span>
              </div>
            )}
            {order.notaryOffice && (
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4 text-neutral-500" />
                <span className="text-neutral-700">{order.notaryOffice}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Protocol number for completed orders */}
      {order.protocolNumber && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            <strong>Protocolo:</strong> {order.protocolNumber}
          </p>
        </div>
      )}

      {/* Order result/status message */}
      {order.resultText && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">{order.resultText}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Clock className="w-4 h-4" />
          Atualizado em {formatDate(order.updatedAt)}
        </div>
        <div className="flex items-center gap-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(order)}
              className="btn-secondary-sm flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              Detalhes
            </button>
          )}
          {canDownload && (
            <button
              onClick={() => onDownload?.(order)}
              className="btn-primary-sm flex items-center gap-1"
              title="Baixar documento"
            >
              <Download className="w-4 h-4" />
              Baixar
            </button>
          )}
          {!canDownload && isCompleted && (
            <span className="text-sm text-neutral-500 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Documento em preparação
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderCard