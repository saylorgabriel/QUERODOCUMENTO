'use client'

import { useState, useEffect } from 'react'
import { 
  Hash, 
  Calendar, 
  Clock,
  Copy,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Search,
  Info,
  RefreshCw,
  Save
} from 'lucide-react'

interface OrderDetails {
  id: string
  serviceType: 'PROTEST_QUERY' | 'CERTIFICATE_REQUEST'
  documentNumber: string
  documentType: 'CPF' | 'CNPJ'
  protocolNumber?: string
  processingNotes?: string
  createdAt: string
  updatedAt: string
  state?: string
  city?: string
}

interface ProtocolManagerProps {
  order: OrderDetails
  onUpdate: (data: { protocolNumber?: string; processingNotes?: string }) => void
  updating: boolean
}

export default function ProtocolManager({ order, onUpdate, updating }: ProtocolManagerProps) {
  const [protocolNumber, setProtocolNumber] = useState(order.protocolNumber || '')
  const [notes, setNotes] = useState(order.processingNotes || '')
  const [hasChanges, setHasChanges] = useState(false)
  const [copiedProtocol, setCopiedProtocol] = useState(false)

  useEffect(() => {
    const protocolChanged = protocolNumber !== (order.protocolNumber || '')
    const notesChanged = notes !== (order.processingNotes || '')
    setHasChanges(protocolChanged || notesChanged)
  }, [protocolNumber, notes, order.protocolNumber, order.processingNotes])

  const generateProtocolSuggestion = () => {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    const day = String(new Date().getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
    
    return `${year}${month}${day}${random}`
  }

  const handleSave = () => {
    if (hasChanges) {
      onUpdate({
        protocolNumber: protocolNumber || undefined,
        processingNotes: notes || undefined
      })
    }
  }

  const handleReset = () => {
    setProtocolNumber(order.protocolNumber || '')
    setNotes(order.processingNotes || '')
  }

  const handleCopyProtocol = async () => {
    if (protocolNumber) {
      try {
        await navigator.clipboard.writeText(protocolNumber)
        setCopiedProtocol(true)
        setTimeout(() => setCopiedProtocol(false), 2000)
      } catch (err) {
        console.error('Failed to copy protocol number:', err)
      }
    }
  }

  const handleProtocolSuggestion = () => {
    const suggestion = generateProtocolSuggestion()
    setProtocolNumber(suggestion)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getProtocolValidation = (protocol: string) => {
    if (!protocol) return null
    
    // Basic validation rules
    const isNumeric = /^\d+$/.test(protocol)
    const isValidLength = protocol.length >= 6 && protocol.length <= 20
    const isCurrentYear = protocol.startsWith(new Date().getFullYear().toString())
    
    if (!isNumeric) {
      return { type: 'error', message: 'Protocolo deve conter apenas números' }
    }
    
    if (!isValidLength) {
      return { type: 'warning', message: 'Protocolo deve ter entre 6 e 20 dígitos' }
    }
    
    if (!isCurrentYear) {
      return { type: 'warning', message: 'Verifique se o protocolo é do ano atual' }
    }
    
    return { type: 'success', message: 'Protocolo válido' }
  }

  const protocolValidation = getProtocolValidation(protocolNumber)

  return (
    <div className="space-y-6">
      {/* Header with instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Como obter o protocolo CENPROT</h4>
            <div className="mt-2 text-sm text-blue-700">
              <ol className="list-decimal list-inside space-y-1">
                <li>Acesse o sistema CENPROT manualmente</li>
                <li>Realize a consulta com {order.documentType} {order.documentNumber}</li>
                <li>Copie o número do protocolo gerado</li>
                <li>Cole o protocolo no campo abaixo</li>
                <li>Adicione observações sobre o processo se necessário</li>
              </ol>
            </div>
            
            <div className="mt-3 flex items-center text-sm text-blue-600">
              <ExternalLink className="w-4 h-4 mr-1" />
              <span>Sistema CENPROT deve ser acessado separadamente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Protocol number input */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900 flex items-center">
            <Hash className="w-5 h-5 mr-2 text-gray-400" />
            Número do Protocolo
          </h4>
          
          {!protocolNumber && (
            <button
              onClick={handleProtocolSuggestion}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Gerar Sugestão
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex">
              <input
                type="text"
                value={protocolNumber}
                onChange={(e) => setProtocolNumber(e.target.value)}
                placeholder="Ex: 20240123001234"
                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              
              {protocolNumber && (
                <button
                  onClick={handleCopyProtocol}
                  className="border-t border-r border-b border-gray-300 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-r-md flex items-center"
                >
                  {copiedProtocol ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              )}
            </div>

            {/* Protocol validation */}
            {protocolValidation && (
              <div className={`mt-2 flex items-center text-sm ${
                protocolValidation.type === 'error' ? 'text-red-600' :
                protocolValidation.type === 'warning' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {protocolValidation.type === 'error' ? (
                  <AlertTriangle className="w-4 h-4 mr-1" />
                ) : protocolValidation.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 mr-1" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                )}
                {protocolValidation.message}
              </div>
            )}
            
            <p className="mt-2 text-xs text-gray-500">
              Número único fornecido pelo sistema CENPROT após realizar a consulta
            </p>
          </div>

          {/* Protocol info */}
          {order.protocolNumber && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Protocolo Atual</p>
                  <p className="text-sm text-gray-600 font-mono">{order.protocolNumber}</p>
                </div>
                <button
                  onClick={() => setProtocolNumber(order.protocolNumber || '')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Restaurar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Processing notes */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Search className="w-5 h-5 mr-2 text-gray-400" />
          Observações do Processamento
        </h4>

        <div className="space-y-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Descreva o processo de consulta, dificuldades encontradas, status atual, próximos passos, etc..."
            rows={6}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <p className="text-xs text-gray-500">
            Use este campo para documentar o progresso, dificuldades e informações importantes para a equipe
          </p>

          {/* Common templates */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Templates Comuns:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                {
                  label: 'Consulta Iniciada',
                  template: `Consulta iniciada em ${formatDate(new Date().toISOString())}.\nAcessando sistema CENPROT para ${order.documentType} ${order.documentNumber}.`
                },
                {
                  label: 'Aguardando Sistema',
                  template: `Sistema CENPROT temporariamente indisponível.\nNova tentativa será realizada em breve.`
                },
                {
                  label: 'Consulta Finalizada',
                  template: `Consulta realizada com sucesso.\nProtocolo obtido e resultados sendo processados.`
                },
                {
                  label: 'Necessita Esclarecimento',
                  template: `Dados do cliente necessitam esclarecimento.\nEntrando em contato para confirmação de informações.`
                }
              ].map((template) => (
                <button
                  key={template.label}
                  onClick={() => setNotes(template.template)}
                  className="text-left p-3 text-sm border border-gray-200 rounded-md hover:bg-gray-50 hover:border-blue-300"
                >
                  <div className="font-medium text-gray-900">{template.label}</div>
                  <div className="text-gray-600 text-xs mt-1 line-clamp-2">
                    {template.template.split('\n')[0]}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-gray-400" />
          Histórico de Processamento
        </h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Pedido criado</span>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {formatDate(order.createdAt)}
            </div>
          </div>
          
          {order.protocolNumber && (
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Protocolo registrado</span>
              <div className="flex items-center text-sm text-gray-500">
                <Hash className="w-4 h-4 mr-1" />
                {order.protocolNumber}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Última atualização</span>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {formatDate(order.updatedAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {hasChanges && (
        <div className="flex justify-end space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <button
            onClick={handleReset}
            disabled={updating}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleSave}
            disabled={updating}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {updating ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      )}

      {/* Help section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Lembre-se</h4>
            <div className="mt-1 text-sm text-yellow-700 space-y-1">
              <p>• O protocolo é obrigatório para rastrear a consulta</p>
              <p>• Sempre documente o progresso nas observações</p>
              <p>• Em caso de problemas, escale para o supervisor</p>
              <p>• Mantenha o cliente informado sobre o andamento</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}