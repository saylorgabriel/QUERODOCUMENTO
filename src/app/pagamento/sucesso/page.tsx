'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { CheckCircle, Download, FileText, Home, Receipt, Clock } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  serviceType: string
  amount: number
  status: string
  paymentStatus: string
  documentNumber: string
  invoiceName: string
  createdAt: string
  paidAt: string
  documents?: Array<{
    id: string
    filename: string
    documentType: string
  }>
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams?.get('orderId')

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('ID do pedido não fornecido')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`/api/orders/${orderId}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao carregar pedido')
        }

        const data = await response.json()
        setOrder(data.order)
      } catch (error) {
        console.error('Error fetching order:', error)
        setError(error instanceof Error ? error.message : 'Erro ao carregar pedido')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const handleDownloadDocument = async (documentId: string, filename: string) => {
    try {
      const downloadUrl = `/api/orders/${orderId}/download?documentId=${documentId}`
      
      const response = await fetch(downloadUrl)
      
      if (!response.ok) {
        const errorData = await response.json()
        alert(errorData.error || 'Erro ao baixar documento')
        return
      }

      // Create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Download error:', error)
      alert('Erro ao baixar documento')
    }
  }

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </LayoutWrapper>
    )
  }

  if (error || !order) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-neutral-50 py-8">
          <div className="container-wrapper">
            <div className="max-w-2xl mx-auto">
              <Card className="p-8 text-center">
                <h1 className="text-2xl font-bold text-neutral-900 mb-4">Erro</h1>
                <p className="text-neutral-600 mb-6">{error || 'Pedido não encontrado'}</p>
                <Button onClick={() => router.push('/')} variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao início
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container-wrapper">
          <div className="max-w-3xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-success-600" />
              </div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Pagamento Confirmado!
              </h1>
              <p className="text-lg text-neutral-600">
                Seu pedido foi processado com sucesso
              </p>
            </div>

            {/* Order Details */}
            <Card className="p-6 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                    Pedido #{order.orderNumber}
                  </h2>
                  <div className="space-y-1 text-sm text-neutral-600">
                    <p><strong>Serviço:</strong> {order.serviceType === 'PROTEST_QUERY' ? 'Consulta de Protesto' : 'Certidão de Protesto'}</p>
                    <p><strong>Documento:</strong> {order.documentNumber}</p>
                    <p><strong>Cliente:</strong> {order.invoiceName}</p>
                    <p><strong>Pago em:</strong> {new Date(order.paidAt).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-success-600 mb-1">
                    R$ {order.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-success-100 text-success-700 rounded-full text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Pago
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="border-t border-neutral-200 pt-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Próximos Passos</h3>
                
                {order.paymentStatus === 'COMPLETED' ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                      <Clock className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-primary-900">Processamento Iniciado</p>
                        <p className="text-sm text-primary-700 mt-1">
                          Seu pedido está sendo processado. Você receberá o documento em até 3 dias úteis por email.
                        </p>
                      </div>
                    </div>

                    {order.documents && order.documents.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-neutral-900">Documentos Disponíveis:</h4>
                        {order.documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-neutral-500" />
                              <div>
                                <p className="font-medium text-neutral-900">{doc.filename}</p>
                                <p className="text-sm text-neutral-600">
                                  {doc.documentType === 'RESULT' ? 'Resultado da consulta' :
                                   doc.documentType === 'CERTIFICATE' ? 'Certidão oficial' :
                                   doc.documentType === 'INVOICE' ? 'Nota fiscal' : 'Documento'}
                                </p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => handleDownloadDocument(doc.id, doc.filename)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Baixar
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-900">Aguardando Confirmação</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Estamos confirmando seu pagamento. Isso pode levar alguns minutos.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Actions */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <Button variant="outline" onClick={() => router.push('/dashboard')} className="h-12">
                <Receipt className="w-4 h-4 mr-2" />
                Ver Meus Pedidos
              </Button>
              
              <Button onClick={() => router.push('/consulta-protesto')} className="h-12">
                <FileText className="w-4 h-4 mr-2" />
                Nova Consulta
              </Button>
            </div>

            {/* Information */}
            <Card className="p-6">
              <h3 className="font-semibold text-neutral-900 mb-3">Informações Importantes</h3>
              <div className="space-y-2 text-sm text-neutral-600">
                <p>• Você receberá um email de confirmação em alguns minutos</p>
                <p>• O documento será enviado por email quando estiver pronto</p>
                <p>• Você pode acompanhar o status do seu pedido no painel de controle</p>
                <p>• Em caso de dúvidas, entre em contato conosco pelo WhatsApp ou email</p>
                <p>• Mantenha o número do pedido para referência: <strong>#{order.orderNumber}</strong></p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  )
}