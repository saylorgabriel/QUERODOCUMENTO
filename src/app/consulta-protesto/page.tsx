'use client'

import React, { useState } from 'react'
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

  const handleQuerySubmit = async (documentNumber: string, name: string, phone?: string) => {
    setIsLoading(true)
    setError(null)
    setConsultationResult(null)

    try {
      const response = await fetch('/api/protest/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentNumber,
          name,
          phone,
          consultationType: 'BASIC' // Free consultation
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao realizar consulta')
      }

      const data = await response.json()
      setConsultationResult(data.data)

    } catch (error) {
      console.error('Consultation error:', error)
      setError(error instanceof Error ? error.message : 'Erro ao realizar consulta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewConsultation = () => {
    setConsultationResult(null)
    setError(null)
  }

  if (isLoading) {
    return (
      <LayoutWrapper>
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Consultando protestos...</h3>
            <p className="text-neutral-600">
              Aguarde enquanto verificamos os cartórios de todo o Brasil
            </p>
          </div>
        </div>
      </LayoutWrapper>
    )
  }

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
              Consulta gratuita com informações básicas.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 lg:mb-12">
            <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-card shadow-card text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-success-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2">Consulta Gratuita</h3>
              <p className="text-xs sm:text-sm text-neutral-600">
                Veja se há protestos registrados sem pagar nada
              </p>
            </div>

            <div className="p-4 sm:p-6 lg:p-8 bg-white rounded-card shadow-card text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2">Resultado Instantâneo</h3>
              <p className="text-xs sm:text-sm text-neutral-600">
                Consulta em tempo real em cartórios de todo o Brasil
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
          <ConsultaProtestoForm onQuerySubmit={handleQuerySubmit} />

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
                  <p className="font-medium text-neutral-900 mb-1 text-sm sm:text-base">Consulta Gratuita</p>
                  <p className="text-xs sm:text-sm text-neutral-600">
                    Veja se há protestos registrados
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-sm">
                    <span className="text-base sm:text-lg font-bold text-primary-600">3</span>
                  </div>
                  <p className="font-medium text-neutral-900 mb-1 text-sm sm:text-base">Resultado Instantâneo</p>
                  <p className="text-xs sm:text-sm text-neutral-600">
                    Informações básicas em tempo real
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
                Consulta Gratuita vs. Certidão Oficial
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
                  <h4 className="font-semibold text-success-800 mb-2">Consulta Gratuita</h4>
                  <ul className="text-sm text-success-700 space-y-1">
                    <li>• Informações básicas sobre protestos</li>
                    <li>• Resultado instantâneo</li>
                    <li>• Sem custo</li>
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
                    A consulta gratuita é confiável?
                  </h4>
                  <p className="text-sm text-neutral-600">
                    Sim, consultamos os mesmos cartórios. A diferença é que na versão gratuita 
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