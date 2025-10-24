'use client'

import { useState } from 'react'
import { 
  ClipboardCheck, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  User,
  FileText
} from 'lucide-react'
import StatusWorkflow from './StatusWorkflow'
import ProtocolManager from './ProtocolManager'
import ResultsForm from './ResultsForm'
import QuotingInterface from './QuotingInterface'

interface OrderDetails {
  id: string
  orderNumber: string
  serviceType: 'PROTEST_QUERY' | 'CERTIFICATE_REQUEST'
  status: 'AWAITING_PAYMENT' | 'PAYMENT_CONFIRMED' | 'PAYMENT_REFUSED' | 'ORDER_CONFIRMED' | 'AWAITING_QUOTE' | 'DOCUMENT_REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'
  documentNumber: string
  documentType: 'CPF' | 'CNPJ'
  protocolNumber?: string
  processingNotes?: string
  resultText?: string
  quotedAmount?: number
  state?: string
  city?: string
  notaryOffice?: string
  reason?: string
  user: {
    name: string
    email: string
    phone?: string
  }
}

interface ProcessingPanelProps {
  order: OrderDetails
  onUpdate: (data: any) => void
  onStatusChange: (newStatus: string, notes?: string) => void
  updating: boolean
}

export default function ProcessingPanel({ order, onUpdate, onStatusChange, updating }: ProcessingPanelProps) {
  const [activePanel, setActivePanel] = useState<'workflow' | 'protocol' | 'results' | 'quoting'>('workflow')

  // Determine if order can be processed
  const canProcess = ['ORDER_CONFIRMED', 'AWAITING_QUOTE', 'DOCUMENT_REQUESTED', 'PROCESSING'].includes(order.status)
  const isCompleted = order.status === 'COMPLETED'
  const needsPayment = ['AWAITING_PAYMENT', 'PAYMENT_REFUSED'].includes(order.status)
  const needsQuote = order.status === 'AWAITING_QUOTE'
  const isProcessing = order.status === 'PROCESSING'

  // Get service type display
  const serviceTypeDisplay = order.serviceType === 'PROTEST_QUERY' ? 'Consulta de Protesto' : 'Certidão de Protesto'
  const documentDisplay = order.documentType === 'CPF' ? 'CPF' : 'CNPJ'

  // Quick actions based on current status
  const getQuickActions = () => {
    const actions = []

    if (order.status === 'ORDER_CONFIRMED') {
      actions.push({
        label: 'Iniciar Processamento',
        onClick: () => onStatusChange('PROCESSING', 'Processamento iniciado'),
        color: 'bg-blue-600 hover:bg-blue-700',
        icon: <ArrowRight className="w-4 h-4" />
      })
    }

    if (order.status === 'PROCESSING' && order.serviceType === 'CERTIFICATE_REQUEST') {
      actions.push({
        label: 'Solicitar Orçamento',
        onClick: () => onStatusChange('AWAITING_QUOTE', 'Aguardando aprovação do orçamento pelo cliente'),
        color: 'bg-orange-600 hover:bg-orange-700',
        icon: <FileText className="w-4 h-4" />
      })
    }

    if (order.status === 'PROCESSING') {
      actions.push({
        label: 'Finalizar Processamento',
        onClick: () => onStatusChange('COMPLETED', 'Processamento concluído'),
        color: 'bg-green-600 hover:bg-green-700',
        icon: <CheckCircle2 className="w-4 h-4" />
      })
    }

    return actions
  }

  const quickActions = getQuickActions()

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ClipboardCheck className="w-5 h-5 mr-2 text-gray-400" />
              Painel de Processamento
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {serviceTypeDisplay} • {documentDisplay}: {order.documentNumber}
            </p>
          </div>

          {/* Status indicator */}
          <div className="flex items-center space-x-3">
            {needsPayment && (
              <div className="flex items-center text-red-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Aguardando Pagamento</span>
              </div>
            )}
            {canProcess && (
              <div className="flex items-center text-blue-600">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Pode Processar</span>
              </div>
            )}
            {isCompleted && (
              <div className="flex items-center text-green-600">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Concluído</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        {quickActions.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={updating}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-md ${action.color} disabled:opacity-50`}
              >
                {action.icon}
                <span className="ml-2">{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Processing guidance for specific statuses */}
      <div className="px-6 py-4">
        {needsPayment && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Aguardando Pagamento</h4>
                <p className="mt-1 text-sm text-red-700">
                  Este pedido não pode ser processado até que o pagamento seja confirmado. 
                  Entre em contato com o cliente se necessário.
                </p>
              </div>
            </div>
          </div>
        )}

        {order.status === 'ORDER_CONFIRMED' && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div className="flex">
              <HelpCircle className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">Pronto para Processamento</h4>
                <div className="mt-1 text-sm text-blue-700">
                  <p className="mb-2">Siga estes passos para processar o pedido:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Clique em "Iniciar Processamento" para alterar o status</li>
                    <li>Acesse o sistema CENPROT manualmente</li>
                    <li>Realize a consulta com os dados do cliente</li>
                    <li>Registre o número do protocolo na aba "Protocolo"</li>
                    <li>Insira os resultados na aba "Resultados"</li>
                    <li>Se for certidão, informe orçamento se necessário</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex">
              <Clock className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Em Processamento</h4>
                <p className="mt-1 text-sm text-yellow-700">
                  Mantenha as informações atualizadas. Use as abas abaixo para gerenciar o protocolo, 
                  registrar resultados e criar orçamentos quando necessário.
                </p>
              </div>
            </div>
          </div>
        )}

        {needsQuote && (
          <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-6">
            <div className="flex">
              <FileText className="h-5 w-5 text-orange-400 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-orange-800">Aguardando Aprovação de Orçamento</h4>
                <p className="mt-1 text-sm text-orange-700">
                  O cliente foi notificado sobre o orçamento adicional. O processamento continuará 
                  após a aprovação. Use a aba "Orçamento" para gerenciar os valores.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Client info quick reference */}
        {/* <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
          <div className="flex items-start">
            <User className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-800">Informações do Cliente</h4>
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Nome:</span> {order.user.name}</p>
                <p><span className="font-medium">Email:</span> {order.user.email}</p>
                {order.user.phone && <p><span className="font-medium">Telefone:</span> {order.user.phone}</p>}
                <p><span className="font-medium">Documento:</span> {order.documentType} {order.documentNumber}</p>
                {order.state && <p><span className="font-medium">Estado:</span> {order.state}</p>}
                {order.city && <p><span className="font-medium">Cidade:</span> {order.city}</p>}
                {order.notaryOffice && <p><span className="font-medium">Cartório:</span> {order.notaryOffice}</p>}
                {order.reason && <p><span className="font-medium">Motivo:</span> {order.reason}</p>}
              </div>
            </div>
          </div>
        </div> */}

        {/* Tab navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'workflow', label: 'Fluxo', icon: <ClipboardCheck className="w-4 h-4" /> },
              { id: 'protocol', label: 'Protocolo', icon: <FileText className="w-4 h-4" /> },
              { id: 'results', label: 'Resultados', icon: <CheckCircle2 className="w-4 h-4" /> },
              ...(order.serviceType === 'CERTIFICATE_REQUEST' ? [
                { id: 'quoting', label: 'Orçamento', icon: <FileText className="w-4 h-4" /> }
              ] : [])
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activePanel === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Panel content */}
        <div className="py-6">
          {activePanel === 'workflow' && (
            <StatusWorkflow 
              order={order} 
              onStatusChange={onStatusChange}
              updating={updating}
            />
          )}
          
          {activePanel === 'protocol' && (
            <ProtocolManager 
              order={order} 
              onUpdate={onUpdate}
              updating={updating}
            />
          )}
          
          {activePanel === 'results' && (
            <ResultsForm 
              order={order} 
              onUpdate={onUpdate}
              updating={updating}
            />
          )}
          
          {activePanel === 'quoting' && order.serviceType === 'CERTIFICATE_REQUEST' && (
            <QuotingInterface 
              order={order} 
              onUpdate={onUpdate}
              onStatusChange={onStatusChange}
              updating={updating}
            />
          )}
        </div>
      </div>
    </div>
  )
}