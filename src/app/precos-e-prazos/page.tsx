'use client'

import { useState } from 'react'
import { Clock, DollarSign, FileText, Search, CheckCircle, AlertCircle } from 'lucide-react'
import { StateEmolumentsModal } from '@/components/StateEmolumentsModal'

export default function PrecosPrazosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  return (
    <main className="min-h-screen bg-neutral-50 py-8">
      <div className="container-padded max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Preços e Prazos
          </h1>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
            Transparência total nos valores e prazos dos nossos serviços.
            Sem surpresas, sem taxas ocultas.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Consulta de Protesto */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">Consulta de Protesto</h2>
            </div>

            <div className="space-y-6">
              {/* Preço */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-neutral-600" />
                  <h3 className="font-semibold text-neutral-900">Preço</h3>
                </div>
                <div className="ml-7">
                  <p className="text-3xl font-bold text-blue-600 mb-2">R$ 29,90</p> <b>Para todos os estados</b>
                  <br />
                  <p className="text-sm text-neutral-600">Pagamento único via PIX, Cartão</p>
                </div>
              </div>

              {/* Prazo */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-neutral-600" />
                  <h3 className="font-semibold text-neutral-900">Prazo de Entrega</h3>
                </div>
                <div className="ml-7">
                  <p className="text-lg font-semibold text-neutral-900">Até 24 horas úteis</p>
                  <p className="text-sm text-neutral-600">após a confirmação do pagamento</p>
                </div>
              </div>

              {/* O que está incluído */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">O que está incluído:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-700">Verificação de protestos em cartórios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-700">Resultado enviado por email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-700">Consulta básica para conhecimento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-700">Não possui validade jurídica</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Certidão de Protesto */}
          <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">Certidão de Protesto</h2>
            </div>

            <div className="space-y-6">
              {/* Preço */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-neutral-600" />
                  <h3 className="font-semibold text-neutral-900">Preço a partir de</h3>
                </div>
                <div className="ml-7">
                  <p className="text-3xl font-bold text-purple-600 mb-2">R$ 51,54</p>  
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium underline mt-2 transition-colors"
                  >
                    Valor por estado*
                  </button>
                  {/* <p className="text-xs text-neutral-500 mt-2">Orçamento enviado antes do pagamento</p> */}
                </div>
              </div>

              {/* Prazo */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-neutral-600" />
                  <h3 className="font-semibold text-neutral-900">Prazos</h3>
                </div>
                <div className="ml-7 space-y-2">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Emissão:</p>
                    <p className="text-sm text-neutral-600">Até 5 dias úteis após pagamento</p>
                  </div>
                </div>
              </div>

              {/* O que está incluído */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">O que está incluído:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-700">Documento oficial do cartório</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-700">Assinatura digital do tabelião</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-700">Validade jurídica plena</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-700">Entrega em PDF por email</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Informações Importantes */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100 mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Informações Importantes</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Formas de Pagamento</h3>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  <span><strong>PIX:</strong> Aprovação instantânea</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  <span><strong>Cartão de Crédito:</strong> À vista em 1x</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-neutral-900 mb-3">Garantias</h3>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                  <span>Reembolso total em caso de não entrega</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                  <span>Suporte dedicado durante todo o processo</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                  <span>Dados protegidos conforme LGPD</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Perguntas Frequentes</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Por que o preço da certidão varia?
              </h3>
              <p className="text-sm text-neutral-700">
                O valor da certidão depende das taxas cobradas pelo cartório competente, que variam
                por estado e cidade. Por isso, enviamos um orçamento detalhado antes de você efetuar
                o pagamento.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Qual a diferença entre consulta e certidão?
              </h3>
              <p className="text-sm text-neutral-700">
                A <strong>consulta</strong> é uma verificação básica para seu conhecimento pessoal,
                sem validade jurídica. Já a <strong>certidão</strong> é um documento oficial emitido
                pelo cartório, com assinatura digital e validade legal para processos, licitações,
                contratações, etc.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                O prazo pode ser menor?
              </h3>
              <p className="text-sm text-neutral-700">
                Os prazos informados são os máximos garantidos. Na maioria dos casos, conseguimos
                entregar antes do prazo. Você receberá atualizações por email sobre o andamento
                do seu pedido.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-neutral-900 mb-2">
                Posso cancelar meu pedido?
              </h3>
              <p className="text-sm text-neutral-700">
                Para certidões, você pode cancelar antes de aprovar o orçamento, sem custos.
                Para consultas já pagas e processadas, não é possível cancelamento, mas garantimos
                a entrega do resultado.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            Ficou com alguma dúvida?
          </h2>
          <p className="text-neutral-600 mb-6">
            Nossa equipe está pronta para ajudar você
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/fale-conosco"
              className="btn-secondary inline-flex items-center justify-center"
            >
              Fale Conosco
            </a>
            <a
              href="https://wa.me/5519981806261?text=Tenho%20interesse%20nos%20servi%C3%A7os%20de%20consulta%20de%20protesto"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center justify-center"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* State Emoluments Modal */}
      <StateEmolumentsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  )
}
