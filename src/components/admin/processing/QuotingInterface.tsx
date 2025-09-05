'use client'

import { useState, useEffect } from 'react'
import { 
  DollarSign, 
  Calculator,
  Send,
  FileText,
  Building,
  Clock,
  Info,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Save,
  Eye,
  Copy,
  MapPin,
  Calendar
} from 'lucide-react'

interface OrderDetails {
  id: string
  orderNumber: string
  documentNumber: string
  documentType: 'CPF' | 'CNPJ'
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

interface QuotingInterfaceProps {
  order: OrderDetails
  onUpdate: (data: { quotedAmount?: number }) => void
  onStatusChange: (newStatus: string, notes?: string) => void
  updating: boolean
}

interface NotaryFee {
  id: string
  name: string
  basePrice: number
  additionalFees: {
    name: string
    amount: number
    required: boolean
  }[]
}

export default function QuotingInterface({ order, onUpdate, onStatusChange, updating }: QuotingInterfaceProps) {
  const [selectedNotary, setSelectedNotary] = useState<string>('')
  const [customAmount, setCustomAmount] = useState(order.quotedAmount?.toString() || '')
  const [additionalFees, setAdditionalFees] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [showEmailPreview, setShowEmailPreview] = useState(false)
  const [quotingMode, setQuotingMode] = useState<'standard' | 'custom'>('standard')
  const [hasChanges, setHasChanges] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const currentQuote = calculateTotalAmount()
    const hasAmountChange = currentQuote !== (order.quotedAmount || 0)
    setHasChanges(hasAmountChange)
  }, [selectedNotary, additionalFees, customAmount, quotingMode])

  // Sample notary offices with fee structures
  const getNotaryOffices = (): NotaryFee[] => {
    return [
      {
        id: 'cartorio_1',
        name: '1º Cartório de Protestos - Centro',
        basePrice: 45.90,
        additionalFees: [
          { name: 'Taxa de emissão', amount: 15.00, required: true },
          { name: 'Taxa de autenticação', amount: 8.50, required: false },
          { name: 'Selo digital', amount: 12.00, required: true },
          { name: 'Pesquisa em arquivos', amount: 25.00, required: false }
        ]
      },
      {
        id: 'cartorio_2', 
        name: '2º Cartório de Protestos - Bairro Alto',
        basePrice: 52.30,
        additionalFees: [
          { name: 'Taxa de processamento', amount: 18.00, required: true },
          { name: 'Certificação digital', amount: 10.00, required: true },
          { name: 'Taxa administrativa', amount: 7.50, required: false }
        ]
      },
      {
        id: 'cartorio_3',
        name: '3º Cartório de Protestos - Zona Sul',
        basePrice: 48.70,
        additionalFees: [
          { name: 'Emolumentos', amount: 16.50, required: true },
          { name: 'Selo eletrônico', amount: 14.00, required: true },
          { name: 'Busca complementar', amount: 30.00, required: false }
        ]
      }
    ]
  }

  const notaryOffices = getNotaryOffices()
  const selectedNotaryData = notaryOffices.find(n => n.id === selectedNotary)

  const calculateTotalAmount = (): number => {
    if (quotingMode === 'custom') {
      return parseFloat(customAmount) || 0
    }

    if (!selectedNotaryData) return 0

    const baseAmount = selectedNotaryData.basePrice
    const requiredFees = selectedNotaryData.additionalFees
      .filter(fee => fee.required)
      .reduce((sum, fee) => sum + fee.amount, 0)
    
    const optionalFees = selectedNotaryData.additionalFees
      .filter(fee => !fee.required && additionalFees.includes(fee.name))
      .reduce((sum, fee) => sum + fee.amount, 0)

    return baseAmount + requiredFees + optionalFees
  }

  const handleFeeToggle = (feeName: string) => {
    setAdditionalFees(prev => 
      prev.includes(feeName)
        ? prev.filter(f => f !== feeName)
        : [...prev, feeName]
    )
  }

  const handleSaveQuote = () => {
    const totalAmount = calculateTotalAmount()
    if (totalAmount > 0) {
      onUpdate({ quotedAmount: totalAmount })
    }
  }

  const handleSendQuote = () => {
    const totalAmount = calculateTotalAmount()
    if (totalAmount > 0) {
      onUpdate({ quotedAmount: totalAmount })
      onStatusChange('AWAITING_QUOTE', `Orçamento de ${formatCurrency(totalAmount)} enviado para aprovação do cliente`)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getQuoteEmail = () => {
    const totalAmount = calculateTotalAmount()
    const currentDate = new Intl.DateTimeFormat('pt-BR').format(new Date())
    
    return {
      subject: `Orçamento - Certidão de Protesto - Pedido #${order.orderNumber}`,
      body: `Prezado(a) ${order.user.name},

Conforme solicitado, segue o orçamento para emissão da Certidão de Protesto:

DADOS DO PEDIDO:
• Pedido: #${order.orderNumber}
• Documento: ${order.documentType} ${order.documentNumber}
• Data: ${currentDate}

DETALHAMENTO DO ORÇAMENTO:
${selectedNotaryData ? `
• Cartório: ${selectedNotaryData.name}
• Taxa base: ${formatCurrency(selectedNotaryData.basePrice)}

Taxas obrigatórias:
${selectedNotaryData.additionalFees
  .filter(fee => fee.required)
  .map(fee => `• ${fee.name}: ${formatCurrency(fee.amount)}`)
  .join('\n')}

${additionalFees.length > 0 ? `Taxas adicionais selecionadas:
${selectedNotaryData.additionalFees
  .filter(fee => additionalFees.includes(fee.name))
  .map(fee => `• ${fee.name}: ${formatCurrency(fee.amount)}`)
  .join('\n')}` : ''}
` : `• Valor total: ${formatCurrency(totalAmount)}`}

VALOR TOTAL: ${formatCurrency(totalAmount)}

Este orçamento é válido por 5 dias úteis e inclui todas as taxas cartoriais necessárias.

Para prosseguir com a emissão da certidão, favor confirmar a aprovação deste orçamento respondendo este email ou entrando em contato conosco.

Atenciosamente,
Equipe QUERODOCUMENTO

---
Caso não deseje mais receber estes emails, entre em contato conosco.`
    }
  }

  const handleCopyEmail = async () => {
    const email = getQuoteEmail()
    const fullEmail = `Assunto: ${email.subject}\n\n${email.body}`
    
    try {
      await navigator.clipboard.writeText(fullEmail)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy email:', err)
    }
  }

  const totalAmount = calculateTotalAmount()

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-orange-800">Criação de Orçamento</h4>
            <div className="mt-2 text-sm text-orange-700">
              <p className="mb-2">
                As certidões podem ter taxas adicionais dos cartórios. Use esta interface para:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Selecionar o cartório responsável pela certidão</li>
                <li>Calcular automaticamente as taxas obrigatórias</li>
                <li>Adicionar taxas opcionais conforme necessário</li>
                <li>Gerar e enviar orçamento para aprovação do cliente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Order context */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
          <Building className="w-5 h-5 mr-2 text-gray-400" />
          Informações da Solicitação
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium">Documento:</span>
              <span className="ml-2">{order.documentType} {order.documentNumber}</span>
            </div>
            {order.state && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium">Estado:</span>
                <span className="ml-2">{order.state}</span>
              </div>
            )}
            {order.city && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium">Cidade:</span>
                <span className="ml-2">{order.city}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium">Cliente:</span>
              <span className="ml-2">{order.user.name}</span>
            </div>
            {order.reason && (
              <div className="flex items-center">
                <Info className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium">Motivo:</span>
                <span className="ml-2">{order.reason}</span>
              </div>
            )}
            {order.notaryOffice && (
              <div className="flex items-center">
                <Building className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium">Cartório:</span>
                <span className="ml-2">{order.notaryOffice}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quoting mode selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-gray-400" />
          Modo de Orçamento
        </h4>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setQuotingMode('standard')}
            className={`flex-1 p-4 border rounded-lg text-left ${
              quotingMode === 'standard'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center mb-2">
              <Calculator className="w-5 h-5 mr-2 text-blue-600" />
              <h5 className="font-medium">Calculadora Automática</h5>
            </div>
            <p className="text-sm text-gray-600">
              Selecione o cartório e calcule automaticamente as taxas
            </p>
          </button>

          <button
            onClick={() => setQuotingMode('custom')}
            className={`flex-1 p-4 border rounded-lg text-left ${
              quotingMode === 'custom'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center mb-2">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              <h5 className="font-medium">Valor Personalizado</h5>
            </div>
            <p className="text-sm text-gray-600">
              Insira um valor específico fornecido pelo cartório
            </p>
          </button>
        </div>

        {/* Standard mode - Notary selection */}
        {quotingMode === 'standard' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Selecione o Cartório
              </label>
              
              <div className="space-y-3">
                {notaryOffices.map((notary) => (
                  <div
                    key={notary.id}
                    className={`border rounded-lg p-4 cursor-pointer ${
                      selectedNotary === notary.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedNotary(notary.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="font-medium text-gray-900">{notary.name}</h6>
                      <span className="text-lg font-semibold text-blue-600">
                        {formatCurrency(notary.basePrice)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">Taxas obrigatórias:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {notary.additionalFees
                          .filter(fee => fee.required)
                          .map((fee, index) => (
                            <div key={index} className="flex justify-between">
                              <span>• {fee.name}</span>
                              <span>{formatCurrency(fee.amount)}</span>
                            </div>
                          ))}
                      </div>
                      
                      {notary.additionalFees.some(fee => !fee.required) && (
                        <div className="mt-2">
                          <p className="mb-1">Taxas opcionais disponíveis:</p>
                          <div className="text-xs text-gray-500">
                            {notary.additionalFees
                              .filter(fee => !fee.required)
                              .map(fee => fee.name)
                              .join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional fees */}
            {selectedNotaryData && selectedNotaryData.additionalFees.some(fee => !fee.required) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Taxas Opcionais
                </label>
                
                <div className="space-y-2">
                  {selectedNotaryData.additionalFees
                    .filter(fee => !fee.required)
                    .map((fee) => (
                      <label
                        key={fee.name}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={additionalFees.includes(fee.name)}
                            onChange={() => handleFeeToggle(fee.name)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-900">{fee.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(fee.amount)}
                        </span>
                      </label>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom mode */}
        {quotingMode === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor Total (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="0,00"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-2 text-sm text-gray-600">
              Insira o valor total fornecido diretamente pelo cartório
            </p>
          </div>
        )}
      </div>

      {/* Quote summary */}
      {totalAmount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-green-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Resumo do Orçamento
          </h4>

          {quotingMode === 'standard' && selectedNotaryData && (
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-800">Taxa base ({selectedNotaryData.name})</span>
                <span className="font-medium">{formatCurrency(selectedNotaryData.basePrice)}</span>
              </div>
              
              {selectedNotaryData.additionalFees
                .filter(fee => fee.required)
                .map((fee) => (
                  <div key={fee.name} className="flex justify-between items-center">
                    <span className="text-sm text-green-800">{fee.name} (obrigatória)</span>
                    <span className="font-medium">{formatCurrency(fee.amount)}</span>
                  </div>
                ))}
              
              {selectedNotaryData.additionalFees
                .filter(fee => !fee.required && additionalFees.includes(fee.name))
                .map((fee) => (
                  <div key={fee.name} className="flex justify-between items-center">
                    <span className="text-sm text-green-800">{fee.name} (opcional)</span>
                    <span className="font-medium">{formatCurrency(fee.amount)}</span>
                  </div>
                ))}
            </div>
          )}

          <div className="border-t border-green-200 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-green-900">Valor Total</span>
              <span className="text-2xl font-bold text-green-900">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <div className="mt-4 text-sm text-green-800">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>Orçamento válido por 5 dias úteis</span>
            </div>
          </div>
        </div>
      )}

      {/* Current quote display */}
      {order.quotedAmount && order.quotedAmount !== totalAmount && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium text-gray-900">Orçamento Atual</h5>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.quotedAmount)}</p>
            </div>
            <button
              onClick={() => {
                setCustomAmount(order.quotedAmount!.toString())
                setQuotingMode('custom')
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Restaurar
            </button>
          </div>
        </div>
      )}

      {/* Email preview */}
      {totalAmount > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-gray-400" />
              Email para o Cliente
            </h4>
            
            <div className="flex space-x-2">
              <button
                onClick={handleCopyEmail}
                className="flex items-center text-sm text-gray-600 hover:text-gray-800"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
              <button
                onClick={() => setShowEmailPreview(!showEmailPreview)}
                className="flex items-center text-sm text-gray-600 hover:text-gray-800"
              >
                <Eye className="w-4 h-4 mr-1" />
                {showEmailPreview ? 'Ocultar' : 'Preview'}
              </button>
            </div>
          </div>

          {showEmailPreview && (
            <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
              <div className="text-sm space-y-2">
                <div>
                  <strong>Para:</strong> {order.user.email}
                </div>
                <div>
                  <strong>Assunto:</strong> {getQuoteEmail().subject}
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <pre className="whitespace-pre-wrap text-xs text-gray-800">
                    {getQuoteEmail().body}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        {hasChanges && (
          <button
            onClick={handleSaveQuote}
            disabled={updating || totalAmount <= 0}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Orçamento
          </button>
        )}
        
        <button
          onClick={handleSendQuote}
          disabled={updating || totalAmount <= 0}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <Send className="w-4 h-4 mr-2" />
          {updating ? 'Enviando...' : 'Enviar Orçamento'}
        </button>
      </div>

      {/* Help section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Processo de Orçamento</h4>
            <div className="mt-1 text-sm text-blue-700 space-y-1">
              <p>1. Determine as taxas necessárias consultando o cartório</p>
              <p>2. Use a calculadora para taxas padrão ou insira valor personalizado</p>
              <p>3. Revise o orçamento antes de enviar ao cliente</p>
              <p>4. O cliente receberá email com detalhes e prazo de validade</p>
              <p>5. Após aprovação, o status mudará automaticamente para processamento</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}