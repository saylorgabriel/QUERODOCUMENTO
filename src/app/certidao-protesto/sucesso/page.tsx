'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Calendar, CreditCard, FileText, Clock, ArrowRight, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Force dynamic rendering for this page due to searchParams usage
export const dynamic = 'force-dynamic'

interface OrderData {
  id: string
  orderNumber: string
  serviceType: string
  status: string
  amount: number
  paymentMethod: string
  createdAt: string
}

function CertidaoProtestoSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams?.get('orderId')
  
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) {
        setError('ID do pedido não encontrado')
        setLoading(false)
        return
      }

      try {
        // In a real implementation, you would fetch the order data from your API
        // For now, we'll simulate the order data
        setTimeout(() => {
          setOrderData({
            id: orderId,
            orderNumber: `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
            serviceType: 'CERTIFICATE_REQUEST',
            status: 'AWAITING_PAYMENT',
            amount: 89.90,
            paymentMethod: 'PIX',
            createdAt: new Date().toISOString()
          })
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error fetching order data:', error)
        setError('Erro ao carregar dados do pedido')
        setLoading(false)
      }
    }

    fetchOrderData()
  }, [orderId])

  const handleCopyOrderNumber = async () => {
    if (orderData?.orderNumber) {
      try {
        await navigator.clipboard.writeText(orderData.orderNumber)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy order number:', error)
      }
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Carregando dados do pedido...</p>
        </div>
      </main>
    )
  }

  if (error || !orderData) {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Pedido não encontrado</h1>
          <p className="text-neutral-600 mb-6">{error || 'Não foi possível encontrar os dados do pedido.'}</p>
          <Link href="/dashboard">
            <Button>Ir para o Dashboard</Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50 py-8">
        <div className="container-wrapper">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-success-600" />
            </div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              Solicitação Enviada!
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Sua solicitação de certidão de protesto foi recebida com sucesso. 
              Você receberá um orçamento detalhado em até 3 dias úteis.
            </p>
          </div>

          {/* Order Summary */}
          <div className="max-w-2xl mx-auto">
            <div className="card-elevated mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">
                Resumo do Pedido
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <span className="text-neutral-600">Número do pedido</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-neutral-900">
                      {orderData.orderNumber}
                    </span>
                    <button
                      onClick={handleCopyOrderNumber}
                      className="p-1 hover:bg-neutral-100 rounded transition-colors"
                      title="Copiar número do pedido"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-success-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-neutral-500" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <span className="text-neutral-600">Serviço</span>
                  <span className="font-medium text-neutral-900">Certidão de Protesto</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <span className="text-neutral-600">Data da solicitação</span>
                  <span className="font-medium text-neutral-900">
                    {new Date(orderData.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <span className="text-neutral-600">Status</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    Aguardando orçamento
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <span className="text-neutral-600">Preço estimado</span>
                  <span className="text-lg font-bold text-neutral-900">
                    A partir de R$ {orderData.amount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="card-elevated mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">
                Próximos Passos
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-1">
                      Análise da solicitação
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Nossa equipe está analisando sua solicitação e entrando em contato com o cartório competente.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-accent-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-1">
                      Recebimento do orçamento
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Você receberá o orçamento detalhado por email em até 3 dias úteis com o valor exato da certidão.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-success-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-1">
                      Pagamento e emissão
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Após a aprovação e pagamento, sua certidão será emitida em até 5 dias úteis e enviada por email.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card-elevated mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6">
                Cronograma Estimado
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    <span className="font-medium text-neutral-900">Hoje</span>
                  </div>
                  <span className="text-sm text-neutral-600">Solicitação recebida ✓</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-accent-600" />
                    <span className="font-medium text-neutral-900">Até 3 dias úteis</span>
                  </div>
                  <span className="text-sm text-neutral-600">Envio do orçamento por email</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-neutral-900">3 dias úteis</span>
                  </div>
                  <span className="text-sm text-neutral-600">Prazo para pagamento do orçamento</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-success-600" />
                    <span className="font-medium text-neutral-900">Até 5 dias úteis</span>
                  </div>
                  <span className="text-sm text-neutral-600">Emissão e entrega da certidão</span>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="card-elevated bg-accent-50 border-accent-200 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-accent-600" />
                </div>
                <div>
                  <h3 className="font-medium text-accent-900 mb-2">
                    Informações importantes
                  </h3>
                  <ul className="text-sm text-accent-700 space-y-1">
                    <li>• Você receberá atualizações por email sobre o status do seu pedido</li>
                    <li>• O orçamento tem validade de 3 dias úteis após o envio</li>
                    <li>• A certidão será enviada em formato PDF por email</li>
                    <li>• Você pode acompanhar o progresso no seu painel de controle</li>
                    <li>• Em caso de dúvidas, entre em contato conosco pelo WhatsApp ou email</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Acompanhar no Dashboard
                </Button>
              </Link>
              
              <Link href="/certidao-protesto">
                <Button className="w-full flex items-center gap-2">
                  Solicitar Nova Certidão
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Contact Information */}
            <div className="text-center mt-12 p-6 bg-white rounded-lg border border-neutral-200">
              <h3 className="font-medium text-neutral-900 mb-2">
                Precisa de ajuda?
              </h3>
              <p className="text-sm text-neutral-600 mb-4">
                Nossa equipe está pronta para esclarecer suas dúvidas
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/fale-conosco">
                  <Button variant="outline" size="sm">
                    Fale Conosco
                  </Button>
                </Link>
                <a href="https://wa.me/5519981806261?text=Tenho%20interesse%20nos%20servi%C3%A7os%20de%20consulta%20de%20protesto" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
    </main>
  )
}

export default function CertidaoProtestoSuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Carregando...</p>
          </div>
        </div>
      </main>
    }>
      <CertidaoProtestoSuccessContent />
    </Suspense>
  )
}