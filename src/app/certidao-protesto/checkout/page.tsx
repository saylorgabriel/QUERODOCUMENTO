'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PaymentMethodSelector } from '@/components/forms/PaymentMethodSelector'
import { CreditCardForm, CreditCardData } from '@/components/forms/CreditCardForm'
import { CheckCircle2, Clock, FileText, ArrowRight, Copy, Check, CreditCard, Smartphone, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string
  serviceType: string
  status: string
  amount: number
  paymentMethod: string
  paymentStatus?: string
  createdAt: string
}

interface PaymentResponse {
  success: boolean
  order: {
    id: string
    orderNumber: string
    status: string
    paymentMethod: string
    totalAmount: number
  }
  payment: {
    id: string
    status: string
    invoiceUrl?: string
    bankSlipUrl?: string
    pixQrCode?: {
      encodedImage?: string
      payload?: string
    }
    dueDate?: string
  }
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [error, setError] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'PIX' | 'CREDIT_CARD' | 'BOLETO' | null>(null)
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null)
  const [copied, setCopied] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [creditCardData, setCreditCardData] = useState<CreditCardData | null>(null)

  const orderId = searchParams?.get('orderId')

  // Polling para verificar status do pagamento
  useEffect(() => {
    if (!orderId || !paymentResponse || isPaid) return

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/user/orders?id=${orderId}`)
        const data = await response.json()

        if (data.order?.status === 'PAYMENT_CONFIRMED' || data.order?.paymentStatus === 'COMPLETED') {
          console.log('✅ Payment confirmed!')
          setIsPaid(true)
          setOrder(data.order)
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
      }
    }

    // Polling a cada 5 segundos
    const interval = setInterval(checkPaymentStatus, 5000)

    // Limpar ao desmontar
    return () => clearInterval(interval)
  }, [orderId, paymentResponse, isPaid])

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

      setOrder(data.order)
      console.log('📦 Order loaded:', data.order)

      // Check if payment already exists (to handle page reloads)
      if (data.order.asaasPaymentId && data.order.metadata?.asaasPayment) {
        console.log('💰 Payment already exists, loading existing payment data...')
        setSelectedPaymentMethod(data.order.paymentMethod)

        // Reconstruct payment response from order metadata
        const existingPayment = data.order.metadata.asaasPayment
        setPaymentResponse({
          success: true,
          order: {
            id: data.order.id,
            orderNumber: data.order.orderNumber,
            status: data.order.status,
            paymentMethod: data.order.paymentMethod,
            totalAmount: data.order.amount
          },
          payment: {
            id: existingPayment.id,
            status: existingPayment.status,
            invoiceUrl: existingPayment.invoiceUrl,
            bankSlipUrl: existingPayment.bankSlipUrl,
            pixQrCode: existingPayment.pixQrCode,
            dueDate: existingPayment.dueDate
          }
        })
        return
      }

      // If order already has payment method, set it
      if (data.order.paymentMethod) {
        console.log('💳 Payment method found:', data.order.paymentMethod)
        setSelectedPaymentMethod(data.order.paymentMethod)

        // Only auto-process for PIX and BOLETO (not CREDIT_CARD, which needs form data)
        if (data.order.paymentMethod !== 'CREDIT_CARD') {
          console.log('⏱️ Starting payment processing in 500ms...')
          setTimeout(() => {
            console.log('🚀 Processing payment now...')
            processPayment(data.order)
          }, 500)
        } else {
          console.log('⏳ Waiting for user to fill credit card form...')
        }
      } else {
        console.log('❌ No payment method found in order')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      setError('Erro de conexão')
    } finally {
      setIsLoading(false)
    }
  }

  const processPayment = async (orderToProcess?: Order) => {
    const currentOrder = orderToProcess || order
    // Use selectedPaymentMethod first (user's current choice) instead of saved order.paymentMethod
    const paymentMethod = selectedPaymentMethod || currentOrder?.paymentMethod

    console.log('💰 processPayment called with:', {
      orderToProcess: orderToProcess?.id,
      currentOrder: currentOrder?.id,
      paymentMethod,
      selectedPaymentMethod
    })

    if (!paymentMethod || !currentOrder) {
      console.log('❌ Missing payment method or order:', { paymentMethod, currentOrder: !!currentOrder })
      return
    }

    console.log('🔄 Setting processing state...')
    setIsProcessingPayment(true)
    setError('')

    try {
      console.log('📡 Calling payment API with:', {
        orderId: currentOrder.id,
        paymentMethod: paymentMethod,
        hasCreditCardData: !!creditCardData
      })

      const requestBody: any = {
        orderId: currentOrder.id,
        paymentMethod: paymentMethod
      }

      // Add credit card data if payment method is CREDIT_CARD
      if (paymentMethod === 'CREDIT_CARD' && creditCardData) {
        requestBody.creditCard = creditCardData
      }

      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()
      console.log('🎯 Payment API response:', data)

      if (!response.ok) {
        console.error('❌ Payment failed:', data.error || data.details)
        // Extract error message from different possible formats
        const errorMessage = data.error || data.details || data.message || 'Erro ao processar pagamento'
        setError(errorMessage)
        return
      }

      console.log('✅ Payment successful, setting response...')
      setPaymentResponse(data)

      // Check if payment was immediately confirmed (e.g., credit card)
      if (data.payment.status === 'CONFIRMED' || data.payment.status === 'RECEIVED') {
        console.log('💳 Payment immediately confirmed!')
        setIsPaid(true)

        // Update order state to reflect confirmed payment
        if (order) {
          setOrder({
            ...order,
            status: 'PROCESSING',
            paymentStatus: data.payment.status
          })
        }
      }
    } catch (error) {
      console.error('💥 Payment error:', error)
      setError('Erro de conexão ao processar pagamento')
    } finally {
      console.log('🏁 Payment processing finished')
      setIsProcessingPayment(false)
    }
  }

  const handlePayment = async () => {
    // Validate credit card data if payment method is CREDIT_CARD
    if (selectedPaymentMethod === 'CREDIT_CARD') {
      if (!creditCardData) {
        setError('Por favor, preencha os dados do cartão de crédito')
        return
      }

      // Validate required fields
      const requiredFields = ['holderName', 'number', 'expiryMonth', 'expiryYear', 'cvv', 'postalCode', 'addressNumber']
      const missingFields = requiredFields.filter(field => !creditCardData[field as keyof CreditCardData])

      if (missingFields.length > 0) {
        setError('Por favor, preencha todos os campos do cartão de crédito')
        return
      }

      // Validate card number length
      const cardNumberCleaned = creditCardData.number.replace(/\s/g, '')
      if (cardNumberCleaned.length < 13) {
        setError('Número de cartão inválido')
        return
      }
    }

    await processPayment()
  }

  const copyPixCode = async () => {
    if (paymentResponse?.payment?.pixQrCode?.payload) {
      try {
        await navigator.clipboard.writeText(paymentResponse.payment.pixQrCode.payload)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy PIX code:', error)
      }
    }
  }

  if (isLoading || (isProcessingPayment && !paymentResponse)) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-neutral-600">
            {isProcessingPayment ? 'Processando pagamento...' : 'Carregando pedido...'}
          </p>
        </div>
      </div>
    )
  }

  // Show full error page only for critical errors (order not found, etc)
  // Payment errors will be shown inline in the form
  if (error && !order) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Erro</h2>
          <p className="text-neutral-600 mb-6">{error}</p>
          <Link href="/certidao-protesto">
            <Button>Voltar para Certidão</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md">
          <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Pedido não encontrado</h2>
          <p className="text-neutral-600 mb-6">O pedido solicitado não foi encontrado ou não está mais disponível.</p>
          <Link href="/consulta-protesto">
            <Button>Nova Consulta</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Show payment success screen
  if (paymentResponse) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-card shadow-card p-8">
          {/* Banner de pagamento confirmado */}
          {isPaid && (
            <div className="mb-6 p-4 bg-success-50 border-2 border-success-500 rounded-lg animate-pulse">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-success-600 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-success-900">Pagamento Confirmado! 🎉</h3>
                  <p className="text-sm text-success-700">
                    Seu pagamento foi processado com sucesso. Em breve você receberá os documentos por email.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <CheckCircle2 className={cn(
              "w-16 h-16 mx-auto mb-4",
              isPaid ? "text-success-600" : "text-primary-600"
            )} />
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              {isPaid ? "Pagamento Confirmado!" : "Pagamento Criado com Sucesso!"}
            </h1>
            <p className="text-neutral-600">
              Pedido #{paymentResponse.order.orderNumber}
            </p>
          </div>

          {selectedPaymentMethod === 'PIX' && paymentResponse.payment.pixQrCode && !isPaid && (
            <div className="bg-neutral-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Pagamento via PIX
                </h3>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Clock className="w-4 h-4 animate-spin" />
                  Aguardando pagamento...
                </div>
              </div>

              {paymentResponse.payment.pixQrCode.encodedImage && (
                <div className="text-center mb-4">
                  <img
                    src={`data:image/png;base64,${paymentResponse.payment.pixQrCode.encodedImage}`}
                    alt="QR Code PIX"
                    className="mx-auto mb-4 border rounded-lg"
                    style={{ maxWidth: '200px' }}
                  />
                  <p className="text-sm text-neutral-600 mb-4">
                    Escaneie o QR Code com o app do seu banco
                  </p>
                </div>
              )}

              {paymentResponse.payment.pixQrCode.payload && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-neutral-900">
                    Ou copie o código PIX:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={paymentResponse.payment.pixQrCode.payload}
                      readOnly
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded-md bg-neutral-50 text-sm font-mono"
                    />
                    <Button
                      onClick={copyPixCode}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copiado!' : 'Copiar'}
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800">
                  <strong>Importante:</strong> O PIX expira em 30 minutos. Após o pagamento,
                  processaremos seu pedido em até 2 horas úteis.
                </p>
              </div>
            </div>
          )}

          {selectedPaymentMethod === 'BOLETO' && paymentResponse.payment.bankSlipUrl && (
            <div className="bg-neutral-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Boleto Bancário
              </h3>
              <div className="text-center">
                <a
                  href={paymentResponse.payment.bankSlipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  Visualizar Boleto
                </a>
                <p className="text-sm text-neutral-600 mt-4">
                  Vencimento: {paymentResponse.payment.dueDate &&
                    new Date(paymentResponse.payment.dueDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          )}

          {selectedPaymentMethod === 'CREDIT_CARD' && (
            <div className="bg-success-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-success-900 mb-2 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Pagamento Aprovado
              </h3>
              <p className="text-success-700">
                Seu pagamento foi processado com sucesso. Você receberá um email de confirmação em breve.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-neutral-50 rounded-lg p-4">
              <h4 className="font-semibold text-neutral-900 mb-2">Próximos Passos:</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  Processaremos seu pagamento
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-neutral-300 text-neutral-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  Realizaremos a emissão da Certidão de Protesto
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-neutral-300 text-neutral-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  Enviaremos por email e disponibilizaremos na Área do cliente
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full">
                  Acompanhar Pedido
                </Button>
              </Link>
              <Link href="/consulta-protesto" className="flex-1">
                <Button variant="outline" className="w-full">
                  Nova Consulta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show payment selection screen
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-card shadow-card p-8">
        <div className="text-center mb-8">
          <Clock className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Finalize seu Pagamento
          </h1>
          <p className="text-neutral-600">
            Pedido #{order.orderNumber} - {order.serviceType}
          </p>
        </div>

        <div className="bg-neutral-50 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-neutral-900">Consulta de Protesto</h3>
              <p className="text-sm text-neutral-600">Consulta completa em todo o Brasil</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-neutral-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(order.amount)}
              </p>
            </div>
          </div>
        </div>

        <PaymentMethodSelector
          selectedMethod={selectedPaymentMethod}
          onSelect={setSelectedPaymentMethod}
        />

        {/* Credit Card Form */}
        {selectedPaymentMethod === 'CREDIT_CARD' && (
          <div className="mt-6">
            <CreditCardForm onDataChange={setCreditCardData} />
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <Link href="/consulta-protesto" className="flex-1">
            <Button variant="outline" className="w-full">
              Cancelar
            </Button>
          </Link>
          <Button
            onClick={handlePayment}
            disabled={
              !selectedPaymentMethod ||
              isProcessingPayment ||
              (selectedPaymentMethod === 'CREDIT_CARD' && !creditCardData)
            }
            className="flex-1 flex items-center justify-center gap-2"
          >
            {isProcessingPayment ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                Finalizar Pagamento
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50/30 py-8">
      <div className="container mx-auto px-4">
        <Suspense fallback={
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
              <p className="text-neutral-600">Carregando...</p>
            </div>
          </div>
        }>
          <CheckoutContent />
        </Suspense>
      </div>
    </div>
  )
}