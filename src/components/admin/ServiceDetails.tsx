'use client'

import { 
  Search, 
  FileText, 
  MapPin,
  Building,
  DollarSign,
  Download
} from 'lucide-react'

interface OrderDetails {
  id: string
  serviceType: 'PROTEST_QUERY' | 'CERTIFICATE_REQUEST'
  documentNumber: string
  documentType: 'CPF' | 'CNPJ'
  resultText?: string
  quotedAmount?: number
  attachmentUrl?: string
  
  // Certificate specific fields
  state?: string
  city?: string
  notaryOffice?: string
  reason?: string
}

interface ServiceDetailsProps {
  order: OrderDetails
}

export default function ServiceDetails({ order }: ServiceDetailsProps) {
  const formatDocument = (document: string, type: 'CPF' | 'CNPJ') => {
    if (type === 'CPF') {
      return document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else {
      return document.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getServiceTypeInfo = () => {
    if (order.serviceType === 'PROTEST_QUERY') {
      return {
        title: 'Consulta de Protesto',
        description: 'Verificação de protestos existentes em cartórios de todo o Brasil',
        icon: Search
      }
    } else {
      return {
        title: 'Certidão de Protesto',
        description: 'Emissão de certidão oficial de protesto por cartório específico',
        icon: FileText
      }
    }
  }

  const serviceInfo = getServiceTypeInfo()
  const ServiceIcon = serviceInfo.icon

  const handleDownloadAttachment = () => {
    if (order.attachmentUrl) {
      window.open(order.attachmentUrl, '_blank')
    }
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <ServiceIcon className="w-5 h-5 mr-2 text-gray-400" />
          Detalhes do Serviço
        </h3>
      </div>

      <div className="px-6 py-6">
        <div className="space-y-6">
          {/* Service Type */}
          <div className="flex items-start">
            <ServiceIcon className="w-6 h-6 text-blue-500 mt-1 mr-3 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h4 className="text-base font-medium text-gray-900">{serviceInfo.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{serviceInfo.description}</p>
            </div>
          </div>

          {/* Document Being Consulted */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-start">
              <Search className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500">Documento Consultado</p>
                <p className="text-lg text-gray-900 font-mono mt-1">
                  {formatDocument(order.documentNumber, order.documentType)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Tipo: {order.documentType}
                </p>
              </div>
            </div>
          </div>

          {/* Certificate-specific information */}
          {order.serviceType === 'CERTIFICATE_REQUEST' && (
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Informações da Certidão</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.state && (
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-500">Estado</p>
                      <p className="text-sm text-gray-900">{order.state}</p>
                    </div>
                  </div>
                )}

                {order.city && (
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-500">Cidade</p>
                      <p className="text-sm text-gray-900">{order.city}</p>
                    </div>
                  </div>
                )}
              </div>

              {order.notaryOffice && (
                <div className="flex items-start">
                  <Building className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500">Cartório</p>
                    <p className="text-sm text-gray-900">{order.notaryOffice}</p>
                  </div>
                </div>
              )}

              {order.reason && (
                <div className="flex items-start">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500">Finalidade</p>
                    <p className="text-sm text-gray-900">{order.reason}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quoted Amount */}
          {order.quotedAmount && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-start">
                <DollarSign className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500">Valor Orçado</p>
                  <p className="text-lg text-green-600 font-semibold mt-1">
                    {formatCurrency(order.quotedAmount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Valor adicional para execução do serviço
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Result Text */}
          {order.resultText && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-start">
                <FileText className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500 mb-2">Resultado da Consulta</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{order.resultText}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attachment */}
          {order.attachmentUrl && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-start">
                <Download className="w-5 h-5 text-purple-500 mt-0.5 mr-3 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500 mb-2">Documento Anexo</p>
                  <button
                    onClick={handleDownloadAttachment}
                    className="inline-flex items-center px-4 py-2 border border-purple-300 shadow-sm text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Documento
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    Clique para visualizar ou baixar o documento gerado
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Service Status Info */}
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Informações do Serviço
                  </h3>
                  <div className="mt-1 text-sm text-blue-700">
                    {order.serviceType === 'PROTEST_QUERY' ? (
                      <p>
                        A consulta é realizada em todos os cartórios de protesto do Brasil através da 
                        Central Nacional de Informações do Registro Civil (CRC Nacional).
                      </p>
                    ) : (
                      <p>
                        A certidão é emitida pelo cartório específico da localidade informada. 
                        Pode haver custos adicionais do cartório que serão informados antes da emissão.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}