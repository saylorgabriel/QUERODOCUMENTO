import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade - QueroDocumento',
  description: 'Política de privacidade e proteção de dados da plataforma QueroDocumento',
}

export default function PoliticaDePrivacidade() {
  return (
    <main className="min-h-screen bg-neutral-50 py-12">
      <div className="container-padded max-w-4xl">
        <div className="card-elevated">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              Política de Privacidade
            </h1>
            <p className="text-lg text-neutral-600">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </header>

          <div className="prose prose-neutral max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                1. Introdução
              </h2>
              <p className="mb-4">
                A <strong>QueroDocumento</strong> está comprometida com a proteção da privacidade 
                e segurança dos dados pessoais de seus usuários. Esta Política de Privacidade 
                descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais, 
                em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
              <p className="mb-4">
                Ao utilizar nossa plataforma, você concorda com as práticas descritas nesta política.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                2. Informações que Coletamos
              </h2>
              
              <h3 className="text-xl font-semibold text-neutral-800 mb-3">
                2.1 Dados Pessoais Fornecidos
              </h3>
              <p className="mb-4">
                Coletamos informações pessoais apenas quando necessário para a prestação de nossos serviços:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Dados de identificação:</strong> nome completo, CPF/CNPJ</li>
                <li><strong>Dados de contato:</strong> endereço de e-mail, telefone</li>
                <li><strong>Dados de consulta:</strong> documentos consultados, resultados obtidos</li>
                <li><strong>Dados de pagamento:</strong> informações de transação (não armazenamos dados de cartão)</li>
              </ul>

              <h3 className="text-xl font-semibold text-neutral-800 mb-3">
                2.2 Dados Coletados Automaticamente
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Endereço IP e localização aproximada</li>
                <li>Informações do navegador e sistema operacional</li>
                <li>Páginas visitadas e tempo de navegação</li>
                <li>Cookies e tecnologias similares</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                3. Como Utilizamos suas Informações
              </h2>
              <p className="mb-4">
                Utilizamos seus dados pessoais para:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Prestação de serviços:</strong> processar consultas e emitir certidões</li>
                <li><strong>Comunicação:</strong> enviar atualizações sobre pedidos e suporte</li>
                <li><strong>Pagamentos:</strong> processar transações de forma segura</li>
                <li><strong>Melhoria dos serviços:</strong> analisar uso e otimizar a plataforma</li>
                <li><strong>Cumprimento legal:</strong> atender obrigações regulatórias</li>
                <li><strong>Marketing:</strong> enviar ofertas relevantes (mediante consentimento)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                4. Base Legal para o Tratamento
              </h2>
              <p className="mb-4">
                Tratamos seus dados pessoais com base nas seguintes hipóteses legais:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Consentimento:</strong> para comunicações de marketing</li>
                <li><strong>Execução de contrato:</strong> para prestação dos serviços solicitados</li>
                <li><strong>Interesse legítimo:</strong> para melhoria dos serviços e segurança</li>
                <li><strong>Cumprimento de obrigação legal:</strong> para atender exigências regulatórias</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                5. Compartilhamento de Dados
              </h2>
              <p className="mb-4">
                Seus dados pessoais podem ser compartilhados com:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Cartórios credenciados:</strong> para emissão de certidões</li>
                <li><strong>Processadores de pagamento:</strong> para transações financeiras</li>
                <li><strong>Provedores de serviços:</strong> hosting, e-mail, analytics (com contratos de confidencialidade)</li>
                <li><strong>Autoridades competentes:</strong> quando exigido por lei</li>
              </ul>
              <p className="mb-4">
                <strong>Nunca vendemos ou alugamos seus dados pessoais para terceiros.</strong>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                6. Segurança dos Dados
              </h2>
              <p className="mb-4">
                Implementamos medidas técnicas e organizacionais para proteger seus dados:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Criptografia:</strong> dados transmitidos e armazenados com criptografia</li>
                <li><strong>Controle de acesso:</strong> acesso restrito por função e necessidade</li>
                <li><strong>Monitoramento:</strong> logs de segurança e detecção de anomalias</li>
                <li><strong>Backups seguros:</strong> cópias de segurança criptografadas</li>
                <li><strong>Atualizações:</strong> sistemas sempre atualizados com patches de segurança</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                7. Retenção de Dados
              </h2>
              <p className="mb-4">
                Mantemos seus dados pessoais apenas pelo tempo necessário:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Dados de conta:</strong> enquanto a conta estiver ativa</li>
                <li><strong>Dados de consulta:</strong> por até 5 anos para fins históricos</li>
                <li><strong>Dados de pagamento:</strong> conforme exigências fiscais e contábeis</li>
                <li><strong>Dados de marketing:</strong> até a retirada do consentimento</li>
                <li><strong>Logs de segurança:</strong> por até 6 meses</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                8. Cookies e Tecnologias Similares
              </h2>
              <p className="mb-4">
                Utilizamos cookies para melhorar sua experiência:
              </p>

              <h3 className="text-xl font-semibold text-neutral-800 mb-3">
                8.1 Tipos de Cookies
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Cookies essenciais:</strong> necessários para o funcionamento básico</li>
                <li><strong>Cookies de desempenho:</strong> para análise de uso (Google Analytics)</li>
                <li><strong>Cookies de funcionalidade:</strong> para personalizar sua experiência</li>
                <li><strong>Cookies de marketing:</strong> para exibir conteúdo relevante</li>
              </ul>

              <h3 className="text-xl font-semibold text-neutral-800 mb-3">
                8.2 Controle de Cookies
              </h3>
              <p className="mb-4">
                Você pode controlar cookies através das configurações do seu navegador. 
                Note que desabilitar cookies pode afetar a funcionalidade da plataforma.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                9. Seus Direitos (LGPD)
              </h2>
              <p className="mb-4">
                Conforme a LGPD, você tem os seguintes direitos:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Confirmação:</strong> saber se tratamos seus dados</li>
                <li><strong>Acesso:</strong> consultar dados tratados sobre você</li>
                <li><strong>Correção:</strong> solicitar correção de dados incompletos ou inexatos</li>
                <li><strong>Anonimização/Bloqueio:</strong> quando desnecessários ou excessivos</li>
                <li><strong>Eliminação:</strong> quando desnecessários, excessivos ou tratados ilicitamente</li>
                <li><strong>Portabilidade:</strong> transferir dados para outro provedor</li>
                <li><strong>Informação:</strong> sobre compartilhamento com terceiros</li>
                <li><strong>Revogação do consentimento:</strong> retirar autorização a qualquer momento</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                10. Como Exercer seus Direitos
              </h2>
              <p className="mb-4">
                Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>E-mail:</strong> privacidade@querodocumento.com.br</li>
                <li><strong>WhatsApp:</strong> +55 19 98180-6261</li>
                <li><strong>Portal:</strong> seção "Meus Dados" no dashboard</li>
              </ul>
              <p className="mb-4">
                Responderemos sua solicitação em até <strong>15 dias úteis</strong>, 
                podendo ser prorrogado por mais 15 dias se necessário.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                11. Transferência Internacional
              </h2>
              <p className="mb-4">
                Alguns de nossos prestadores de serviços podem estar localizados fora do Brasil. 
                Quando isso ocorrer, garantimos que:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>O país de destino oferece grau adequado de proteção de dados</li>
                <li>Aplicamos salvaguardas contratuais apropriadas</li>
                <li>Obtemos seu consentimento específico quando necessário</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                12. Menores de Idade
              </h2>
              <p className="mb-4">
                Nossos serviços não são direcionados a menores de 18 anos. 
                Não coletamos intencionalmente dados de menores. Se você é responsável 
                por uma criança e acredita que ela forneceu dados pessoais, entre em contato conosco.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                13. Alterações nesta Política
              </h2>
              <p className="mb-4">
                Esta Política de Privacidade pode ser atualizada periodicamente. 
                Alterações significativas serão comunicadas por:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Notificação por e-mail</li>
                <li>Aviso na plataforma</li>
                <li>Atualização da data de "última modificação"</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                14. Encarregado de Proteção de Dados (DPO)
              </h2>
              <p className="mb-4">
                Nosso Encarregado de Proteção de Dados está disponível para esclarecer 
                questões sobre o tratamento de dados pessoais:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>E-mail:</strong> dpo@querodocumento.com.br</li>
                <li><strong>Telefone:</strong> +55 19 98180-6261</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                15. Autoridade Nacional de Proteção de Dados (ANPD)
              </h2>
              <p className="mb-4">
                Caso não fique satisfeito com nossas respostas, você pode contatar a ANPD:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Site:</strong> www.gov.br/anpd</li>
                <li><strong>Ouvidoria:</strong> através do site oficial</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
                16. Contato
              </h2>
              <p className="mb-4">
                Para dúvidas sobre esta Política de Privacidade ou questões relacionadas 
                ao tratamento de dados:
              </p>
              <div className="bg-primary-50 p-6 rounded-lg mb-4">
                <p className="mb-2"><strong>QueroDocumento</strong></p>
                <p className="mb-2">📧 E-mail: contato@querodocumento.com.br</p>
                <p className="mb-2">📱 WhatsApp: +55 19 98180-6261</p>
                <p className="mb-2">🕐 Atendimento: Segunda a sexta, 9h às 17h</p>
                <p>📊 Dados: privacidade@querodocumento.com.br</p>
              </div>
            </section>
          </div>

          <footer className="mt-12 pt-8 border-t border-neutral-200">
            <p className="text-sm text-neutral-500 text-center">
              Esta Política de Privacidade está em conformidade com a LGPD (Lei nº 13.709/2018)
            </p>
          </footer>
        </div>
      </div>
    </main>
  )
}