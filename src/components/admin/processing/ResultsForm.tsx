'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, 
  CheckCircle2,
  AlertCircle,
  Eye,
  Save,
  Copy,
  RotateCcw,
  Info,
  Search,
  Calendar,
  MapPin,
  Building,
  DollarSign,
  Printer
} from 'lucide-react'

interface OrderDetails {
  id: string
  serviceType: 'PROTEST_QUERY' | 'CERTIFICATE_REQUEST'
  documentNumber: string
  documentType: 'CPF' | 'CNPJ'
  resultText?: string
  processingNotes?: string
  user: {
    name: string
  }
}

interface ResultsFormProps {
  order: OrderDetails
  onUpdate: (data: { resultText?: string }) => void
  updating: boolean
}

export default function ResultsForm({ order, onUpdate, updating }: ResultsFormProps) {
  const [resultText, setResultText] = useState(order.resultText || '')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setHasChanges(resultText !== (order.resultText || ''))
  }, [resultText, order.resultText])

  // Common result templates
  const getResultTemplates = () => {
    const isQuery = order.serviceType === 'PROTEST_QUERY'
    const documentType = order.documentType === 'CPF' ? 'CPF' : 'CNPJ'
    const currentDate = new Intl.DateTimeFormat('pt-BR').format(new Date())

    if (isQuery) {
      return [
        {
          id: 'no_protests',
          title: 'Nenhum Protesto Encontrado',
          description: 'Resultado negativo - sem protestos',
          template: `CONSULTA DE PROTESTO

Documento consultado: ${documentType} ${order.documentNumber}
Data da consulta: ${currentDate}
Nome: ${order.user.name}

RESULTADO: NADA CONSTA

Não foram encontrados protestos registrados em nome do portador do documento consultado na data da pesquisa.

Esta consulta refere-se apenas aos protestos lavrados em cartórios de protesto do Brasil até a presente data.

Consulta realizada através do sistema CENPROT - Central Nacional de Informações de Protesto.`
        },
        {
          id: 'protests_found',
          title: 'Protestos Encontrados',
          description: 'Resultado positivo - com protestos',
          template: `CONSULTA DE PROTESTO

Documento consultado: ${documentType} ${order.documentNumber}
Data da consulta: ${currentDate}
Nome: ${order.user.name}

RESULTADO: PROTESTOS ENCONTRADOS

Foram localizados os seguintes protestos:

[INSERIR DETALHES DOS PROTESTOS ENCONTRADOS]
- Data do protesto: 
- Valor: R$ 
- Cartório: 
- Apresentante: 
- Motivo: 

Esta consulta refere-se aos protestos lavrados em cartórios de protesto do Brasil até a presente data.

Consulta realizada através do sistema CENPROT - Central Nacional de Informações de Protesto.`
        },
        {
          id: 'system_unavailable',
          title: 'Sistema Temporariamente Indisponível',
          description: 'Para casos de instabilidade do sistema',
          template: `CONSULTA DE PROTESTO - SISTEMA TEMPORARIAMENTE INDISPONÍVEL

Documento solicitado: ${documentType} ${order.documentNumber}
Data da solicitação: ${currentDate}
Nome: ${order.user.name}

SITUAÇÃO: PROCESSAMENTO EM ANDAMENTO

O sistema CENPROT encontra-se temporariamente indisponível para consultas.
Sua solicitação está sendo processada e o resultado será enviado assim que o sistema for normalizado.

Previsão de retorno: Até 24 horas úteis

Pedimos a compreensão e em caso de urgência, entre em contato conosco.`
        }
      ]
    } else {
      return [
        {
          id: 'certificate_issued',
          title: 'Certidão Emitida',
          description: 'Certidão emitida com sucesso',
          template: `CERTIDÃO DE PROTESTO

Documento: ${documentType} ${order.documentNumber}
Data de emissão: ${currentDate}
Nome: ${order.user.name}

CERTIFICA-SE que foi realizada busca nos registros de protestos e o resultado encontra-se detalhado abaixo:

[INSERIR RESULTADO DA CERTIDÃO]

Esta certidão é válida por 30 dias a partir da data de emissão e refere-se à situação encontrada na data da consulta.

Certidão emitida através do sistema CENPROT em conformidade com a legislação vigente.

Documento oficial com validade legal.`
        },
        {
          id: 'certificate_pending',
          title: 'Certidão em Processamento',
          description: 'Aguardando cartório',
          template: `CERTIDÃO DE PROTESTO - EM PROCESSAMENTO

Documento solicitado: ${documentType} ${order.documentNumber}
Data da solicitação: ${currentDate}
Nome: ${order.user.name}

SITUAÇÃO: PROCESSAMENTO NO CARTÓRIO

Sua solicitação de certidão foi encaminhada ao cartório competente e está sendo processada.

Previsão de conclusão: [INSERIR PRAZO]

Você será notificado assim que a certidão estiver disponível para download.

Em caso de dúvidas, entre em contato através dos nossos canais de atendimento.`
        }
      ]
    }
  }

  const templates = getResultTemplates()

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template)
    setResultText(template)
  }

  const handleSave = () => {
    if (hasChanges) {
      onUpdate({
        resultText: resultText || undefined
      })
    }
  }

  const handleReset = () => {
    setResultText(order.resultText || '')
    setSelectedTemplate('')
  }

  const handleCopy = async () => {
    if (resultText) {
      try {
        await navigator.clipboard.writeText(resultText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy result:', err)
      }
    }
  }

  const getCharacterCount = () => {
    return {
      current: resultText.length,
      recommended: order.serviceType === 'PROTEST_QUERY' ? 500 : 800,
      max: 2000
    }
  }

  const charCount = getCharacterCount()
  const isOverRecommended = charCount.current > charCount.recommended
  const isOverMax = charCount.current > charCount.max

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">
              {order.serviceType === 'PROTEST_QUERY' ? 'Inserir Resultado da Consulta' : 'Inserir Informações da Certidão'}
            </h4>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-2">
                {order.serviceType === 'PROTEST_QUERY' 
                  ? 'Documente aqui o resultado encontrado na consulta CENPROT. Use os templates para situações comuns ou digite manualmente.'
                  : 'Informe o status e detalhes da certidão. O cliente receberá este texto como resultado oficial.'
                }
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use linguagem formal e clara</li>
                <li>Inclua todas as informações relevantes</li>
                <li>Seja preciso sobre datas e valores</li>
                <li>Este texto será enviado diretamente ao cliente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Template selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-gray-400" />
          Templates de Resultado
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template.template)}
              className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{template.title}</h5>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </div>
                <div className="ml-2">
                  {template.id === 'no_protests' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {template.id === 'protests_found' && <AlertCircle className="w-5 h-5 text-red-500" />}
                  {(template.id === 'system_unavailable' || template.id === 'certificate_pending') && <Search className="w-5 h-5 text-yellow-500" />}
                  {template.id === 'certificate_issued' && <FileText className="w-5 h-5 text-blue-500" />}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Result editor */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-gray-400" />
            Resultado da {order.serviceType === 'PROTEST_QUERY' ? 'Consulta' : 'Certidão'}
          </h4>
          
          <div className="flex items-center space-x-2">
            {resultText && (
              <>
                <button
                  onClick={handleCopy}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {showPreview ? 'Ocultar' : 'Preview'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <textarea
              value={resultText}
              onChange={(e) => setResultText(e.target.value)}
              placeholder={`Digite o resultado da ${order.serviceType === 'PROTEST_QUERY' ? 'consulta' : 'certidão'}...`}
              rows={12}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            
            {/* Character counter */}
            <div className="flex items-center justify-between mt-2 text-xs">
              <div className="text-gray-500">
                Use os campos [INSERIR...] para marcar onde adicionar informações específicas
              </div>
              <div className={`font-medium ${
                isOverMax ? 'text-red-600' : isOverRecommended ? 'text-yellow-600' : 'text-gray-500'
              }`}>
                {charCount.current}/{charCount.max} caracteres
                {isOverRecommended && !isOverMax && ' (acima do recomendado)'}
                {isOverMax && ' (limite excedido)'}
              </div>
            </div>
          </div>

          {/* Guidelines for specific content */}
          <div className="border-t border-gray-200 pt-4">
            <h5 className="text-sm font-medium text-gray-900 mb-3">Informações importantes a incluir:</h5>
            
            {order.serviceType === 'PROTEST_QUERY' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    Data da consulta
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FileText className="w-4 h-4 mr-2 text-gray-400" />
                    Documento consultado
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-gray-400" />
                    Resultado (nada consta ou protestos)
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-700">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                    Valores dos protestos (se houver)
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Building className="w-4 h-4 mr-2 text-gray-400" />
                    Cartórios onde foram lavrados
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Info className="w-4 h-4 mr-2 text-gray-400" />
                    Observações legais
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    Data de emissão
                  </div>
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    Cartório responsável
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FileText className="w-4 h-4 mr-2 text-gray-400" />
                    Validade da certidão
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-700">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-gray-400" />
                    Resultado da busca
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Printer className="w-4 h-4 mr-2 text-gray-400" />
                    Status do documento
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Info className="w-4 h-4 mr-2 text-gray-400" />
                    Informações legais
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview */}
      {showPreview && resultText && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-gray-400" />
            Preview - Como o Cliente Verá
          </h4>
          
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <div className="whitespace-pre-wrap text-sm font-mono text-gray-800">
              {resultText}
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>Este será o conteúdo exato enviado para o cliente. Verifique se todas as informações estão corretas.</p>
          </div>
        </div>
      )}

      {/* Current result display */}
      {order.resultText && order.resultText !== resultText && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Resultado Atual</h4>
            <button
              onClick={() => setResultText(order.resultText || '')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Restaurar
            </button>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <div className="whitespace-pre-wrap text-sm text-gray-800">
              {order.resultText}
            </div>
          </div>
        </div>
      )}

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
            disabled={updating || isOverMax}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {updating ? 'Salvando...' : 'Salvar Resultado'}
          </button>
        </div>
      )}

      {/* Help and tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Dicas Importantes</h4>
            <div className="mt-1 text-sm text-yellow-700 space-y-1">
              <p>• Sempre revise o conteúdo antes de salvar</p>
              <p>• Use linguagem formal e técnica apropriada</p>
              <p>• Inclua todas as informações obrigatórias</p>
              <p>• Substitua os campos [INSERIR...] por dados reais</p>
              <p>• Em caso de dúvida, consulte o supervisor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}