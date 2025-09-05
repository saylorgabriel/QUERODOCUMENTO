import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso - QueroDocumento',
  description: 'Termos e condições de uso da plataforma QueroDocumento',
}

export default function TermosDeUso() {
  return (
    <main className="min-h-screen bg-neutral-50 py-12">
      <div className="container-padded max-w-4xl">
        <div className="card-elevated">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              Termos de Uso
            </h1>
            <p className="text-lg text-neutral-600">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </header>

          <div className="prose prose-neutral max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                1. Informações Gerais e Definições
              </h2>
              <p className="mb-4">
                Estes Termos de Uso regulamentam a utilização da plataforma <strong>QueroDocumento</strong>, 
                um serviço digital dedicado à consulta de protestos e emissão de certidões de protesto 
                em cartórios de todo o Brasil.
              </p>
              <p className="mb-4">
                Para efeitos destes termos, considera-se:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Usuário/Solicitante:</strong> Pessoa física ou jurídica que se registra na plataforma ou solicita serviços</li>
                <li><strong>Plataforma:</strong> Site QueroDocumento e todos os seus serviços associados</li>
                <li><strong>Serviços:</strong> Consulta de protestos, emissão de certidões e demais funcionalidades oferecidas</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                2. Coleta e Armazenamento de Informações
              </h2>
              <p className="mb-4">
                Para prestação dos serviços, coletamos e armazenamos as seguintes informações:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Dados pessoais: nome, CPF/CNPJ, e-mail, telefone</li>
                <li>Informações dos documentos consultados</li>
                <li>Histórico de transações e solicitações</li>
                <li>Dados de navegação e cookies</li>
              </ul>
              <p className="mb-4">
                Todas as informações são coletadas de forma transparente e armazenadas com segurança, 
                sendo utilizadas exclusivamente para a prestação dos serviços contratados.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                3. Privacidade e Proteção de Dados
              </h2>
              <p className="mb-4">
                Comprometemo-nos com a proteção da privacidade dos usuários, seguindo as diretrizes 
                da Lei Geral de Proteção de Dados (LGPD). Os dados pessoais são tratados de forma 
                confidencial e utilizados apenas para os fins declarados.
              </p>
              <p className="mb-4">
                O usuário é responsável pela veracidade das informações fornecidas e deve manter 
                seus dados de conta atualizados.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                4. Limitações Técnicas e Responsabilidades
              </h2>
              <p className="mb-4">
                A QueroDocumento não se responsabiliza por:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Problemas técnicos em sistemas de terceiros (cartórios, bancos, etc.)</li>
                <li>Instabilidades na conexão de internet do usuário</li>
                <li>Incompatibilidades de software ou hardware</li>
                <li>Interrupções temporárias do serviço para manutenção</li>
              </ul>
              <p className="mb-4">
                Recomendamos sempre fazer logout seguro após utilizar a plataforma, 
                especialmente em computadores compartilhados.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                5. Comunicações e Marketing
              </h2>
              <p className="mb-4">
                Ao se registrar, o usuário autoriza o recebimento de:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Notificações sobre o status dos pedidos</li>
                <li>Comunicações relacionadas aos serviços</li>
                <li>Ofertas e informações promocionais (canceláveis a qualquer momento)</li>
                <li>Atualizações importantes da plataforma</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                6. Segurança da Conta
              </h2>
              <p className="mb-4">
                O usuário é integralmente responsável por:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Manter a confidencialidade de sua senha</li>
                <li>Utilizar senha segura (evitar sequências óbvias como "123456")</li>
                <li>Não compartilhar dados de acesso com terceiros</li>
                <li>Reportar imediatamente qualquer uso não autorizado</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                7. Gestão de Dados Pessoais
              </h2>
              <p className="mb-4">
                O usuário pode, a qualquer momento:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Solicitar a remoção de sua conta</li>
                <li>Atualizar seus dados pessoais</li>
                <li>Cancelar o recebimento de comunicações de marketing</li>
                <li>Solicitar relatório dos dados armazenados</li>
              </ul>
              <p className="mb-4">
                Mesmo após a remoção da conta, alguns dados podem ser mantidos por 
                obrigações legais ou contratuais.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                8. Coleta de Informações de Navegação
              </h2>
              <p className="mb-4">
                Utilizamos cookies e tecnologias similares para:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Melhorar a experiência de navegação</li>
                <li>Personalizar conteúdo e ofertas</li>
                <li>Analisar o uso da plataforma</li>
                <li>Garantir a segurança das transações</li>
              </ul>
              <p className="mb-4">
                O usuário pode configurar seu navegador para recusar cookies, mas isso 
                pode afetar a funcionalidade de alguns recursos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                9. Condições Financeiras
              </h2>
              <p className="mb-4">
                Os preços dos serviços estão disponíveis em nossa página de preços e podem 
                ser alterados sem aviso prévio. As formas de pagamento aceitas são:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>PIX (confirmação instantânea)</li>
                <li>Cartão de crédito</li>
                <li>Boleto bancário</li>
              </ul>
              <p className="mb-4">
                Após a confirmação do pagamento, os serviços são processados conforme 
                os prazos informados. Não são aceitos reembolsos após o processamento do pedido.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                10. Natureza do Serviço
              </h2>
              <p className="mb-4">
                A QueroDocumento é uma plataforma privada de solicitação online que facilita 
                o acesso a serviços de cartórios. <strong>Não somos um cartório oficial</strong> 
                e atuamos como intermediários entre usuários e cartórios credenciados.
              </p>
              <p className="mb-4">
                Os documentos emitidos possuem validade jurídica plena, sendo gerados pelos 
                cartórios competentes através de nossa plataforma.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                11. Disposições Finais
              </h2>
              <p className="mb-4">
                Estes termos podem ser modificados a qualquer momento, sendo as alterações 
                comunicadas através da plataforma ou por e-mail. O uso continuado após 
                as modificações implica aceitação dos novos termos.
              </p>
              <p className="mb-4">
                Para dúvidas, sugestões ou reclamações, entre em contato conosco:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>E-mail: contato@querodocumento.com.br</li>
                <li>WhatsApp: +55 11 9999-9999</li>
                <li>Horário de atendimento: Segunda a sexta, 9h às 18h</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                12. Aceitação dos Termos
              </h2>
              <p className="mb-4">
                Ao utilizar a plataforma QueroDocumento, o usuário declara ter lido, 
                compreendido e aceito integralmente estes Termos de Uso, bem como 
                nossa Política de Privacidade.
              </p>
              <p className="mb-4">
                Estes termos entram em vigor na data de sua publicação e permanecem 
                válidos por tempo indeterminado.
              </p>
            </section>
          </div>

        </div>
      </div>
    </main>
  )
}