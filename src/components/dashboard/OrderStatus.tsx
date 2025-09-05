import React from 'react'
import { CheckCircle, Clock, XCircle, AlertCircle, CreditCard, FileText } from 'lucide-react'

interface OrderStatusProps {
  status: string
  paymentStatus?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

const OrderStatus: React.FC<OrderStatusProps> = ({ 
  status, 
  paymentStatus, 
  size = 'md', 
  showIcon = true 
}) => {
  const getStatusConfig = (status: string, paymentStatus?: string) => {
    // Payment status takes precedence for display
    if (paymentStatus === 'REFUSED' || paymentStatus === 'FAILED') {
      return {
        label: 'Pagamento Recusado',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle
      }
    }

    switch (status) {
      case 'AWAITING_PAYMENT':
        return {
          label: 'Aguardando Pagamento',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: CreditCard
        }
      case 'PAYMENT_CONFIRMED':
        return {
          label: 'Pagamento Confirmado',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: CheckCircle
        }
      case 'PAYMENT_REFUSED':
        return {
          label: 'Pagamento Recusado',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle
        }
      case 'ORDER_CONFIRMED':
        return {
          label: 'Pedido Confirmado',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        }
      case 'AWAITING_QUOTE':
        return {
          label: 'Aguardando Orçamento',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Clock
        }
      case 'DOCUMENT_REQUESTED':
        return {
          label: 'Documento Solicitado',
          color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          icon: FileText
        }
      case 'PROCESSING':
        return {
          label: 'Processando',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: Clock
        }
      case 'COMPLETED':
        return {
          label: 'Finalizado',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        }
      case 'CANCELLED':
        return {
          label: 'Cancelado',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: XCircle
        }
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle
        }
    }
  }

  const config = getStatusConfig(status, paymentStatus)
  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full font-medium border
      ${config.color} 
      ${sizeClasses[size]}
    `}>
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  )
}

export default OrderStatus