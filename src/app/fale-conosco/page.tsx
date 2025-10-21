import { Metadata } from 'next'
import { Mail, MessageCircle, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Fale Conosco - QueroDocumento',
  description: 'Entre em contato conosco. Estamos aqui para ajudar com suas consultas e dúvidas sobre protestos e certidões.',
}

export default function FaleConosco() {
  return (
    <main className="min-h-screen bg-neutral-50 py-12">
      <div className="container-padded max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - Contact Form */}
          <div className="bg-white rounded-card shadow-card p-8">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-neutral-900 mb-4">
                Fale Conosco
              </h1>
              <p className="text-lg text-neutral-600">
                Preencha o formulário abaixo e nossa equipe entrará em contato com você.
              </p>
            </header>

            <form className="space-y-6">
              {/* Nome */}
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-neutral-700 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  className="input-primary w-full"
                  placeholder="Digite seu nome completo"
                  required
                />
              </div>

              {/* E-mail */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="input-primary w-full"
                  placeholder="Digite seu e-mail"
                  required
                />
              </div>

              {/* Assunto */}
              <div>
                <label htmlFor="assunto" className="block text-sm font-medium text-neutral-700 mb-2">
                  Assunto
                </label>
                <input
                  type="text"
                  id="assunto"
                  name="assunto"
                  className="input-primary w-full"
                  placeholder="Digite o assunto da sua mensagem"
                  required
                />
              </div>

              {/* Mensagem */}
              <div>
                <label htmlFor="mensagem" className="block text-sm font-medium text-neutral-700 mb-2">
                  Mensagem
                </label>
                <textarea
                  id="mensagem"
                  name="mensagem"
                  rows={6}
                  className="input-primary w-full resize-none"
                  placeholder="Descreva sua dúvida ou solicitação"
                  required
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-primary w-full"
              >
                Enviar
              </button>
            </form>
          </div>

          {/* Right Side - Contact Information */}
          <div className="space-y-8">
            {/* Chat Online Card */}
            <div className="bg-white rounded-card shadow-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Chat On-line
                  </h3>
                  <p className="text-neutral-600">
                    Seg a Sex das 9:00 às 12:00 e 13:00 às 17:00
                  </p>
                </div>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-white rounded-card shadow-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    E-mail
                  </h3>
                  <p className="text-neutral-600">
                    contato@querodocumento.com.br
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp Card */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-card shadow-card p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Atendimento via WhatsApp
                  </h3>
                  <p className="text-green-100 mb-3">
                    Tenha a resposta da sua consulta em até 24 horas úteis!
                  </p>
                  <p className="text-green-100 text-sm mb-4">
                    Nossa equipe de especialistas garante rapidez e qualidade.
                  </p>
                  <a
                    href="https://wa.me/5519981806261?text=Tenho%20interesse%20nos%20servi%C3%A7os%20de%20consulta%20de%20protesto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-green-600 font-semibold py-3 px-6 rounded-button hover:bg-green-50 transition-colors duration-200"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Falar no WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Horário de Atendimento */}
            <div className="bg-white rounded-card shadow-card p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                    Horário de Atendimento
                  </h3>
                  <div className="space-y-2 text-sm text-neutral-600">
                    <p><strong>Segunda a Sexta:</strong> 9:00 às 12:00 e 13:00 às 17:00</p>
                    <p><strong>Sábado:</strong> Fechado</p>
                    <p><strong>Domingo:</strong> Fechado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Encontre respostas para as dúvidas mais comuns sobre nossos serviços
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-card shadow-card p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                Quanto tempo demora para receber a certidão?
              </h3>
              <p className="text-neutral-600">
                As certidões são emitidas em até 48 horas úteis após a confirmação do pagamento. 
                Em casos urgentes, oferecemos processamento expresso em até 24 horas úteis.
                **Nesse caso o prazo é de ate 5 dias uteis apos a confirmação do pagamento
              </p>
            </div>

            <div className="bg-white rounded-card shadow-card p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                Quais documentos preciso fornecer?
              </h3>
              <p className="text-neutral-600">
                Para pessoas físicas: CPF e nome completo. Para empresas: CNPJ e razão social. 
                Todos os dados são tratados com segurança e confidencialidade.
              </p>
            </div>

            <div className="bg-white rounded-card shadow-card p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                A consulta tem validade jurídica?
              </h3>
              <p className="text-neutral-600">
                Sim, todas as certidões emitidas têm validade jurídica 
                e são aceitas em todos os órgãos públicos e instituições financeiras do Brasil.
                **A consulta de protestos não tem validade jurídica. O que tem validade jurídica é a Certidão de Protesto
              </p>
            </div>

            <div className="bg-white rounded-card shadow-card p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                Como funciona o pagamento?
              </h3>
              <p className="text-neutral-600">
                Aceitamos PIX, cartão de crédito e débito. O pagamento é processado de forma 
                segura e você recebe a confirmação imediatamente após a aprovação.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}