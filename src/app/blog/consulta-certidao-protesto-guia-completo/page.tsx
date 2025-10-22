import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, FileText, Search, AlertCircle, CheckCircle, Shield, Scale, Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Consulta e Certidão de Protesto: Guia Completo 2025 | QueroDocumento',
  description: 'Entenda tudo sobre protestos em cartório, a diferença entre consulta e certidão, quando você precisa desses documentos e como obtê-los de forma rápida e segura.',
  keywords: 'protesto, certidão de protesto, consulta de protesto, cartório, título protestado, negativação, certidão negativa, certidão positiva'
}

export default function BlogPostPage() {
  return (
    <main className="min-h-screen bg-neutral-50 py-8">
      <article className="container-padded max-w-4xl">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o Blog
        </Link>

        {/* Article Header */}
        <header className="mb-12">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              Guia Completo
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
            Consulta e Certidão de Protesto: Guia Completo 2025
          </h1>

          <div className="flex items-center gap-6 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>15 de Janeiro de 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>8 min de leitura</span>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
            <p className="text-neutral-800 font-medium mb-0">
              Se você está buscando informações sobre protestos em cartório, veio ao lugar certo.
              Neste guia completo, vamos esclarecer todas as suas dúvidas sobre consulta e certidão
              de protesto, desde o conceito básico até os procedimentos para obtenção desses documentos.
            </p>
          </div>

          {/* O que é Protesto */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-0">O que é Protesto?</h2>
            </div>

            <p className="text-neutral-700 leading-relaxed mb-4">
              O protesto é um ato formal realizado por um cartório de protesto de títulos que comprova
              publicamente o não pagamento de uma dívida. Quando uma pessoa física ou jurídica não paga
              um título (como cheque, duplicata, nota promissória), o credor pode levá-lo a protesto
              em um cartório.
            </p>

            <div className="bg-neutral-100 rounded-lg p-6 mb-4">
              <h3 className="text-xl font-semibold text-neutral-900 mb-3">Como funciona o processo de protesto:</h3>
              <ol className="space-y-2 text-neutral-700">
                <li><strong>1. Inadimplência:</strong> O devedor não paga o título no vencimento</li>
                <li><strong>2. Apresentação ao cartório:</strong> O credor leva o título ao cartório de protesto</li>
                <li><strong>3. Intimação:</strong> O cartório notifica o devedor sobre o protesto iminente</li>
                <li><strong>4. Registro:</strong> Se não houver pagamento, o protesto é registrado publicamente</li>
              </ol>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-900 font-semibold mb-1">Importante:</p>
                  <p className="text-sm text-amber-800">
                    O protesto é diferente da negativação no SPC/Serasa. Enquanto a negativação é feita
                    por órgãos de proteção ao crédito, o protesto é um ato oficial registrado em cartório.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Consequências do Protesto */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Scale className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-0">Consequências de Ter um Protesto</h2>
            </div>

            <p className="text-neutral-700 leading-relaxed mb-4">
              Estar com o nome protestado pode trazer várias consequências negativas para sua vida
              financeira e profissional:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <h4 className="font-semibold text-neutral-900 mb-2">Dificuldade de Crédito</h4>
                <p className="text-sm text-neutral-600">
                  Bancos e financeiras consultam protestos antes de aprovar empréstimos,
                  financiamentos e cartões de crédito.
                </p>
              </div>

              <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <h4 className="font-semibold text-neutral-900 mb-2">Impedimento em Concursos</h4>
                <p className="text-sm text-neutral-600">
                  Alguns concursos públicos e processos seletivos exigem certidão negativa de protesto.
                </p>
              </div>

              <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <h4 className="font-semibold text-neutral-900 mb-2">Restrições Comerciais</h4>
                <p className="text-sm text-neutral-600">
                  Dificuldade para abrir empresas, participar de licitações ou firmar contratos comerciais.
                </p>
              </div>

              <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <h4 className="font-semibold text-neutral-900 mb-2">Limitações Imobiliárias</h4>
                <p className="text-sm text-neutral-600">
                  Complicações para alugar ou comprar imóveis, pois proprietários costumam exigir certidões.
                </p>
              </div>
            </div>
          </section>

          {/* Diferença entre Consulta e Certidão */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">
              Consulta vs Certidão: Qual a Diferença?
            </h2>

            <p className="text-neutral-700 leading-relaxed mb-6">
              Muitas pessoas confundem consulta de protesto com certidão de protesto. Embora ambos
              forneçam informações sobre protestos, são documentos diferentes com finalidades distintas:
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-4">
              {/* Consulta */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Search className="w-8 h-8 text-blue-600" />
                  <h3 className="text-2xl font-bold text-blue-900">Consulta de Protesto</h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-900"><strong>Finalidade:</strong> Verificação pessoal e conhecimento próprio</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-900"><strong>Validade Jurídica:</strong> Não possui</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-900"><strong>Rapidez:</strong> Resultado em até 24 horas</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-900"><strong>Custo:</strong> Mais acessível (a partir de R$ 29,90)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-900"><strong>Uso:</strong> Verificação antes de negócios ou checagem pessoal</span>
                  </div>
                </div>
              </div>

              {/* Certidão */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-8 h-8 text-purple-600" />
                  <h3 className="text-2xl font-bold text-purple-900">Certidão de Protesto</h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-purple-900"><strong>Finalidade:</strong> Documento oficial para apresentação</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-purple-900"><strong>Validade Jurídica:</strong> Possui validade legal</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-purple-900"><strong>Rapidez:</strong> Até 5 dias úteis (após orçamento)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-purple-900"><strong>Custo:</strong> A partir de R$ 89,90 (varia por cartório)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="text-purple-900"><strong>Uso:</strong> Processos, licitações, contratações, imóveis</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-green-900 font-semibold mb-1">Dica do QueroDocumento:</p>
                  <p className="text-sm text-green-800">
                    Se você precisa apenas saber se tem protestos para seu conhecimento pessoal,
                    opte pela consulta. Se precisa apresentar o documento oficialmente em algum
                    lugar, você precisará da certidão.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Tipos de Certidão */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">
              Tipos de Certidão de Protesto
            </h2>

            <p className="text-neutral-700 leading-relaxed mb-6">
              Existem dois tipos principais de certidão de protesto que você pode solicitar ao cartório:
            </p>

            <div className="space-y-4 mb-4">
              <div className="bg-white border-l-4 border-green-500 rounded-r-lg p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Certidão Negativa de Protesto
                </h3>
                <p className="text-neutral-700 mb-3">
                  Comprova que não existem protestos registrados em nome da pessoa física ou jurídica
                  consultada. É o documento "limpo" que geralmente é solicitado.
                </p>
                <p className="text-sm text-neutral-600">
                  <strong>Quando é emitida:</strong> Quando não há nenhum protesto ativo no nome consultado.
                </p>
              </div>

              <div className="bg-white border-l-4 border-red-500 rounded-r-lg p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Certidão Positiva de Protesto
                </h3>
                <p className="text-neutral-700 mb-3">
                  Lista todos os protestos existentes em nome da pessoa física ou jurídica consultada,
                  incluindo detalhes como valores, datas, credores e cartórios.
                </p>
                <p className="text-sm text-neutral-600">
                  <strong>Quando é emitida:</strong> Quando há protestos ativos registrados no nome consultado.
                </p>
              </div>
            </div>
          </section>

          {/* Quando Você Precisa */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-0">
                Quando Você Precisa de uma Certidão de Protesto?
              </h2>
            </div>

            <p className="text-neutral-700 leading-relaxed mb-6">
              A certidão de protesto é exigida em diversas situações do cotidiano pessoal e empresarial:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Processos Judiciais
                </h4>
                <p className="text-sm text-neutral-600">
                  Ações cíveis, trabalhistas e outros processos podem exigir certidão negativa
                  de protesto como comprovação de idoneidade financeira.
                </p>
              </div>

              <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Licitações Públicas
                </h4>
                <p className="text-sm text-neutral-600">
                  Empresas que participam de licitações governamentais precisam apresentar
                  certidão negativa de protesto como documento obrigatório.
                </p>
              </div>

              <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Análise de Crédito
                </h4>
                <p className="text-sm text-neutral-600">
                  Bancos e financeiras podem solicitar a certidão para avaliar concessão de
                  empréstimos, financiamentos ou abertura de contas.
                </p>
              </div>

              <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Contratações
                </h4>
                <p className="text-sm text-neutral-600">
                  Algumas empresas exigem certidão negativa de protesto em processos de
                  contratação de funcionários ou fornecedores.
                </p>
              </div>

              <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Transações Imobiliárias
                </h4>
                <p className="text-sm text-neutral-600">
                  Compra, venda ou locação de imóveis frequentemente requerem apresentação
                  de certidão negativa de protesto.
                </p>
              </div>

              <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Abertura de Empresas
                </h4>
                <p className="text-sm text-neutral-600">
                  Para registro de novas empresas ou alteração de quadro societário, pode
                  ser necessária a apresentação da certidão dos sócios.
                </p>
              </div>
            </div>
          </section>

          {/* Como Obter */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">
              Como Obter Consulta e Certidão de Protesto
            </h2>

            <p className="text-neutral-700 leading-relaxed mb-6">
              Existem basicamente duas formas de obter esses documentos: presencialmente em cartórios
              ou online através de plataformas digitais como o QueroDocumento.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Presencial */}
              <div className="bg-neutral-100 rounded-lg p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Forma Tradicional (Presencial)</h3>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-neutral-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-neutral-700">1</span>
                    </div>
                    <p className="text-sm text-neutral-700">Identifique o cartório de protesto da sua região</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-neutral-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-neutral-700">2</span>
                    </div>
                    <p className="text-sm text-neutral-700">Compareça pessoalmente com documentos</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-neutral-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-neutral-700">3</span>
                    </div>
                    <p className="text-sm text-neutral-700">Preencha formulários e pague as taxas</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-neutral-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-neutral-700">4</span>
                    </div>
                    <p className="text-sm text-neutral-700">Aguarde o prazo de emissão (varia por cartório)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-neutral-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-neutral-700">5</span>
                    </div>
                    <p className="text-sm text-neutral-700">Retorne ao cartório para retirar o documento</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded p-3">
                  <p className="text-xs text-amber-900">
                    <strong>Desvantagens:</strong> Deslocamento, filas, horário comercial, múltiplas visitas
                  </p>
                </div>
              </div>

              {/* Online */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">
                  Forma Moderna (Online)
                </h3>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">1</span>
                    </div>
                    <p className="text-sm text-neutral-700">Acesse QueroDocumento de qualquer lugar</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">2</span>
                    </div>
                    <p className="text-sm text-neutral-700">Preencha o formulário online em minutos</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">3</span>
                    </div>
                    <p className="text-sm text-neutral-700">Pague online (PIX, cartão ou boleto)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">4</span>
                    </div>
                    <p className="text-sm text-neutral-700">Acompanhe o andamento pelo painel</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">5</span>
                    </div>
                    <p className="text-sm text-neutral-700">Receba o documento por email em PDF</p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-xs text-green-900">
                    <strong>Vantagens:</strong> Rapidez, praticidade, sem deslocamento, suporte dedicado
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Como Cancelar Protesto */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">
              Como Cancelar um Protesto?
            </h2>

            <p className="text-neutral-700 leading-relaxed mb-4">
              Se você descobriu que tem um protesto em seu nome e deseja regularizar sua situação,
              é importante saber que o protesto pode ser cancelado. Veja como:
            </p>

            <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-4">
              <h3 className="font-semibold text-neutral-900 mb-4">Passo a passo para cancelamento:</h3>

              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="font-bold text-blue-600">1.</span>
                  <div>
                    <p className="font-semibold text-neutral-900 mb-1">Pague a dívida ao credor</p>
                    <p className="text-sm text-neutral-600">
                      Entre em contato com o credor original e quite o débito protestado.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="font-bold text-blue-600">2.</span>
                  <div>
                    <p className="font-semibold text-neutral-900 mb-1">Obtenha a carta de anuência</p>
                    <p className="text-sm text-neutral-600">
                      O credor deve fornecer uma carta de anuência (autorização para cancelamento).
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="font-bold text-blue-600">3.</span>
                  <div>
                    <p className="font-semibold text-neutral-900 mb-1">Leve ao cartório de protesto</p>
                    <p className="text-sm text-neutral-600">
                      Apresente a carta de anuência e seus documentos no cartório que registrou o protesto.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="font-bold text-blue-600">4.</span>
                  <div>
                    <p className="font-semibold text-neutral-900 mb-1">Pague as taxas do cartório</p>
                    <p className="text-sm text-neutral-600">
                      Há taxas para o cancelamento do protesto (custas cartoriais).
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="font-bold text-blue-600">5.</span>
                  <div>
                    <p className="font-semibold text-neutral-900 mb-1">Aguarde a baixa do protesto</p>
                    <p className="text-sm text-neutral-600">
                      O cartório processará o cancelamento, que costuma levar alguns dias úteis.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Importante:</strong> Mesmo após o cancelamento, o histórico do protesto pode
                permanecer nos registros do cartório por até 5 anos, mas constará como "protestado e
                cancelado", o que demonstra regularização.
              </p>
            </div>
          </section>

          {/* Por que escolher QueroDocumento */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">
                Por que Escolher o QueroDocumento?
              </h2>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-6 h-6" />
                    <h3 className="font-semibold text-lg">Rapidez</h3>
                  </div>
                  <p className="text-sm text-blue-100">
                    Consultas em até 24h e certidões em até 5 dias úteis
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-6 h-6" />
                    <h3 className="font-semibold text-lg">Praticidade</h3>
                  </div>
                  <p className="text-sm text-blue-100">
                    Tudo online, sem filas ou deslocamentos
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-6 h-6" />
                    <h3 className="font-semibold text-lg">Suporte</h3>
                  </div>
                  <p className="text-sm text-blue-100">
                    Atendimento dedicado via WhatsApp e email
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/consulta-protesto"
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-center"
                >
                  Fazer Consulta de Protesto
                </Link>
                <Link
                  href="/certidao-protesto"
                  className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors text-center"
                >
                  Solicitar Certidão Oficial
                </Link>
              </div>
            </div>
          </section>

          {/* Conclusão */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">Conclusão</h2>

            <p className="text-neutral-700 leading-relaxed mb-4">
              Entender a diferença entre consulta e certidão de protesto é fundamental para saber
              qual documento solicitar de acordo com sua necessidade. Enquanto a consulta serve
              para seu conhecimento pessoal, a certidão é o documento oficial exigido em processos
              formais.
            </p>

            <p className="text-neutral-700 leading-relaxed mb-4">
              Com o QueroDocumento, você tem acesso rápido e seguro a ambos os serviços, sem
              complicações e com total transparência de valores e prazos. Nossa plataforma foi
              desenvolvida para tornar esse processo burocrático algo simples e acessível a todos.
            </p>

            <div className="bg-neutral-100 rounded-lg p-6">
              <h3 className="font-semibold text-neutral-900 mb-3">Recapitulando:</h3>
              <ul className="space-y-2 text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>O protesto é um registro oficial de dívida não paga</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>A consulta é para conhecimento próprio (sem validade jurídica)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>A certidão é o documento oficial (com validade jurídica)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Protestos podem ser cancelados após quitação da dívida</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  <span>É possível obter esses documentos online com mais rapidez</span>
                </li>
              </ul>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-6">Perguntas Frequentes</h2>

            <div className="space-y-4">
              <details className="bg-white border border-neutral-200 rounded-lg p-5 group">
                <summary className="font-semibold text-neutral-900 cursor-pointer list-none flex items-center justify-between">
                  <span>A consulta de protesto substitui a certidão?</span>
                  <span className="text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-sm text-neutral-600 mt-3 pl-4 border-l-2 border-blue-200">
                  Não. A consulta é apenas para seu conhecimento e não tem validade jurídica.
                  Se você precisa apresentar oficialmente em algum lugar, deve solicitar a certidão.
                </p>
              </details>

              <details className="bg-white border border-neutral-200 rounded-lg p-5 group">
                <summary className="font-semibold text-neutral-900 cursor-pointer list-none flex items-center justify-between">
                  <span>Qual o prazo de validade da certidão de protesto?</span>
                  <span className="text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-sm text-neutral-600 mt-3 pl-4 border-l-2 border-blue-200">
                  Geralmente a certidão tem validade de 30 a 90 dias, mas o prazo específico
                  depende da finalidade e de quem está solicitando o documento.
                </p>
              </details>

              <details className="bg-white border border-neutral-200 rounded-lg p-5 group">
                <summary className="font-semibold text-neutral-900 cursor-pointer list-none flex items-center justify-between">
                  <span>Posso consultar protestos de outra pessoa?</span>
                  <span className="text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-sm text-neutral-600 mt-3 pl-4 border-l-2 border-blue-200">
                  Sim, a consulta de protesto é pública. Já para certidões, geralmente é necessário
                  autorização ou procuração da pessoa consultada.
                </p>
              </details>

              <details className="bg-white border border-neutral-200 rounded-lg p-5 group">
                <summary className="font-semibold text-neutral-900 cursor-pointer list-none flex items-center justify-between">
                  <span>O que fazer se encontrar um protesto indevido?</span>
                  <span className="text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-sm text-neutral-600 mt-3 pl-4 border-l-2 border-blue-200">
                  Entre em contato com o credor e com o cartório imediatamente. Se o protesto for
                  realmente indevido, você pode contestá-lo judicialmente.
                </p>
              </details>

              <details className="bg-white border border-neutral-200 rounded-lg p-5 group">
                <summary className="font-semibold text-neutral-900 cursor-pointer list-none flex items-center justify-between">
                  <span>Quanto tempo leva para o protesto sair após o cancelamento?</span>
                  <span className="text-neutral-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-sm text-neutral-600 mt-3 pl-4 border-l-2 border-blue-200">
                  Após o cancelamento no cartório, a atualização nos sistemas costuma levar de
                  5 a 10 dias úteis. O protesto cancelado pode continuar aparecendo no histórico.
                </p>
              </details>
            </div>
          </section>
        </div>

        {/* CTA Final */}
        <div className="bg-neutral-100 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-neutral-900 mb-4">
            Precisa de Consulta ou Certidão de Protesto?
          </h3>
          <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
            No QueroDocumento, você obtém seus documentos de forma rápida, segura e sem burocracia.
            Escolha o serviço que precisa e receba tudo por email.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/consulta-protesto"
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Consultar Protestos
            </Link>
            <Link
              href="/certidao-protesto"
              className="btn-secondary inline-flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Solicitar Certidão Oficial
            </Link>
          </div>
        </div>
      </article>
    </main>
  )
}
