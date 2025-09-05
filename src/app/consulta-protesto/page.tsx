'use client'

// Force dynamic rendering for this page due to searchParams usage in child components
export const dynamic = 'force-dynamic'

import React, { useState, Suspense } from 'react'
import { Metadata } from 'next'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import { ConsultaProtestoForm } from '@/components/forms/ConsultaProtestoForm'
import { ProtestResults } from '@/components/forms/ProtestResults'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Search, FileText, Shield, Zap } from 'lucide-react'

interface ConsultationResult {
  queryId: string
  documentSearched: string
  documentType: 'CPF' | 'CNPJ'
  name: string
  searchDate: string
  status: string
  totalProtests: number
  protests: Array<{
    id: string
    date: string
    value: number
    creditor: string
    notaryOffice: string
    city: string
    state: string
    protocol: string
    status: 'ACTIVE' | 'PAID' | 'CANCELLED'
  }>
  summary: string
  isPaidConsultation: boolean
  consultationType: 'BASIC' | 'DETAILED'
  canRequestCertificate: boolean
  certificateType: 'NEGATIVE' | 'POSITIVE'
  orderId?: string
  orderNumber?: string
}

export default function ConsultaProtestoPage() {
  const [consultationResult, setConsultationResult] = useState<ConsultationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [consultationSubmitted, setConsultationSubmitted] = useState<{documentNumber: string, name: string, phone?: string} | null>(null)

  const handleQuerySubmit = async (documentNumber: string, name: string, phone?: string) => {
    setIsLoading(true)
    setError(null)
    setConsultationResult(null)
    setConsultationSubmitted(null)

    try {
      const response = await fetch('/api/protest/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentNumber,
          name,
          phone,
          consultationType: 'BASIC' // Basic consultation
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao realizar consulta')
      }

      const data = await response.json()
      // Ao invés de mostrar o resultado, mostra mensagem de confirmação
      setConsultationSubmitted({ documentNumber, name, phone })

    } catch (error) {
      console.error('Consultation error:', error)
      setError(error instanceof Error ? error.message : 'Erro ao realizar consulta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewConsultation = () => {
    setConsultationResult(null)
    setConsultationSubmitted(null)
    setError(null)
  }

  if (isLoading) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Processando sua consulta...</h3>
            <p className="text-neutral-600">
              Aguarde enquanto processamos seu pagamento e enviamos sua solicitação
            </p>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  // Mostra mensagem de confirmação após envio da consulta
  if (consultationSubmitted) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-neutral-50 py-4 sm:py-6 lg:py-8">
          <div className="container-padded">
            <div className="max-w-2xl mx-auto">
              {/* Header with back button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <Button variant="outline" onClick={handleNewConsultation} className="w-full sm:w-auto">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Nova Consulta
                </Button>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">Consulta Enviada</h1>
                  <p className="text-sm sm:text-base text-neutral-600">Sua solicitação foi processada</p>
                </div>
              </div>

              {/* Confirmation Message */}
              <Card className="p-6 sm:p-8 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Consulta Solicitada com Sucesso!
                </h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="space-y-2 text-sm text-neutral-700">
                    <p><strong>Nome:</strong> {consultationSubmitted.name}</p>
                    <p><strong>Documento:</strong> {consultationSubmitted.documentNumber}</p>
                    {consultationSubmitted.phone && (
                      <p><strong>Telefone:</strong> {consultationSubmitted.phone}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary-600">1</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-1">Confirmação de Pagamento</h3>
                      <p className="text-sm text-neutral-600">
                        Você receberá um email confirmando que o pagamento do pedido foi concluído com sucesso.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-accent-600">2</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-1">Resultado da Consulta</h3>
                      <p className="text-sm text-neutral-600">
                        <strong>Prazo:</strong> Até 24 horas para receber outro email com a atualização e resultado completo da sua consulta de protesto.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h4 className="font-semibold text-amber-800">Importante</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-700">
                    Verifique sua caixa de entrada e spam. Caso não receba os emails no prazo, entre em contato conosco pelo WhatsApp.
                  </p>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleNewConsultation} 
                    variant="outline" 
                    className="w-full sm:w-auto"
                  >
                    Fazer Nova Consulta
                  </Button>
                  <Button 
                    onClick={() => window.open('https://wa.me/5511999999999', '_blank')} 
                    className="w-full sm:w-auto"
                  >
                    Falar no WhatsApp
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  // Esta seção é mantida para casos onde o resultado é mostrado imediatamente (futura automação)
  if (consultationResult) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-neutral-50 py-4 sm:py-6 lg:py-8">
          <div className="container-padded">
            <div className="max-w-4xl mx-auto">
              {/* Header with back button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <Button variant="outline" onClick={handleNewConsultation} className="w-full sm:w-auto">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Nova Consulta
                </Button>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">Resultado da Consulta</h1>
                  <p className="text-sm sm:text-base text-neutral-600">Consulta realizada com sucesso</p>
                </div>
              </div>

              {/* Results */}
              <ProtestResults data={consultationResult} />
            </div>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  if (error) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-neutral-50 py-4 sm:py-6 lg:py-8">
          <div className="container-padded">
            <div className="max-w-2xl mx-auto">
              <Card className="p-6 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 sm:w-8 sm:h-8 text-danger-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">Erro na Consulta</h2>
                <p className="text-sm sm:text-base text-neutral-600 mb-6">{error}</p>
                <Button onClick={handleNewConsultation} className="w-full sm:w-auto">
                  Tentar Novamente
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  // Default consultation form view
  return (
    <LayoutWrapper>
      <main className="min-h-screen bg-neutral-50 py-6 sm:py-8">
        <div className="container-padded">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3 sm:mb-4">
              Consulta de Protesto
            </h1>
            <p className="text-base sm:text-lg text-neutral-600 max-w-3xl mx-auto px-4">
              Consulte se há protestos registrados em seu CPF ou CNPJ em cartórios de todo o Brasil. 
              Consulta paga com informações básicas.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 lg:mb-12">
            <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-card shadow-card text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-success-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2">Consulta Básica</h3>
              <p className="text-xs sm:text-sm text-neutral-600">
                Consulte protestos registrados rapidamente
              </p>
            </div>

            <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-card shadow-card text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2">Resultado em até 24h</h3>
              <p className="text-xs sm:text-sm text-neutral-600">
                Consulta completa em cartórios de todo o Brasil
              </p>
            </div>

            <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-card shadow-card text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-accent-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2">Certidão Oficial</h3>
              <p className="text-xs sm:text-sm text-neutral-600">
                Solicite certidão oficial caso necessário
              </p>
            </div>
          </div>

          {/* Main Form */}
          <Suspense fallback={
            <div className="max-w-2xl mx-auto">
              <Card className="p-6 sm:p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-3 text-neutral-600">Carregando formulário...</span>
                </div>
              </Card>
            </div>
          }>
            <ConsultaProtestoForm onQuerySubmit={handleQuerySubmit} />
          </Suspense>

          {/* How it works */}
          <div className="mt-12 sm:mt-14 lg:mt-16">
            <div className="p-6 sm:p-8 bg-white rounded-card shadow-card bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200">
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-3 sm:mb-4">
                  Como Funciona
                </h3>
                <p className="text-sm sm:text-base text-neutral-600">
                  Processo simples e seguro para consultar protestos
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-sm">
                    <span className="text-base sm:text-lg font-bold text-primary-600">1</span>
                  </div>
                  <p className="font-medium text-neutral-900 mb-1 text-sm sm:text-base">Informe os Dados</p>
                  <p className="text-xs sm:text-sm text-neutral-600">
                    Digite o CPF/CNPJ e nome completo
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-sm">
                    <span className="text-base sm:text-lg font-bold text-primary-600">2</span>
                  </div>
                  <p className="font-medium text-neutral-900 mb-1 text-sm sm:text-base">Consulta</p>
                  <p className="text-xs sm:text-sm text-neutral-600">
                    Veja se há protestos registrados
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-sm">
                    <span className="text-base sm:text-lg font-bold text-primary-600">3</span>
                  </div>
                  <p className="font-medium text-neutral-900 mb-1 text-sm sm:text-base">Resultado em até 24h</p>
                  <p className="text-xs sm:text-sm text-neutral-600">
                    Informações básicas por email
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-sm">
                    <span className="text-base sm:text-lg font-bold text-primary-600">4</span>
                  </div>
                  <p className="font-medium text-neutral-900 mb-1 text-sm sm:text-base">Certidão Oficial</p>
                  <p className="text-xs sm:text-sm text-neutral-600">
                    Solicite se necessário (pago)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Information Section */}
          <div className="mt-12 sm:mt-14 lg:mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="p-6 sm:p-8 bg-white rounded-card shadow-card">
              <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-4">
                Consulta Básica vs. Certidão Oficial
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
                  <h4 className="font-semibold text-success-800 mb-2">Consulta Básica</h4>
                  <ul className="text-sm text-success-700 space-y-1">
                    <li>• Informações básicas sobre protestos</li>
                    <li>• Resultado instantâneo</li>
                    <li>• A partir de R$ 29,90</li>
                    <li>• Não tem validade jurídica</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                  <h4 className="font-semibold text-primary-800 mb-2">Certidão Oficial</h4>
                  <ul className="text-sm text-primary-700 space-y-1">
                    <li>• Documento oficial com assinatura digital</li>
                    <li>• Detalhes completos dos protestos</li>
                    <li>• Validade jurídica</li>
                    <li>• A partir de R$ 89,90</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 bg-white rounded-card shadow-card">
              <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-4">
                Perguntas Frequentes
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-neutral-900 mb-1">
                    A consulta básica é confiável?
                  </h4>
                  <p className="text-sm text-neutral-600">
                    Sim, consultamos os mesmos cartórios. A diferença é que na versão básica 
                    algumas informações detalhadas ficam ocultas.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-neutral-900 mb-1">
                    Quando preciso da certidão oficial?
                  </h4>
                  <p className="text-sm text-neutral-600">
                    Para processos judiciais, licitações, análise de crédito bancário, 
                    contratações e outras situações que exigem documento com validade legal.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-neutral-900 mb-1">
                    Os dados ficam salvos?
                  </h4>
                  <p className="text-sm text-neutral-600">
                    Seguimos a LGPD. Os dados são utilizados apenas para a consulta e 
                    podem ser removidos a qualquer momento mediante solicitação.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </LayoutWrapper>
  )
}