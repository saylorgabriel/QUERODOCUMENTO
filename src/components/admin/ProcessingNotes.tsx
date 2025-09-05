'use client'

import { useState } from 'react'
import { 
  MessageSquare,
  Edit,
  DollarSign,
  Hash,
  FileText,
  Check,
  X
} from 'lucide-react'

interface OrderDetails {
  id: string
  protocolNumber?: string
  processingNotes?: string
  resultText?: string
  quotedAmount?: number
  status: string
}

interface ProcessingNotesProps {
  order: OrderDetails
  onUpdate: (data: {
    processingNotes?: string
    resultText?: string
    protocolNumber?: string
    quotedAmount?: number
  }) => void
  updating: boolean
}

export default function ProcessingNotes({ order, onUpdate, updating }: ProcessingNotesProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    protocolNumber: order.protocolNumber || '',
    processingNotes: order.processingNotes || '',
    resultText: order.resultText || '',
    quotedAmount: order.quotedAmount?.toString() || ''
  })

  const handleSave = () => {
    const updateData: any = {}
    
    if (editData.protocolNumber !== (order.protocolNumber || '')) {
      updateData.protocolNumber = editData.protocolNumber || undefined
    }
    
    if (editData.processingNotes !== (order.processingNotes || '')) {
      updateData.processingNotes = editData.processingNotes || undefined
    }
    
    if (editData.resultText !== (order.resultText || '')) {
      updateData.resultText = editData.resultText || undefined
    }
    
    if (editData.quotedAmount !== (order.quotedAmount?.toString() || '')) {
      const quotedValue = parseFloat(editData.quotedAmount)
      updateData.quotedAmount = !isNaN(quotedValue) && quotedValue > 0 ? quotedValue : undefined
    }

    // Only call update if there are changes
    if (Object.keys(updateData).length > 0) {
      onUpdate(updateData)
    }
    
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData({
      protocolNumber: order.protocolNumber || '',
      processingNotes: order.processingNotes || '',
      resultText: order.resultText || '',
      quotedAmount: order.quotedAmount?.toString() || ''
    })
    setIsEditing(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const canEdit = ['ORDER_CONFIRMED', 'AWAITING_QUOTE', 'DOCUMENT_REQUESTED', 'PROCESSING', 'COMPLETED'].includes(order.status)

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-gray-400" />
            Informações de Processamento
          </h3>
          
          {canEdit && !isEditing && !updating && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-6">
        {isEditing ? (
          /* Edit Mode */
          <div className="space-y-6">
            {/* Protocol Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="w-4 h-4 inline mr-1" />
                Número do Protocolo
              </label>
              <input
                type="text"
                value={editData.protocolNumber}
                onChange={(e) => setEditData(prev => ({ ...prev, protocolNumber: e.target.value }))}
                placeholder="Ex: 2024001234"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Número único de identificação do processamento
              </p>
            </div>

            {/* Processing Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Observações do Processamento
              </label>
              <textarea
                value={editData.processingNotes}
                onChange={(e) => setEditData(prev => ({ ...prev, processingNotes: e.target.value }))}
                placeholder="Adicione observações sobre o processamento, dificuldades encontradas, próximos passos, etc."
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Informações internas sobre o andamento do pedido
              </p>
            </div>

            {/* Result Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Resultado da Consulta/Certidão
              </label>
              <textarea
                value={editData.resultText}
                onChange={(e) => setEditData(prev => ({ ...prev, resultText: e.target.value }))}
                placeholder="Descreva o resultado encontrado na consulta ou informações da certidão emitida..."
                rows={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Resultado que será mostrado ao cliente
              </p>
            </div>

            {/* Quoted Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Valor Orçado (Taxas Adicionais)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={editData.quotedAmount}
                onChange={(e) => setEditData(prev => ({ ...prev, quotedAmount: e.target.value }))}
                placeholder="0,00"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Valor adicional cobrado pelo cartório (se houver)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleCancel}
                disabled={updating}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <X className="w-4 h-4 inline mr-1" />
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={updating}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Check className="w-4 h-4 inline mr-1" />
                {updating ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="space-y-6">
            {/* Protocol Number */}
            <div className="flex items-start">
              <Hash className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500">Número do Protocolo</p>
                {order.protocolNumber ? (
                  <p className="text-sm text-gray-900 font-mono mt-1">{order.protocolNumber}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic mt-1">Não informado</p>
                )}
              </div>
            </div>

            {/* Processing Notes */}
            <div className="flex items-start">
              <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500">Observações do Processamento</p>
                {order.processingNotes ? (
                  <div className="mt-2 bg-gray-50 border border-gray-200 rounded-md p-3">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{order.processingNotes}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic mt-1">Nenhuma observação adicionada</p>
                )}
              </div>
            </div>

            {/* Result Text */}
            <div className="flex items-start">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500">Resultado da Consulta/Certidão</p>
                {order.resultText ? (
                  <div className="mt-2 bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{order.resultText}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic mt-1">Resultado não informado</p>
                )}
              </div>
            </div>

            {/* Quoted Amount */}
            <div className="flex items-start">
              <DollarSign className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500">Valor Orçado (Taxas Adicionais)</p>
                {order.quotedAmount ? (
                  <p className="text-lg text-green-600 font-semibold mt-1">
                    {formatCurrency(order.quotedAmount)}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic mt-1">Sem taxas adicionais</p>
                )}
              </div>
            </div>

            {/* No data message */}
            {!order.protocolNumber && !order.processingNotes && !order.resultText && !order.quotedAmount && (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma informação de processamento</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {canEdit 
                    ? 'Clique em "Editar" para adicionar informações sobre o processamento deste pedido.'
                    : 'As informações de processamento aparecerão aqui quando disponíveis.'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Status-specific guidelines */}
        {!isEditing && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Orientações para Processamento
                  </h3>
                  <div className="mt-1 text-sm text-yellow-700">
                    {order.status === 'ORDER_CONFIRMED' && (
                      <p>
                        Analise o pedido e inicie o processamento. Adicione o número do protocolo 
                        e observações sobre o andamento.
                      </p>
                    )}
                    {order.status === 'AWAITING_QUOTE' && (
                      <p>
                        Informe o valor das taxas adicionais do cartório para que o cliente 
                        possa aprovar antes de prosseguir.
                      </p>
                    )}
                    {order.status === 'PROCESSING' && (
                      <p>
                        Mantenha as informações atualizadas durante o processamento. 
                        Adicione o resultado quando finalizar.
                      </p>
                    )}
                    {order.status === 'COMPLETED' && (
                      <p>
                        Pedido finalizado. Certifique-se de que todas as informações estão 
                        completas e o resultado foi informado ao cliente.
                      </p>
                    )}
                    {!canEdit && (
                      <p>
                        Este pedido não pode ser editado no status atual. 
                        Altere o status para poder adicionar informações de processamento.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}