/**
 * Welcome Email Template
 * Professional welcome email sent after user registration
 */

import { EmailTemplateData, EmailTemplate, TemplateEngine, createEmailTemplate, createTextTemplate } from './base'

export function getWelcomeTemplate(data: EmailTemplateData): EmailTemplate {
  const htmlContent = `
    <div class="content">
      <h1>🎉 Bem-vindo ao QueroDocumento!</h1>
      
      <p>Olá <strong>{{name|capitalize}}</strong>,</p>
      
      <p>É um prazer tê-lo(a) conosco! Sua conta foi criada com sucesso e agora você tem acesso completo à nossa plataforma de consulta e certificação de protestos.</p>
      
      <div class="alert alert-success">
        <div class="alert-title">✅ Conta Ativada com Sucesso</div>
        <div class="alert-text">
          Sua conta está pronta para uso. Você já pode fazer consultas e solicitar certidões.
        </div>
      </div>
      
      <h2>🚀 O que você pode fazer agora:</h2>
      
      <div class="info-box">
        <h3>Serviços Disponíveis</h3>
        <ul>
          <li><strong>📋 Consulta de Protesto:</strong> Verifique se há protestos em seu CPF/CNPJ de forma rápida e segura</li>
          <li><strong>📄 Certidão Negativa:</strong> Obtenha certidão comprovando ausência de protestos</li>
          <li><strong>📊 Certidão Positiva:</strong> Documento oficial listando todos os protestos encontrados</li>
          <li><strong>⚡ Resultados Expressos:</strong> Receba seus documentos em até 48 horas</li>
          <li><strong>💬 Suporte Especializado:</strong> Atendimento via WhatsApp com nossa equipe</li>
        </ul>
      </div>
      
      <div class="button-center">
        <a href="{{dashboardUrl}}" class="button">Acessar Minha Conta</a>
      </div>
      
      <h3>🔐 Sobre Segurança e Privacidade</h3>
      <p>Seus dados estão protegidos conforme a <strong>LGPD (Lei Geral de Proteção de Dados)</strong>. Utilizamos criptografia avançada e nunca compartilhamos informações pessoais com terceiros.</p>
      
      <div class="progress">
        <div class="progress-step completed">
          <div class="progress-circle">1</div>
          <div class="progress-label">Cadastro</div>
        </div>
        <div class="progress-step active">
          <div class="progress-circle">2</div>
          <div class="progress-label">Primeira Consulta</div>
        </div>
        <div class="progress-step">
          <div class="progress-circle">3</div>
          <div class="progress-label">Receber Resultado</div>
        </div>
      </div>
      
      <div class="alert alert-info">
        <div class="alert-title">💡 Dica Importante</div>
        <div class="alert-text">
          Para sua primeira consulta, recomendamos começar com a <strong>Consulta de Protesto</strong> - você conhecerá nossa agilidade!
        </div>
      </div>
            
      <hr class="divider">
      
      <div class="info-box">
        <h3>📊 Dados da sua Conta</h3>
        <table>
          <tr>
            <td class="label">Nome:</td>
            <td class="value">{{name|capitalize}}</td>
          </tr>
          {{#if email}}
          <tr>
            <td class="label">Email:</td>
            <td class="value">{{email}}</td>
          </tr>
          {{/if}}
          <tr>
            <td class="label">Data de Cadastro:</td>
            <td class="value">{{createdAt|date}}</td>
          </tr>
          <tr>
            <td class="label">Status da Conta:</td>
            <td class="value"><span class="status status-success">Ativa</span></td>
          </tr>
        </table>
      </div>
      
      <p><strong>Obrigado por escolher o QueroDocumento!</strong></p>
      <p>Estamos aqui para tornar sua experiência com documentos cartoriais mais simples, rápida e confiável.</p>
    </div>
  `

  const textContent = `
    Bem-vindo ao QueroDocumento!
    
    Olá {{name|capitalize}},
    
    É um prazer tê-lo(a) conosco! Sua conta foi criada com sucesso e agora você tem acesso completo à nossa plataforma.
    
    ✅ CONTA ATIVADA COM SUCESSO
    Sua conta está pronta para uso. Você já pode fazer consultas e solicitar certidões.
    
    🚀 O QUE VOCÊ PODE FAZER AGORA:
    
    Serviços Disponíveis:
    • Consulta de Protesto: Verifique se há protestos em seu CPF/CNPJ
    • Certidão de Protesto: Obtenha o Documento oficial com status de protestos  
    • Resultados Expressos: Receba documentos em até 48 horas
    • Suporte Especializado: Atendimento via WhatsApp
    
    Acesse sua conta: {{dashboardUrl}}
    
    🔐 SEGURANÇA E PRIVACIDADE
    Seus dados estão protegidos conforme a LGPD. Utilizamos criptografia avançada e nunca compartilhamos informações com terceiros.
    
    💡 DICA IMPORTANTE  
    Para sua primeira consulta, recomendamos começar com a Consulta de Protesto!
    
    📞 PRECISA DE AJUDA?
    • WhatsApp: Resposta em até 2 horas úteis
    • Email: contato@querodocumento.com.br
    • Chat Online: Disponível em sua conta
    
    DADOS DA SUA CONTA:
    • Nome: {{name|capitalize}}
    {{#if email}}• Email: {{email}}{{/if}}
    • Data de Cadastro: {{createdAt|date}}
    • Status: Ativa
    
    Obrigado por escolher o QueroDocumento!
    Estamos aqui para tornar sua experiência com documentos cartoriais mais simples e confiável.
  `

  const processedHtml = createEmailTemplate(
    TemplateEngine.process(htmlContent, {
      ...data,
      dashboardUrl: data.dashboardUrl || `${process.env.NEXTAUTH_URL}/dashboard`,
      createdAt: data.createdAt || new Date()
    }),
    'Bem-vindo ao QueroDocumento'
  )

  const processedText = createTextTemplate(
    TemplateEngine.process(textContent, {
      ...data,
      dashboardUrl: data.dashboardUrl || `${process.env.NEXTAUTH_URL}/dashboard`,
      createdAt: data.createdAt || new Date()
    }),
    'Bem-vindo ao QueroDocumento'
  )

  return {
    html: processedHtml,
    text: processedText,
    subject: '🎉 Bem-vindo ao QueroDocumento! Sua conta está ativa'
  }
}