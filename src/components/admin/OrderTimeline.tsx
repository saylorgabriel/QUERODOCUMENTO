'use client'

import React from 'react'
import { 
  Clock,
  CheckCircle,
  X,
  AlertTriangle,
  CreditCard,
  FileCheck,
  User as UserIcon
} from 'lucide-react'

interface User {
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
  changedBy: User
}

interface OrderDetails {
  id: string
  status: string
  createdAt: string
  paidAt?: string
  orderHistories: OrderHistory[]
}

interface OrderTimelineProps {
  order: OrderDetails
}

export default function OrderTimeline({ order }: OrderTimelineProps) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AWAITING_PAYMENT':
        return <CreditCard className="w-4 h-4 text-orange-500" />
      case 'PAYMENT_CONFIRMED':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'PAYMENT_REFUSED':
        return <X className="w-4 h-4 text-red-500" />
      case 'ORDER_CONFIRMED':
        return <FileCheck className="w-4 h-4 text-blue-500" />
      case 'AWAITING_QUOTE':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'DOCUMENT_REQUESTED':
        return <FileCheck className="w-4 h-4 text-purple-500" />
      case 'PROCESSING':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'CANCELLED':
        return <X className="w-4 h-4 text-gray-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AWAITING_PAYMENT':
        return 'border-orange-200 bg-orange-50'
      case 'PAYMENT_CONFIRMED':
        return 'border-green-200 bg-green-50'
      case 'PAYMENT_REFUSED':
        return 'border-red-200 bg-red-50'
      case 'ORDER_CONFIRMED':
        return 'border-blue-200 bg-blue-50'
      case 'AWAITING_QUOTE':
        return 'border-yellow-200 bg-yellow-50'
      case 'DOCUMENT_REQUESTED':
        return 'border-purple-200 bg-purple-50'
      case 'PROCESSING':
        return 'border-blue-200 bg-blue-50'
      case 'COMPLETED':
        return 'border-green-200 bg-green-50'
      case 'CANCELLED':
        return 'border-gray-200 bg-gray-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isToday = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Create timeline events from order history and key dates
  const createTimelineEvents = () => {
    const events: Array<{
      id: string
      title: string
      description: string
      date: string
      icon: React.ReactElement
      color: string
      user: User | null
    }> = []

    // Add creation event
    events.push({
      id: 'created',
      title: 'Pedido Criado',
      description: 'Pedido criado pelo cliente',
      date: order.createdAt,
      icon: <FileCheck className="w-4 h-4 text-blue-500" />,
      color: 'border-blue-200 bg-blue-50',
      user: null
    })

    // Add payment event if exists
    if (order.paidAt) {
      events.push({
        id: 'paid',
        title: 'Pagamento Recebido',
        description: 'Pagamento processado com sucesso',
        date: order.paidAt,
        icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        color: 'border-green-200 bg-green-50',
        user: null
      })
    }

    // Add status change events
    order.orderHistories.forEach(history => {
      events.push({
        id: history.id,
        title: `Status alterado para: ${getStatusLabel(history.newStatus)}`,
        description: history.notes || `Status alterado de "${getStatusLabel(history.previousStatus)}" para "${getStatusLabel(history.newStatus)}"`,
        date: history.changedAt,
        icon: getStatusIcon(history.newStatus),
        color: getStatusColor(history.newStatus),
        user: history.changedBy
      })
    })

    // Sort events by date (newest first)
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const timelineEvents = createTimelineEvents()

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-gray-400" />
          Histórico do Pedido
        </h3>
      </div>

      <div className="px-6 py-6">
        {timelineEvents.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum histórico</h3>
            <p className="mt-1 text-sm text-gray-500">
              O histórico de alterações aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {timelineEvents.map((event, eventIdx) => (
                <li key={event.id}>
                  <div className="relative pb-8">
                    {eventIdx !== timelineEvents.length - 1 ? (
                      <span
                        className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${event.color}`}>
                          {event.icon}
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {event.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {event.description}
                          </p>
                          {event.user && (
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <UserIcon className="w-3 h-3 mr-1" />
                              <span>{event.user.name}</span>
                              <span className="ml-2 text-gray-400">({event.user.email})</span>
                            </div>
                          )}
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-gray-500">
                          <div className="font-medium">
                            {isToday(event.date) ? 'Hoje' : new Date(event.date).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatTime(event.date)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Current Status Summary */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className={`rounded-md p-4 ${getStatusColor(order.status)}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {getStatusIcon(order.status)}
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-800">
                  Status Atual: {getStatusLabel(order.status)}
                </h3>
                <div className="mt-1 text-sm text-gray-600">
                  <p>
                    Última atualização: {formatDate(order.orderHistories[0]?.changedAt || order.createdAt)}
                  </p>
                  {order.orderHistories.length > 0 && (
                    <p className="mt-1">
                      Total de alterações: {order.orderHistories.length}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Processing Guidelines */}
        <div className="mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Próximos Passos
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  {order.status === 'AWAITING_PAYMENT' && (
                    <p>Aguardando confirmação de pagamento. Verifique com o gateway de pagamento.</p>
                  )}
                  {order.status === 'PAYMENT_CONFIRMED' && (
                    <p>Confirme o pedido para iniciar o processamento.</p>
                  )}
                  {order.status === 'ORDER_CONFIRMED' && (
                    <p>Analise os documentos e inicie o processamento ou solicite documentos adicionais.</p>
                  )}
                  {order.status === 'AWAITING_QUOTE' && (
                    <p>Forneça um orçamento para taxas adicionais do cartório.</p>
                  )}
                  {order.status === 'DOCUMENT_REQUESTED' && (
                    <p>Aguardando documentos adicionais do cliente.</p>
                  )}
                  {order.status === 'PROCESSING' && (
                    <p>Processamento em andamento. Atualize quando finalizado.</p>
                  )}
                  {order.status === 'COMPLETED' && (
                    <p>Pedido finalizado com sucesso.</p>
                  )}
                  {order.status === 'CANCELLED' && (
                    <p>Pedido cancelado. Verifique se reembolso é necessário.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}