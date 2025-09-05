import { Metadata } from 'next'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import { CertificateRequestForm } from '@/components/forms/CertificateRequestForm'

export const metadata: Metadata = {
  title: 'Solicitar Certidão de Protesto | QueroDocumento',
  description: 'Solicite sua certidão de protesto oficial de forma rápida e segura. Consulta em cartórios de todo o Brasil.',
  keywords: 'certidão protesto, certidão negativa, certidão positiva, cartório, protesto, documento oficial'
}

export default function CertidaoProtestoPage() {
  return (
    <LayoutWrapper>
      <main className="min-h-screen bg-neutral-50 py-8">
        <div className="container-wrapper">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              Certidão de Protesto
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Solicite sua certidão de protesto oficial emitida pelos cartórios competentes. 
              Documento reconhecido nacionalmente para comprovação de existência ou inexistência de protestos.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="card-elevated text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Documento Oficial</h3>
              <p className="text-sm text-neutral-600">
                Certidão emitida diretamente pelos cartórios de protesto competentes
              </p>
            </div>

            <div className="card-elevated text-center">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Processo Rápido</h3>
              <p className="text-sm text-neutral-600">
                Orçamento em até 3 dias úteis, emissão em até 5 dias após pagamento
              </p>
            </div>

            <div className="card-elevated text-center">
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Abrangência Nacional</h3>
              <p className="text-sm text-neutral-600">
                Consulta em cartórios de todos os estados do Brasil
              </p>
            </div>
          </div>

          {/* Main Form */}
          <CertificateRequestForm />

          {/* Information Section */}
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <div className="card-elevated">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                O que é uma Certidão de Protesto?
              </h3>
              <div className="space-y-3 text-sm text-neutral-600">
                <p>
                  A certidão de protesto é um documento oficial que comprova a existência ou inexistência de 
                  protestos em nome de uma pessoa física ou jurídica.
                </p>
                <p>
                  <strong>Certidão Negativa:</strong> Comprova que não há protestos registrados.
                </p>
                <p>
                  <strong>Certidão Positiva:</strong> Lista todos os protestos existentes com detalhes completos.
                </p>
                <p>
                  É amplamente aceita por bancos, empresas e órgãos públicos para análise de crédito e 
                  comprovação de idoneidade financeira.
                </p>
              </div>
            </div>

            <div className="card-elevated">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                Quando é Necessária?
              </h3>
              <div className="space-y-2 text-sm text-neutral-600">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Processos judiciais e licitações</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Análise de crédito em bancos e financeiras</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Contratação em empresas</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Negociações comerciais e parcerias</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Compra e venda de imóveis</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Abertura ou alteração de empresas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="mt-12">
            <div className="card-elevated bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                  Como Funciona o Preço?
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <span className="text-lg font-bold text-primary-600">1</span>
                    </div>
                    <p className="font-medium text-neutral-900 mb-1">Solicitação</p>
                    <p className="text-sm text-neutral-600">
                      Faça sua solicitação sem custo inicial
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <span className="text-lg font-bold text-primary-600">2</span>
                    </div>
                    <p className="font-medium text-neutral-900 mb-1">Orçamento</p>
                    <p className="text-sm text-neutral-600">
                      Receba o preço exato em até 3 dias úteis
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <span className="text-lg font-bold text-primary-600">3</span>
                    </div>
                    <p className="font-medium text-neutral-900 mb-1">Pagamento</p>
                    <p className="text-sm text-neutral-600">
                      Pague somente após aprovação do orçamento
                    </p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm text-neutral-600">
                    <strong>Preço base a partir de R$ 89,90</strong> - O valor final depende do cartório e tipo de certidão solicitada.
                    Você só paga após concordar com o orçamento.
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