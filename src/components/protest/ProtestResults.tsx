'use client'

import React, { useState } from 'react'
import { CheckCircle2, AlertCircle, FileText, MapPin, Calendar, DollarSign, Building, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ProtestItem {
  id: string
  date: string
  value: number
  creditor: string
  notaryOffice: string
  city: string
  state: string
  protocol: string
  status: 'ACTIVE' | 'PAID' | 'CANCELLED'
}

interface ProtestQueryResult {
  queryId: string
  documentSearched: string
  documentType: 'CPF' | 'CNPJ'
  name: string
  searchDate: string
  status: string
  totalProtests: number
  protests: ProtestItem[]
  summary: string
}

interface ProtestResultsProps {
  result: ProtestQueryResult
  onRequestCertificate?: () => void
  onNewQuery?: () => void
}

export function ProtestResults({ result, onRequestCertificate, onNewQuery }: ProtestResultsProps) {
  const hasProtests = result.totalProtests > 0
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value)

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { label: 'Ativo', className: 'bg-red-100 text-red-800' },
      PAID: { label: 'Quitado', className: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Cancelado', className: 'bg-gray-100 text-gray-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE
    
    return (
      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', config.className)}>
        {config.label}
      </span>
    )
  }

  const downloadPDF = async () => {
    if (isGeneratingPDF) return

    setIsGeneratingPDF(true)
    setPdfError(null)

    try {
      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queryResult: {
            ...result,
            status: 'COMPLETED' // Ensure status is compatible
          },
          options: {
            includeQRCode: true,
            downloadFormat: 'base64'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Falha ao gerar PDF')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar PDF')
      }

      // Create download link and trigger download
      const link = document.createElement('a')
      link.href = data.data.dataUrl
      link.download = data.data.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    } catch (error) {
      console.error('PDF download error:', error)
      setPdfError(error instanceof Error ? error.message : 'Erro ao baixar PDF')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Query Status */}
      <div className="card-floating">
        <div className="flex items-start gap-4">
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            hasProtests ? 'bg-amber-100' : 'bg-success-100'
          )}>
            {hasProtests ? (
              <AlertCircle className="w-6 h-6 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-success-600" />
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Consulta de Protesto
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-neutral-600 mb-4">
              <div>
                <span className="font-medium">Documento:</span> {result.documentSearched}
              </div>
              <div>
                <span className="font-medium">Nome:</span> {result.name}
              </div>
              <div>
                <span className="font-medium">Tipo:</span> {result.documentType}
              </div>
              <div>
                <span className="font-medium">Data da Consulta:</span> {formatDate(result.searchDate)}
              </div>
            </div>

            <div className={cn(
              'p-4 rounded-lg border-l-4',
              hasProtests 
                ? 'bg-amber-50 border-amber-500' 
                : 'bg-success-50 border-success-500'
            )}>
              <h3 className={cn(
                'font-bold text-lg mb-2',
                hasProtests ? 'text-amber-800' : 'text-success-800'
              )}>
                {hasProtests ? 'Protestos Encontrados' : 'Situação Limpa'}
              </h3>
              <p className={cn(
                'text-base',
                hasProtests ? 'text-amber-700' : 'text-success-700'
              )}>
                {result.summary}
              </p>
              {hasProtests && (
                <p className="text-amber-600 font-semibold mt-2">
                  Total: {result.totalProtests} protesto(s)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Protest Details */}
      {hasProtests && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-neutral-900">
            Detalhes dos Protestos
          </h3>
          
          {result.protests.map((protest, index) => (
            <div key={protest.id} className="card-floating">
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-lg font-semibold text-neutral-900">
                  Protesto #{index + 1}
                </h4>
                {getStatusBadge(protest.status)}
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-neutral-500" />
                    <div>
                      <p className="text-sm text-neutral-500">Valor</p>
                      <p className="font-semibold text-lg text-neutral-900">
                        {formatCurrency(protest.value)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-neutral-500" />
                    <div>
                      <p className="text-sm text-neutral-500">Data do Protesto</p>
                      <p className="font-medium text-neutral-900">
                        {formatDate(protest.date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-neutral-500" />
                    <div>
                      <p className="text-sm text-neutral-500">Credor</p>
                      <p className="font-medium text-neutral-900">
                        {protest.creditor}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-neutral-500" />
                    <div>
                      <p className="text-sm text-neutral-500">Cartório</p>
                      <p className="font-medium text-neutral-900">
                        {protest.notaryOffice}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-neutral-500" />
                    <div>
                      <p className="text-sm text-neutral-500">Localização</p>
                      <p className="font-medium text-neutral-900">
                        {protest.city}/{protest.state}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-neutral-500" />
                    <div>
                      <p className="text-sm text-neutral-500">Protocolo</p>
                      <p className="font-medium text-neutral-900 font-mono text-sm">
                        {protest.protocol}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="card-floating">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-neutral-900">
            Próximos Passos
          </h3>
          
          <p className="text-neutral-600">
            {hasProtests 
              ? 'Solicite uma certidão oficial para ter um documento com validade jurídica.'
              : 'Solicite uma certidão negativa oficial para comprovar a situação limpa.'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onRequestCertificate}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {hasProtests ? 'Solicitar Certidão Positiva' : 'Solicitar Certidão Negativa'}
            </Button>
            
            <Button 
              onClick={downloadPDF}
              disabled={isGeneratingPDF}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isGeneratingPDF ? 'Gerando PDF...' : 'Baixar PDF'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={onNewQuery}
              className="flex items-center gap-2"
            >
              Fazer Nova Consulta
            </Button>
          </div>

          {/* PDF Error Message */}
          {pdfError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">
                <strong>Erro:</strong> {pdfError}
              </p>
            </div>
          )}
          
          <div className="pt-4 border-t border-neutral-200">
            <p className="text-sm text-neutral-500">
              <strong>Importante:</strong> Esta consulta foi realizada em {formatDate(result.searchDate)}. 
              Para informações mais atuais, recomendamos fazer uma nova consulta.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}