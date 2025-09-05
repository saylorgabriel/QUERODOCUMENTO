'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
// import { motion, AnimatePresence, useInView } from 'framer-motion' // Temporarily disabled for React 19 compatibility
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Download, 
  Eye, 
  EyeOff,
  Calendar,
  MapPin,
  DollarSign,
  FileCheck,
  ShieldCheck
} from 'lucide-react'
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

interface ProtestResultsProps {
  data: {
    queryId: string
    documentSearched: string
    documentType: 'CPF' | 'CNPJ'
    name: string
    searchDate: string
    status: string
    totalProtests: number
    protests: ProtestItem[]
    summary: string
    isPaidConsultation: boolean
    consultationType: 'BASIC' | 'DETAILED'
    canRequestCertificate: boolean
    certificateType: 'NEGATIVE' | 'POSITIVE'
    orderId?: string
    orderNumber?: string
  }
  onRequestCertificate?: (certificateType: 'NEGATIVE' | 'POSITIVE') => void
}

export function ProtestResults({ data, onRequestCertificate }: ProtestResultsProps) {
  const router = useRouter()
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showProtestDetails, setShowProtestDetails] = useState<Record<string, boolean>>({})

  const {
    documentSearched,
    documentType,
    name,
    totalProtests,
    protests,
    summary,
    isPaidConsultation,
    certificateType,
    canRequestCertificate,
    orderId,
    orderNumber
  } = data

  const toggleProtestDetails = (protestId: string) => {
    setShowProtestDetails(prev => ({
      ...prev,
      [protestId]: !prev[protestId]
    }))
  }

  const handleRequestCertificate = async () => {
    if (onRequestCertificate) {
      onRequestCertificate(certificateType)
      return
    }

    // Create order for certificate
    try {
      setIsCreatingOrder(true)
      setError(null)

      const serviceType = certificateType === 'NEGATIVE' ? 'CERTIFICATE_REQUEST' : 'CERTIFICATE_REQUEST'
      const amount = certificateType === 'NEGATIVE' ? 89.90 : 129.90

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType,
          documentNumber: documentSearched,
          invoiceName: name,
          invoiceDocument: documentSearched,
          amount,
          paymentMethod: 'PIX'
        })
      })

      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Erro ao criar pedido')
      }

      // Redirect to payment page
      router.push(`/pagamento/${responseData.order.id}`)
      
    } catch (error) {
      console.error('Error creating certificate order:', error)
      setError(error instanceof Error ? error.message : 'Erro ao solicitar certidão')
    } finally {
      setIsCreatingOrder(false)
    }
  }

  const formatCurrency = (value: number) => {
    return value > 0 ? value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }) : 'Valor oculto'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      ACTIVE: { label: 'Ativo', variant: 'destructive' as const },
      PAID: { label: 'Pago', variant: 'secondary' as const },
      CANCELLED: { label: 'Cancelado', variant: 'outline' as const }
    }
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const }
    
    return (
      <Badge variant={statusInfo.variant} className="text-xs">
        {statusInfo.label}
      </Badge>
    )
  }

  const containerRef = React.useRef(null)
  // Animation temporarily disabled for React 19 compatibility

  return (
    <div 
      ref={containerRef}
      className="space-y-4 sm:space-y-6"
    >
      {/* Results Header */}
      <div>
        <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-start gap-3 sm:gap-4">
            <div>
              {totalProtests === 0 ? (
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-success-500 flex-shrink-0 mt-1" />
              ) : (
                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 flex-shrink-0 mt-1" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">
                {totalProtests === 0 ? 'Nenhum Protesto Encontrado' : `${totalProtests} Protesto(s) Encontrado(s)`}
              </h2>
              
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-neutral-600">
                <p className="break-words"><strong>Documento:</strong> {documentSearched} ({documentType})</p>
                <p className="break-words"><strong>Nome:</strong> {name}</p>
                <p><strong>Data da consulta:</strong> {formatDate(data.searchDate)}</p>
                {orderId && (
                  <p><strong>Pedido:</strong> #{orderNumber}</p>
                )}
              </div>
              
              <p className="text-sm sm:text-base text-neutral-700 mt-3 sm:mt-4">
                {summary}
              </p>
              
              {!isPaidConsultation && totalProtests > 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700">
                    <strong>Consulta gratuita:</strong> Alguns detalhes estão ocultos. Para ver informações completas e obter certidão oficial, solicite uma certidão paga.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Protest Details */}
      {totalProtests > 0 && (
        <div>
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-3 sm:mb-4">
              Detalhes dos Protestos
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              {protests.map((protest, index) => (
                <div 
                  key={protest.id} 
                  className="border border-neutral-200 rounded-lg overflow-hidden hover:border-neutral-300 transition-all duration-200"
                >
                  <div 
                    className="p-3 sm:p-4 cursor-pointer hover:bg-neutral-50 transition-all duration-200"
                    onClick={() => toggleProtestDetails(protest.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div>
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-500 flex-shrink-0" />
                        </div>
                        <span className="font-medium text-sm sm:text-base truncate">{formatDate(protest.date)}</span>
                        <div>
                          {getStatusBadge(protest.status)}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                        <span className="font-semibold text-base sm:text-lg">
                          {formatCurrency(protest.value)}
                        </span>
                        <div className="flex-shrink-0">
                          {showProtestDetails[protest.id] ? (
                            <EyeOff className="w-4 h-4 text-neutral-500" />
                          ) : (
                            <Eye className="w-4 h-4 text-neutral-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {showProtestDetails[protest.id] && (
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-neutral-100 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <p className="text-neutral-600">Credor:</p>
                            <p className="font-medium text-neutral-900 break-words">{protest.creditor}</p>
                          </div>
                          
                          <div>
                            <p className="text-neutral-600">Protocolo:</p>
                            <p className="font-mono text-neutral-900 break-all text-xs sm:text-sm">{protest.protocol}</p>
                          </div>
                          
                          <div className="sm:col-span-2">
                            <p className="text-neutral-600">Cartório:</p>
                            <p className="text-neutral-900 break-words">{protest.notaryOffice}</p>
                          </div>
                          
                          <div className="flex items-center gap-1 sm:col-span-2">
                            <MapPin className="w-3 h-3 text-neutral-500 flex-shrink-0" />
                            <span className="text-neutral-900 break-words">{protest.city}, {protest.state}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Certificate Actions */}
      {canRequestCertificate && (
        <div>
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                {certificateType === 'NEGATIVE' ? (
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                ) : (
                  <FileCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                )}
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2">
                  {certificateType === 'NEGATIVE' ? 'Certidão Negativa' : 'Certidão Positiva'}
                </h3>
                
                <p className="text-sm sm:text-base text-neutral-600 mb-3 sm:mb-4">
                  {certificateType === 'NEGATIVE' 
                    ? 'Comprove oficialmente que não possui protestos registrados em seu nome.'
                    : 'Obtenha a certidão oficial com todos os detalhes dos protestos encontrados.'
                  }
                </p>

                {isPaidConsultation && orderId ? (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div>
                      <Button 
                        onClick={() => router.push(`/orders/${orderId}/download`)} 
                        className="w-full sm:w-auto"
                        icon={<Download className="w-4 h-4" />}
                      >
                        Baixar Certidão
                      </Button>
                    </div>
                    <span className="text-xs sm:text-sm text-success-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Pago
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-3 sm:mb-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-accent-600" />
                        </div>
                        <span className="text-lg sm:text-xl font-bold text-accent-700">
                          R$ {certificateType === 'NEGATIVE' ? '89,90' : '129,90'}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm text-neutral-600">
                        Documento oficial
                      </span>
                    </div>
                    
                    {error && (
                      <div className="mb-3 sm:mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs sm:text-sm text-red-700">{error}</p>
                      </div>
                    )}
                    
                    <div>
                      <Button 
                        onClick={handleRequestCertificate}
                        loading={isCreatingOrder}
                        loadingText="Criando pedido..."
                        size="lg"
                        className="w-full sm:w-auto"
                        icon={<FileText className="w-4 h-4" />}
                      >
                        Solicitar Certidão Oficial
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Information Section */}
      <div>
        <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
          <h4 className="text-sm sm:text-base font-semibold text-neutral-900 mb-3">
            Sobre esta consulta
          </h4>
          
          <div className="space-y-2 text-xs sm:text-sm text-neutral-600">
            <p>
              • Esta consulta foi realizada em {formatDate(data.searchDate)} em cartórios de todo o Brasil
            </p>
            
            <p>
              • {isPaidConsultation ? 'Consulta paga com detalhes completos' : 'Consulta gratuita com informações básicas'}
            </p>
            
            <p>
              • Para fins oficiais, é necessário solicitar uma certidão com validade jurídica
            </p>
            
            {!isPaidConsultation && (
              <p>
                • Certidões oficiais incluem assinatura digital e têm validade legal
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}