'use client'

import { useState } from 'react'
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  CreditCard,
  FileText,
  Search,
  DollarSign,
  MessageSquare,
  HelpCircle,
  ChevronRight
} from 'lucide-react'

interface OrderDetails {
  id: string
  serviceType: 'PROTEST_QUERY' | 'CERTIFICATE_REQUEST'
  status: 'AWAITING_PAYMENT' | 'PAYMENT_CONFIRMED' | 'PAYMENT_REFUSED' | 'ORDER_CONFIRMED' | 'AWAITING_QUOTE' | 'DOCUMENT_REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED'
  paymentStatus: string
}

interface StatusWorkflowProps {
  order: OrderDetails
  onStatusChange: (newStatus: string, notes?: string) => void
  updating: boolean
}

interface WorkflowStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'completed' | 'current' | 'pending' | 'blocked'
  actions?: string[]
  tips?: string[]
  estimatedTime?: string
  nextActions?: string[]
}

export default function StatusWorkflow({ order, onStatusChange, updating }: StatusWorkflowProps) {
  const [showStatusTransition, setShowStatusTransition] = useState(false)
  const [transitionNotes, setTransitionNotes] = useState('')
  const [selectedNextStatus, setSelectedNextStatus] = useState('')

  // Define workflow steps based on service type
  const getWorkflowSteps = (): WorkflowStep[] => {
    const isQuery = order.serviceType === 'PROTEST_QUERY'
    const currentStatus = order.status

    const steps: WorkflowStep[] = [
      {
        id: 'AWAITING_PAYMENT',
        title: 'Aguardando Pagamento',
        description: 'Cliente deve efetuar o pagamento para prosseguir',
        icon: <CreditCard className="w-5 h-5" />,
        status: ['AWAITING_PAYMENT', 'PAYMENT_REFUSED'].includes(currentStatus) ? 'current' : 
                ['PAYMENT_CONFIRMED', 'ORDER_CONFIRMED', 'PROCESSING', 'COMPLETED'].includes(currentStatus) ? 'completed' : 'pending',
        tips: [
          'Pagamentos PIX são processados automaticamente',
          'Cartão de crédito pode levar até 2 dias úteis',
          'Entre em contato com cliente se necessário'
        ],
        estimatedTime: 'Imediato a 2 dias'
      },
      {
        id: 'ORDER_CONFIRMED',
        title: 'Pedido Confirmado',
        description: 'Pagamento aprovado, pronto para processamento',
        icon: <CheckCircle2 className="w-5 h-5" />,
        status: currentStatus === 'ORDER_CONFIRMED' ? 'current' : 
                ['PROCESSING', 'AWAITING_QUOTE', 'COMPLETED'].includes(currentStatus) ? 'completed' : 
                currentStatus === 'AWAITING_PAYMENT' || currentStatus === 'PAYMENT_REFUSED' ? 'pending' : 'pending',
        actions: [
          'Iniciar processamento imediatamente',
          'Verificar dados do cliente',
          'Acessar sistema CENPROT'
        ],
        tips: [
          'Este é o momento ideal para iniciar o trabalho',
          'Verifique se todos os dados estão corretos',
          'Registre o início do processamento'
        ],
        estimatedTime: '5 minutos',
        nextActions: ['Mover para "Em Processamento"']
      },
      {
        id: 'PROCESSING',
        title: 'Em Processamento',
        description: isQuery ? 'Realizando consulta de protestos' : 'Processando solicitação de certidão',
        icon: <Search className="w-5 h-5" />,
        status: currentStatus === 'PROCESSING' ? 'current' : 
                ['AWAITING_QUOTE', 'COMPLETED'].includes(currentStatus) ? 'completed' : 
                ['ORDER_CONFIRMED'].includes(currentStatus) ? 'pending' : 
                ['AWAITING_PAYMENT', 'PAYMENT_REFUSED'].includes(currentStatus) ? 'blocked' : 'pending',
        actions: [
          'Acessar CENPROT manualmente',
          'Realizar consulta com CPF/CNPJ',
          'Registrar número do protocolo',
          'Documentar resultados encontrados'
        ],
        tips: [
          'Mantenha o protocolo sempre atualizado',
          'Documente qualquer dificuldade encontrada',
          'Para certidões, verifique se há taxas adicionais'
        ],
        estimatedTime: isQuery ? '30 minutos' : '1-2 horas',
        nextActions: isQuery ? 
          ['Finalizar com resultados'] : 
          ['Solicitar orçamento se necessário', 'Finalizar processamento']
      }
    ]

    // Add certificate-specific steps
    if (!isQuery) {
      steps.push({
        id: 'AWAITING_QUOTE',
        title: 'Aguardando Orçamento',
        description: 'Cliente deve aprovar taxas adicionais do cartório',
        icon: <DollarSign className="w-5 h-5" />,
        status: currentStatus === 'AWAITING_QUOTE' ? 'current' : 
                currentStatus === 'COMPLETED' ? 'completed' : 
                currentStatus === 'PROCESSING' ? 'pending' : 'blocked',
        actions: [
          'Informar valores das taxas cartoriais',
          'Enviar orçamento para aprovação',
          'Aguardar confirmação do cliente'
        ],
        tips: [
          'Seja claro sobre os valores e prazos',
          'Explique que são taxas obrigatórias do cartório',
          'Mantenha contato regular com o cliente'
        ],
        estimatedTime: '1-3 dias úteis',
        nextActions: ['Continuar após aprovação']
      })
    }

    steps.push({
      id: 'COMPLETED',
      title: 'Concluído',
      description: isQuery ? 'Consulta finalizada e resultados enviados' : 'Certidão emitida e entregue',
      icon: <CheckCircle2 className="w-5 h-5" />,
      status: currentStatus === 'COMPLETED' ? 'current' : 'pending',
      actions: [
        'Verificar se resultado foi enviado',
        'Confirmar satisfação do cliente',
        'Arquivar documentação'
      ],
      tips: [
        'Certifique-se de que o cliente recebeu tudo',
        'Mantenha arquivos para auditoria',
        'Registre feedback se houver'
      ],
      estimatedTime: '5 minutos'
    })

    return steps
  }

  const steps = getWorkflowSteps()
  const currentStep = steps.find(step => step.id === order.status)

  // Get possible next statuses
  const getNextStatuses = () => {
    switch (order.status) {
      case 'ORDER_CONFIRMED':
        return [
          { value: 'PROCESSING', label: 'Iniciar Processamento' }
        ]
      case 'PROCESSING':
        const options = [
          { value: 'COMPLETED', label: 'Finalizar Processamento' }
        ]
        if (order.serviceType === 'CERTIFICATE_REQUEST') {
          options.unshift({ value: 'AWAITING_QUOTE', label: 'Solicitar Orçamento' })
        }
        return options
      case 'AWAITING_QUOTE':
        return [
          { value: 'PROCESSING', label: 'Continuar Processamento' },
          { value: 'COMPLETED', label: 'Finalizar' }
        ]
      default:
        return []
    }
  }

  const nextStatuses = getNextStatuses()

  const handleStatusTransition = () => {
    if (selectedNextStatus) {
      onStatusChange(selectedNextStatus, transitionNotes || undefined)
      setShowStatusTransition(false)
      setTransitionNotes('')
      setSelectedNextStatus('')
    }
  }

  const getStatusColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'current':
        return 'text-blue-600 bg-blue-100'
      case 'blocked':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-400 bg-gray-100'
    }
  }

  const getConnectorColor = (index: number) => {
    const step = steps[index]
    const nextStep = steps[index + 1]
    
    if (step.status === 'completed') {
      return 'bg-green-600'
    } else if (step.status === 'current' && nextStep?.status === 'pending') {
      return 'bg-blue-600'
    }
    return 'bg-gray-300'
  }

  return (
    <div className="space-y-8">
      {/* Current status summary */}
      {currentStep && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className={`p-2 rounded-full ${getStatusColor(currentStep.status)}`}>
              {currentStep.icon}
            </div>
            <div className="ml-4 flex-1">
              <h4 className="text-lg font-medium text-blue-900">{currentStep.title}</h4>
              <p className="text-blue-700 mt-1">{currentStep.description}</p>
              
              {currentStep.estimatedTime && (
                <div className="flex items-center mt-2 text-sm text-blue-600">
                  <Clock className="w-4 h-4 mr-1" />
                  Tempo estimado: {currentStep.estimatedTime}
                </div>
              )}

              {/* Next actions */}
              {currentStep.nextActions && currentStep.nextActions.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-blue-800 mb-2">Próximas ações:</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {currentStep.nextActions.map((action, index) => (
                      <li key={index} className="flex items-center">
                        <ChevronRight className="w-3 h-3 mr-1" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status transition controls */}
      {nextStatuses.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ArrowRight className="w-5 h-5 mr-2 text-gray-400" />
            Alterar Status
          </h4>
          
          {!showStatusTransition ? (
            <button
              onClick={() => setShowStatusTransition(true)}
              disabled={updating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Avançar Status
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Novo Status
                </label>
                <select
                  value={selectedNextStatus}
                  onChange={(e) => setSelectedNextStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione o próximo status</option>
                  {nextStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  value={transitionNotes}
                  onChange={(e) => setTransitionNotes(e.target.value)}
                  placeholder="Adicione observações sobre esta alteração de status..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleStatusTransition}
                  disabled={!selectedNextStatus || updating}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {updating ? 'Atualizando...' : 'Confirmar'}
                </button>
                <button
                  onClick={() => {
                    setShowStatusTransition(false)
                    setTransitionNotes('')
                    setSelectedNextStatus('')
                  }}
                  disabled={updating}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Workflow visualization */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-gray-400" />
          Fluxo do Processamento
        </h4>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-12 w-px h-16 bg-gray-300" />
              )}

              <div className="flex items-start">
                {/* Step icon */}
                <div className={`p-3 rounded-full border-2 ${
                  step.status === 'completed' ? 'border-green-200 bg-green-100' :
                  step.status === 'current' ? 'border-blue-200 bg-blue-100' :
                  step.status === 'blocked' ? 'border-red-200 bg-red-100' :
                  'border-gray-200 bg-gray-100'
                }`}>
                  <div className={`${
                    step.status === 'completed' ? 'text-green-600' :
                    step.status === 'current' ? 'text-blue-600' :
                    step.status === 'blocked' ? 'text-red-600' :
                    'text-gray-400'
                  }`}>
                    {step.icon}
                  </div>
                </div>

                {/* Step content */}
                <div className="ml-6 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className={`text-lg font-medium ${
                      step.status === 'completed' ? 'text-green-900' :
                      step.status === 'current' ? 'text-blue-900' :
                      step.status === 'blocked' ? 'text-red-900' :
                      'text-gray-500'
                    }`}>
                      {step.title}
                    </h5>
                    
                    {step.estimatedTime && (
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {step.estimatedTime}
                      </span>
                    )}
                  </div>

                  <p className={`mt-1 ${
                    step.status === 'current' ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {step.description}
                  </p>

                  {/* Actions for current step */}
                  {step.status === 'current' && step.actions && (
                    <div className="mt-4">
                      <h6 className="text-sm font-medium text-gray-900 mb-2">Ações necessárias:</h6>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {step.actions.map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-start">
                            <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tips */}
                  {step.status === 'current' && step.tips && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <div className="flex items-start">
                        <HelpCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <h6 className="text-sm font-medium text-yellow-800">Dicas:</h6>
                          <ul className="mt-1 text-sm text-yellow-700 space-y-1">
                            {step.tips.map((tip, tipIndex) => (
                              <li key={tipIndex}>• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}