/**
 * Order Confirmation Email Template
 * Professional confirmation email sent when an order is created
 */

import { EmailTemplateData, EmailTemplate, TemplateEngine, createEmailTemplate, createTextTemplate } from './base'

export function getOrderConfirmationTemplate(data: EmailTemplateData): EmailTemplate {
  const htmlContent = `
    <div class="content">
      <h1>📋 Pedido Confirmado</h1>
      
      <p>Olá <strong>{{name|capitalize}}</strong>,</p>
      
      <p>Recebemos seu pedido com sucesso! Nossa equipe já foi notificada e iniciará o processamento em breve.</p>
      
      <div class="alert alert-success">
        <div class="alert-title">✅ Pedido Registrado</div>
        <div class="alert-text">
          Seu pedido foi confirmado e está na fila de processamento. Você receberá atualizações por email.
        </div>
      </div>
      
      <div class="info-box">
        <h3>📋 Detalhes do Pedido</h3>
        <table>
          <tr>
            <td class="label">Número do Pedido:</td>
            <td class="value"><strong>{{orderNumber}}</strong></td>
          </tr>
          <tr>
            <td class="label">Tipo de Serviço:</td>
            <td class="value">{{serviceType}}</td>
          </tr>
          {{#if amount}}
          <tr>
            <td class="label">Valor:</td>
            <td class="value"><strong>{{amount|currency}}</strong></td>
          </tr>
          {{/if}}
          <tr>
            <td class="label">Data do Pedido:</td>
            <td class="value">{{createdAt|date}}</td>
          </tr>
          <tr>
            <td class="label">Status Atual:</td>
            <td class="value"><span class="status status-info">Aguardando Processamento</span></td>
          </tr>
        </table>
      </div>
      
      {{#if requiresPayment}}
      <div class="alert alert-warning">
        <div class="alert-title">💳 Pagamento Necessário</div>
        <div class="alert-text">
          Este pedido requer pagamento.
        </div>
      </div>
      {{/if}}
      {{#if isPIX}}
      <div class="alert alert-info">
        <div class="alert-text">
          ⏱️ O PIX deve ser pago em até 30 minutos para garantir o processamento.
        </div>
      </div>
      {{/if}}
      {{#if isCreditCard}}
      <div class="alert alert-success">
        <div class="alert-text">
          ✅ Seu cartão será cobrado automaticamente.
        </div>
      </div>
      {{/if}}
      
      <h2>⏰ Próximas Etapas</h2>
      
      <div class="progress">
        <div class="progress-step completed">
          <div class="progress-circle">✓</div>
          <div class="progress-label">Pedido Criado</div>
        </div>
        <div class="progress-step {{#if requiresPayment}}{{#else}}active{{/if}}">
          <div class="progress-circle">{{#if requiresPayment}}2{{#else}}✓{{/if}}</div>
          <div class="progress-label">{{#if requiresPayment}}Aguardando Pagamento{{#else}}Processando{{/if}}</div>
        </div>
        <div class="progress-step">
          <div class="progress-circle">3</div>
          <div class="progress-label">Processamento</div>
        </div>
        <div class="progress-step">
          <div class="progress-circle">4</div>
          <div class="progress-label">Concluído</div>
        </div>
      </div>
      
      <div class="info-box">
        <h3>🕒 Prazos de Entrega</h3>
        <ul>
          <li><strong>Consulta de Protesto:</strong> Resultado em até 2 horas úteis</li>
          <li><strong>Certidão de Protesto:</strong> Documento em até 48 horas úteis</li>
          <li><strong>Serviços Expressos:</strong> Consulte prazos especiais</li>
        </ul>
      </div>
      
      {{#if documents}}
      <div class="document-list">
        <h3>📄 Documentos Solicitados</h3>
        {{#each documents}}
        <div class="document-item">
          <div class="document-icon">{{@index}}</div>
          <div class="document-info">
            <h4>{{this.name}}</h4>
            <p>Tipo: {{this.type}}</p>
          </div>
        </div>
        {{/each}}
      </div>
      {{/if}}
      
      <div class="button-center">
        <a href="{{dashboardUrl}}/pedidos/{{orderNumber}}" class="button">Acompanhar Pedido</a>
        <a href="{{dashboardUrl}}" class="button button-secondary">Ir para Dashboard</a>
      </div>
      
      <div class="alert alert-info">
        <div class="alert-title">📱 Acompanhamento em Tempo Real</div>
        <div class="alert-text">
          Você pode acompanhar o status do seu pedido a qualquer momento em sua conta. Também enviaremos notificações por email a cada mudança de status.
        </div>
      </div>
      
      <h3>🔒 Segurança e Privacidade</h3>
      <p>Seus dados e documentos são tratados com máxima segurança:</p>
      <ul>
        <li>✅ Conexão criptografada (SSL)</li>
        <li>✅ Dados protegidos conforme LGPD</li>
        <li>✅ Acesso restrito apenas à nossa equipe autorizada</li>
        <li>✅ Documentos com validade jurídica</li>
      </ul>
      
      <hr class="divider">
      
      <p><strong>Precisa de ajuda?</strong></p>
      <p>Nossa equipe está disponível via WhatsApp para esclarecer dúvidas sobre seu pedido. Tenha sempre em mãos o número do pedido: <strong>{{orderNumber}}</strong></p>
      
      <p>Obrigado por confiar no QueroDocumento!</p>
    </div>
  `

  const textContent = `
    PEDIDO CONFIRMADO
    
    Olá {{name|capitalize}},
    
    Recebemos seu pedido com sucesso! Nossa equipe já foi notificada e iniciará o processamento em breve.
    
    ✅ PEDIDO REGISTRADO
    Seu pedido foi confirmado e está na fila de processamento.
    
    📋 DETALHES DO PEDIDO:
    • Número: {{orderNumber}}
    • Serviço: {{serviceType}}
    {{#if amount}}• Valor: {{amount|currency}}{{/if}}
    • Data: {{createdAt|date}}
    • Status: Aguardando Processamento
    
    {{#if requiresPayment}}
    💳 PAGAMENTO NECESSÁRIO
    Este pedido requer pagamento.
    {{/if}}
    {{#if isPIX}}
    ⏱️ O PIX deve ser pago em até 30 minutos para garantir o processamento.
    {{/if}}
    {{#if isCreditCard}}
    ✅ Seu cartão será cobrado automaticamente.
    {{/if}}
    
    ⏰ PRÓXIMAS ETAPAS:
    1. ✅ Pedido Criado
    2. {{#if requiresPayment}}⏳ Aguardando Pagamento{{#else}}⚡ Processando{{/if}}
    3. 🔄 Processamento
    4. ✅ Concluído
    
    🕒 PRAZOS DE ENTREGA:
    • Consulta de Protesto: até 2 horas úteis
    • Certidão de Protesto: até 48 horas úteis
    
    {{#if documents}}
    📄 DOCUMENTOS SOLICITADOS:
    {{#each documents}}
    {{@index}}. {{this.name}} ({{this.type}})
    {{/each}}
    {{/if}}
    
    Acompanhar pedido: {{dashboardUrl}}/pedidos/{{orderNumber}}
    Dashboard: {{dashboardUrl}}
    
    📱 ACOMPANHAMENTO EM TEMPO REAL
    Você pode acompanhar o status do seu pedido em sua conta. Enviaremos notificações por email a cada mudança.
    
    🔒 SEGURANÇA:
    ✅ Conexão criptografada (SSL)
    ✅ Dados protegidos conforme LGPD  
    ✅ Acesso restrito apenas à equipe autorizada
    ✅ Documentos com validade jurídica
    
    Precisa de ajuda?
    WhatsApp disponível - tenha em mãos o número: {{orderNumber}}
    
    Obrigado por confiar no QueroDocumento!
  `

  const processedHtml = createEmailTemplate(
    TemplateEngine.process(htmlContent, {
      ...data,
      dashboardUrl: data.dashboardUrl || `${process.env.NEXTAUTH_URL}/dashboard`,
      createdAt: data.createdAt || new Date()
    }),
    'Pedido Confirmado'
  )

  const processedText = createTextTemplate(
    TemplateEngine.process(textContent, {
      ...data,
      dashboardUrl: data.dashboardUrl || `${process.env.NEXTAUTH_URL}/dashboard`,
      createdAt: data.createdAt || new Date()
    }),
    'Pedido Confirmado'
  )

  return {
    html: processedHtml,
    text: processedText,
    subject: `Pedido confirmado #${data.orderNumber} - QueroDocumento`
  }
}