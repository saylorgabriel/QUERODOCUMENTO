'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { CheckCircle, Clock, Copy, AlertTriangle, ArrowLeft, CreditCard, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'

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
}

interface Payment {
  paymentId: string
  amount: number
  status: 'pending' | 'paid' | 'expired' | 'failed'
  method: string
  pixQrCode?: string
  pixCopyPaste?: string
  pixExpiresAt?: string
  boletoUrl?: string
  boletoBarcode?: string
  expiresAt?: string
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string

  const [order, setOrder] = useState<Order | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD' | 'BOLETO'>('PIX')
  const [isPolling, setIsPolling] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
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

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  // Create payment
  const createPayment = async () => {
    if (!order) return

    try {
      setLoading(true)
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          paymentMethod
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar pagamento')
      }

      const data = await response.json()
      setPayment(data.payment)
      
      // Start polling for payment status
      if (paymentMethod === 'PIX') {
        setIsPolling(true)
        startPaymentPolling(data.payment.paymentId)
      }

      // Calculate time left for PIX expiry
      if (data.payment.pixExpiresAt) {
        const expiryTime = new Date(data.payment.pixExpiresAt).getTime()
        const now = Date.now()
        setTimeLeft(Math.max(0, Math.floor((expiryTime - now) / 1000)))
      }

    } catch (error) {
      console.error('Error creating payment:', error)
      setError(error instanceof Error ? error.message : 'Erro ao criar pagamento')
    } finally {
      setLoading(false)
    }
  }

  // Poll payment status
  const startPaymentPolling = (paymentId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/create?paymentId=${paymentId}`)
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.payment.status === 'paid') {
            setPayment(prev => prev ? { ...prev, status: 'paid' } : null)
            setIsPolling(false)
            clearInterval(pollInterval)
            
            // Redirect to success page after a short delay
            setTimeout(() => {
              router.push(`/pagamento/sucesso?orderId=${orderId}`)
            }, 2000)
          }
        }
      } catch (error) {
        console.warn('Payment polling error:', error)
      }
    }, 5000) // Poll every 5 seconds

    // Stop polling after 30 minutes
    setTimeout(() => {
      clearInterval(pollInterval)
      setIsPolling(false)
    }, 30 * 60 * 1000)

    return () => clearInterval(pollInterval)
  }

  // Timer countdown for PIX expiry
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Código copiado para a área de transferência!')
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('Erro ao copiar código')
    }
  }

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container-wrapper">
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-neutral-900 mb-4">Erro</h1>
              <p className="text-neutral-600 mb-6">{error}</p>
              <Button onClick={() => router.push('/')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao início
              </Button>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container-wrapper">
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <h1 className="text-2xl font-bold text-neutral-900 mb-4">Pedido não encontrado</h1>
              <Button onClick={() => router.push('/')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao início
              </Button>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container-wrapper">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Pagamento</h1>
              <p className="text-neutral-600">
                Finalize o pagamento do seu pedido #{order.orderNumber}
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Resumo do Pedido</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Pedido:</span>
                      <span className="text-sm font-medium">#{order.orderNumber}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Serviço:</span>
                      <span className="text-sm font-medium">
                        {order.serviceType === 'PROTEST_QUERY' ? 'Consulta de Protesto' : 'Certidão de Protesto'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Documento:</span>
                      <span className="text-sm font-medium">{order.documentNumber}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-600">Cliente:</span>
                      <span className="text-sm font-medium">{order.invoiceName}</span>
                    </div>
                    
                    <hr className="border-neutral-200" />
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary-600">
                        R$ {order.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Payment Methods and Details */}
              <div className="lg:col-span-2">
                {!payment ? (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">Escolha a forma de pagamento</h3>
                    
                    <div className="space-y-4 mb-6">
                      <div
                        className={cn(
                          'border-2 rounded-lg p-4 cursor-pointer transition-colors',
                          paymentMethod === 'PIX'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        )}
                        onClick={() => setPaymentMethod('PIX')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full border-2 border-primary-500 flex items-center justify-center">
                            {paymentMethod === 'PIX' && <div className="w-3 h-3 rounded-full bg-primary-500" />}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900">PIX</p>
                            <p className="text-sm text-neutral-600">Aprovação instantânea</p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={cn(
                          'border-2 rounded-lg p-4 cursor-pointer transition-colors',
                          paymentMethod === 'CREDIT_CARD'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        )}
                        onClick={() => setPaymentMethod('CREDIT_CARD')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full border-2 border-primary-500 flex items-center justify-center">
                            {paymentMethod === 'CREDIT_CARD' && <div className="w-3 h-3 rounded-full bg-primary-500" />}
                          </div>
                          <CreditCard className="w-5 h-5 text-neutral-600" />
                          <div>
                            <p className="font-semibold text-neutral-900">Cartão de Crédito</p>
                            <p className="text-sm text-neutral-600">À vista em 1x</p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={cn(
                          'border-2 rounded-lg p-4 cursor-pointer transition-colors',
                          paymentMethod === 'BOLETO'
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        )}
                        onClick={() => setPaymentMethod('BOLETO')}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full border-2 border-primary-500 flex items-center justify-center">
                            {paymentMethod === 'BOLETO' && <div className="w-3 h-3 rounded-full bg-primary-500" />}
                          </div>
                          <Receipt className="w-5 h-5 text-neutral-600" />
                          <div>
                            <p className="font-semibold text-neutral-900">Boleto Bancário</p>
                            <p className="text-sm text-neutral-600">Vencimento em 3 dias úteis</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={createPayment} 
                      disabled={loading}
                      className="w-full h-12"
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Criando pagamento...
                        </>
                      ) : (
                        'Continuar com o pagamento'
                      )}
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Payment Status */}
                    <Card className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        {payment.status === 'paid' ? (
                          <CheckCircle className="w-6 h-6 text-success-500" />
                        ) : payment.status === 'pending' ? (
                          <Clock className="w-6 h-6 text-amber-500" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-danger-500" />
                        )}
                        
                        <div>
                          <h3 className="text-lg font-semibold text-neutral-900">
                            {payment.status === 'paid' ? 'Pagamento Aprovado!' :
                             payment.status === 'pending' ? 'Aguardando Pagamento' :
                             'Pagamento Expirado'}
                          </h3>
                          {payment.status === 'pending' && isPolling && (
                            <p className="text-sm text-neutral-600">
                              Verificando pagamento automaticamente...
                            </p>
                          )}
                        </div>
                      </div>

                      {payment.status === 'paid' && (
                        <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                          <p className="text-success-700">
                            Seu pagamento foi aprovado! Você será redirecionado em alguns segundos...
                          </p>
                        </div>
                      )}
                    </Card>

                    {/* PIX Payment Details */}
                    {payment.method === 'PIX' && payment.status === 'pending' && (
                      <Card className="p-6">
                        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Pagamento PIX</h3>
                        
                        {timeLeft !== null && timeLeft > 0 && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-amber-600" />
                              <span className="text-amber-700 font-medium">
                                Código expira em: {formatTime(timeLeft)}
                              </span>
                            </div>
                          </div>
                        )}

                        {payment.pixQrCode && (
                          <div className="text-center mb-6">
                            <div className="inline-block p-4 bg-white rounded-lg border border-neutral-200">
                              <img 
                                src={payment.pixQrCode} 
                                alt="QR Code PIX"
                                className="w-48 h-48 mx-auto"
                                onError={(e) => {
                                  // Fallback for mock QR code
                                  const target = e.target as HTMLImageElement
                                  target.src = 'data:image/svg+xml;base64,' + btoa(`
                                    <svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
                                      <rect width="192" height="192" fill="#f5f5f5"/>
                                      <text x="96" y="96" font-family="Arial" font-size="12" text-anchor="middle" dy=".3em">QR Code PIX</text>
                                    </svg>
                                  `)
                                }}
                              />
                            </div>
                            <p className="text-sm text-neutral-600 mt-2">
                              Escaneie o QR Code com o app do seu banco
                            </p>
                          </div>
                        )}

                        {payment.pixCopyPaste && (
                          <div>
                            <p className="text-sm font-medium text-neutral-900 mb-2">
                              Ou copie o código PIX:
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={payment.pixCopyPaste}
                                readOnly
                                className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-sm font-mono"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(payment.pixCopyPaste!)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Card>
                    )}

                    {/* Instructions */}
                    {payment.status === 'pending' && (
                      <Card className="p-6">
                        <h4 className="font-semibold text-neutral-900 mb-3">Como pagar:</h4>
                        <ol className="space-y-2 text-sm text-neutral-600">
                          <li className="flex gap-2">
                            <span className="font-medium text-primary-600">1.</span>
                            <span>Abra o app do seu banco ou carteira digital</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-medium text-primary-600">2.</span>
                            <span>Escolha pagar com PIX</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-medium text-primary-600">3.</span>
                            <span>Escaneie o QR Code ou cole o código PIX</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="font-medium text-primary-600">4.</span>
                            <span>Confirme o pagamento</span>
                          </li>
                        </ol>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}