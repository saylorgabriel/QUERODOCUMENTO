'use client'

import { useState } from 'react'
import { 
  CheckCircle, 
  Clock, 
  X, 
  AlertTriangle,
  CreditCard,
  FileCheck
} from 'lucide-react'

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

interface OrderDetails {
  id: string
  orderNumber: string
  serviceType: 'PROTEST_QUERY' | 'CERTIFICATE_REQUEST'
  status: string
  paymentStatus: string
  amount: number
  paymentMethod: string
  paidAt?: string
  protocolNumber?: string
  createdAt: string
  updatedAt: string
  user: User
  processedBy?: ProcessedBy
}

interface OrderHeaderProps {
  order: OrderDetails
  onStatusUpdate: (newStatus: string, notes?: string) => void
  updating: boolean
}

export default function OrderHeader({ order, onStatusUpdate, updating }: OrderHeaderProps) {
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [statusNotes, setStatusNotes] = useState('')

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      AWAITING_PAYMENT: 'text-orange-800 bg-orange-100 border-orange-200',
      PAYMENT_CONFIRMED: 'text-green-800 bg-green-100 border-green-200',
      PAYMENT_REFUSED: 'text-red-800 bg-red-100 border-red-200',
      ORDER_CONFIRMED: 'text-blue-800 bg-blue-100 border-blue-200',
      AWAITING_QUOTE: 'text-yellow-800 bg-yellow-100 border-yellow-200',
      DOCUMENT_REQUESTED: 'text-purple-800 bg-purple-100 border-purple-200',
      PROCESSING: 'text-blue-800 bg-blue-100 border-blue-200',
      COMPLETED: 'text-green-800 bg-green-100 border-green-200',
      CANCELLED: 'text-gray-800 bg-gray-100 border-gray-200'
    }
    return colors[status] || 'text-gray-800 bg-gray-100 border-gray-200'
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
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
    return labels[status] || status
  }

  const getPaymentStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: 'text-orange-800 bg-orange-100',
      PROCESSING: 'text-blue-800 bg-blue-100',
      COMPLETED: 'text-green-800 bg-green-100',
      FAILED: 'text-red-800 bg-red-100',
      REFUNDED: 'text-gray-800 bg-gray-100'
    }
    return colors[status] || 'text-gray-800 bg-gray-100'
  }

  const getPaymentStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      PENDING: 'Pendente',
      PROCESSING: 'Processando',
      COMPLETED: 'Concluído',
      FAILED: 'Falhou',
      REFUNDED: 'Reembolsado'
    }
    return labels[status] || status
  }

  const getServiceTypeLabel = (type: string) => {
    return type === 'PROTEST_QUERY' ? 'Consulta de Protesto' : 'Certidão de Protesto'
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: { [key: string]: string } = {
      PIX: 'PIX',
      CREDIT_CARD: 'Cartão de Crédito',
      BOLETO: 'Boleto'
    }
    return labels[method] || method
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
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

  const getAvailableStatuses = () => {
    const currentStatus = order.status
    const statusTransitions: { [key: string]: { status: string; label: string }[] } = {
      AWAITING_PAYMENT: [
        { status: 'PAYMENT_CONFIRMED', label: 'Confirmar Pagamento' },
        { status: 'PAYMENT_REFUSED', label: 'Recusar Pagamento' },
        { status: 'CANCELLED', label: 'Cancelar Pedido' }
      ],
      PAYMENT_CONFIRMED: [
        { status: 'ORDER_CONFIRMED', label: 'Confirmar Pedido' },
        { status: 'CANCELLED', label: 'Cancelar Pedido' }
      ],
      PAYMENT_REFUSED: [
        { status: 'AWAITING_PAYMENT', label: 'Aguardar Pagamento' },
        { status: 'CANCELLED', label: 'Cancelar Pedido' }
      ],
      ORDER_CONFIRMED: [
        { status: 'AWAITING_QUOTE', label: 'Aguardar Orçamento' },
        { status: 'DOCUMENT_REQUESTED', label: 'Solicitar Documento' },
        { status: 'PROCESSING', label: 'Iniciar Processamento' },
        { status: 'CANCELLED', label: 'Cancelar Pedido' }
      ],
      AWAITING_QUOTE: [
        { status: 'ORDER_CONFIRMED', label: 'Voltar para Confirmado' },
        { status: 'PROCESSING', label: 'Iniciar Processamento' },
        { status: 'CANCELLED', label: 'Cancelar Pedido' }
      ],
      DOCUMENT_REQUESTED: [
        { status: 'PROCESSING', label: 'Iniciar Processamento' },
        { status: 'CANCELLED', label: 'Cancelar Pedido' }
      ],
      PROCESSING: [
        { status: 'COMPLETED', label: 'Finalizar Pedido' },
        { status: 'CANCELLED', label: 'Cancelar Pedido' }
      ]
    }

    return statusTransitions[currentStatus] || []
  }

  const handleStatusUpdate = () => {
    if (selectedStatus && selectedStatus !== order.status) {
      onStatusUpdate(selectedStatus, statusNotes || undefined)
      setShowStatusModal(false)
      setSelectedStatus('')
      setStatusNotes('')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'PROCESSING':
        return <Clock className="w-5 h-5 text-blue-500" />
      case 'CANCELLED':
        return <X className="w-5 h-5 text-red-500" />
      case 'PAYMENT_REFUSED':
        return <X className="w-5 h-5 text-red-500" />
      case 'AWAITING_PAYMENT':
        return <CreditCard className="w-5 h-5 text-orange-500" />
      default:
        return <FileCheck className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(order.status)}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {getServiceTypeLabel(order.serviceType)}
                </h2>
                <p className="text-sm text-gray-500">
                  Pedido #{order.orderNumber}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
              
              {getAvailableStatuses().length > 0 && !updating && (
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                >
                  Alterar Status
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Payment Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Pagamento</h4>
              <div className="space-y-1">
                <p className="text-sm text-gray-900 font-medium">
                  {formatCurrency(order.amount)}
                </p>
                <p className="text-sm text-gray-600">
                  {getPaymentMethodLabel(order.paymentMethod)}
                </p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {getPaymentStatusLabel(order.paymentStatus)}
                </span>
              </div>
            </div>

            {/* Dates */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Datas</h4>
              <div className="space-y-1">
                <div>
                  <p className="text-xs text-gray-500">Criado em:</p>
                  <p className="text-sm text-gray-900">{formatDate(order.createdAt)}</p>
                </div>
                {order.paidAt && (
                  <div>
                    <p className="text-xs text-gray-500">Pago em:</p>
                    <p className="text-sm text-gray-900">{formatDate(order.paidAt)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Protocol */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Protocolo</h4>
              <div className="space-y-1">
                {order.protocolNumber ? (
                  <p className="text-sm text-gray-900 font-mono">
                    {order.protocolNumber}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Não gerado
                  </p>
                )}
              </div>
            </div>

            {/* Processing */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Processamento</h4>
              <div className="space-y-1">
                {order.processedBy ? (
                  <div>
                    <p className="text-sm text-gray-900">{order.processedBy.name}</p>
                    <p className="text-xs text-gray-500">{order.processedBy.email}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Não processado
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Alterar Status do Pedido
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Status atual: {getStatusLabel(order.status)}
              </p>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Novo Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um status</option>
                  {getAvailableStatuses().map((statusOption) => (
                    <option key={statusOption.status} value={statusOption.status}>
                      {statusOption.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Adicione observações sobre a mudança de status..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowStatusModal(false)
                  setSelectedStatus('')
                  setStatusNotes('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={!selectedStatus || updating}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Atualizando...' : 'Atualizar Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}