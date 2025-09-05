'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, FileText, Eye, ArrowRight, Copy, Check } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string
  serviceType: string
  status: string
  amount: number
  paymentMethod: string
  createdAt: string
}

function SucessoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const orderId = searchParams?.get('orderId')

  useEffect(() => {
    if (!orderId) {
      router.push('/')
      return
    }

    fetchOrder()
  }, [orderId, router])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/user/orders?id=${orderId}`)
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Erro ao buscar pedido')
        return
      }

      if (data.orders && data.orders.length > 0) {
        setOrder(data.orders[0])
      } else {
        setError('Pedido não encontrado')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      setError('Erro de conexão')
    } finally {
      setIsLoading(false)
    }
  }

  const copyOrderNumber = async () => {
    if (order?.orderNumber) {
      await navigator.clipboard.writeText(order.orderNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'PIX':
        return 'PIX'
      case 'CREDIT_CARD':
        return 'Cartão de Crédito'
      case 'BOLETO':
        return 'Boleto Bancário'
      default:
        return method
    }
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'AWAITING_PAYMENT':
        return 'Aguardando Pagamento'
      case 'PROCESSING':
        return 'Em Processamento'
      case 'COMPLETED':
        return 'Concluído'
      case 'CANCELLED':
        return 'Cancelado'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AWAITING_PAYMENT':
        return 'text-yellow-600 bg-yellow-100'
      case 'PROCESSING':
        return 'text-blue-600 bg-blue-100'
      case 'COMPLETED':
        return 'text-green-600 bg-green-100'
      case 'CANCELLED':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Carregando informações do pedido...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Ops!</h2>
          <p className="text-neutral-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/')}>
            Voltar ao Início
          </Button>
        </div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-subtle">
      {/* Success Header */}
      <section className="py-16 bg-gradient-primary text-white text-center">
        <div className="container-padded">
          <div className="max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Pedido Realizado com Sucesso!
            </h1>
            <p className="text-xl text-primary-100">
              Sua consulta de protesto foi solicitada e está sendo processada
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-padded">
          <div className="max-w-4xl mx-auto">
            {/* Order Details Card */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    Detalhes do Pedido
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-neutral-600">Número do pedido:</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-neutral-100 px-2 py-1 rounded text-sm font-mono">
                        {order.orderNumber}
                      </code>
                      <button
                        onClick={copyOrderNumber}
                        className="p-1 hover:bg-neutral-100 rounded transition-colors duration-200"
                        title="Copiar número do pedido"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-neutral-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusDisplay(order.status)}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                    Informações do Serviço
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Tipo de serviço:</span>
                      <span className="font-medium">Consulta de Protesto</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Valor:</span>
                      <span className="font-medium">R$ {order.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Forma de pagamento:</span>
                      <span className="font-medium">{getPaymentMethodDisplay(order.paymentMethod)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Data do pedido:</span>
                      <span className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                    Status do Processamento
                  </h3>
                  <div className="space-y-4">
                    {order.status === 'AWAITING_PAYMENT' ? (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">Aguardando pagamento</p>
                          <p className="text-sm text-neutral-600">
                            Complete o pagamento para iniciar o processamento
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">Em processamento</p>
                          <p className="text-sm text-neutral-600">
                            Sua consulta está sendo processada
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                Próximos Passos
              </h2>

              <div className="space-y-6">
                {order.status === 'AWAITING_PAYMENT' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-yellow-800 mb-1">
                          Complete seu pagamento
                        </h3>
                        <p className="text-yellow-700 text-sm mb-3">
                          Seu pedido foi criado com sucesso. Para dar continuidade ao processamento, 
                          complete o pagamento através do método escolhido.
                        </p>
                        {order.paymentMethod === 'PIX' && (
                          <p className="text-sm text-yellow-600">
                            O código PIX será enviado para seu email em instantes.
                          </p>
                        )}
                        {order.paymentMethod === 'BOLETO' && (
                          <p className="text-sm text-yellow-600">
                            O boleto será enviado para seu email e tem vencimento em 3 dias úteis.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary-600 font-bold">1</span>
                    </div>
                    <h4 className="font-semibold text-neutral-900 mb-2">Pagamento</h4>
                    <p className="text-sm text-neutral-600">
                      {order.status === 'AWAITING_PAYMENT' 
                        ? 'Complete o pagamento para iniciar o processamento'
                        : 'Pagamento confirmado'
                      }
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-neutral-600 font-bold">2</span>
                    </div>
                    <h4 className="font-semibold text-neutral-900 mb-2">Processamento</h4>
                    <p className="text-sm text-neutral-600">
                      Consulta realizada em todos os cartórios do Brasil
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-neutral-600 font-bold">3</span>
                    </div>
                    <h4 className="font-semibold text-neutral-900 mb-2">Entrega</h4>
                    <p className="text-sm text-neutral-600">
                      Documento oficial enviado por email
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact and Support */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                Precisa de Ajuda?
              </h2>
              <p className="text-neutral-600 mb-6">
                Nossa equipe está sempre disponível para ajudar. Entre em contato conosco 
                através dos canais abaixo:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-success-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.785"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">WhatsApp</p>
                    <p className="text-sm text-neutral-600">Resposta em até 24h</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">Email</p>
                    <p className="text-sm text-neutral-600">Suporte técnico</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  Acompanhar Pedido
                </Button>
              </Link>
              
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Nova Consulta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default function SucessoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Carregando...</p>
        </div>
      </div>
    }>
      <SucessoContent />
    </Suspense>
  )
}