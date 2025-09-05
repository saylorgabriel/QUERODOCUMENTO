/**
 * Status Update Email Template
 * Generic template for order status changes and system notifications
 */

import { EmailTemplateData, EmailTemplate, TemplateEngine, createEmailTemplate, createTextTemplate } from './base'

export function getStatusUpdateTemplate(data: EmailTemplateData): EmailTemplate {
  const htmlContent = `
    <div class="content">
      <h1>{{#if orderStatus}}📊 Status do Pedido Atualizado{{#else}}📢 Atualização Importante{{/if}}</h1>
      
      <p>Olá <strong>{{name|capitalize}}</strong>,</p>
      
      <p>Temos uma atualização sobre {{#if orderNumber}}seu pedido #{{orderNumber}}{{#else}}sua conta{{/if}}. Confira as informações abaixo:</p>
      
      {{#if orderStatus}}
      <div class="info-box">
        <h3>📋 Atualização do Pedido</h3>
        <table>
          <tr>
            <td class="label">Número do Pedido:</td>
            <td class="value"><strong>{{orderNumber}}</strong></td>
          </tr>
          <tr>
            <td class="label">Serviço:</td>
            <td class="value">{{serviceType}}</td>
          </tr>
          <tr>
            <td class="label">Status Anterior:</td>
            <td class="value">{{previousStatus}}</td>
          </tr>
          <tr>
            <td class="label">Status Atual:</td>
            <td class="value">
              <span class="status {{#if orderStatus}}
                {{#eq orderStatus 'pending'}}status-warning{{/eq}}
                {{#eq orderStatus 'processing'}}status-info{{/eq}}
                {{#eq orderStatus 'completed'}}status-success{{/eq}}
                {{#eq orderStatus 'cancelled'}}status-error{{/eq}}
                {{#eq orderStatus 'failed'}}status-error{{/eq}}
              {{/if}}">
                {{orderStatus|capitalize}}
              </span>
            </td>
          </tr>
          <tr>
            <td class="label">Atualizado em:</td>
            <td class="value">{{createdAt|date}} às {{createdAt|time}}</td>
          </tr>
        </table>
      </div>
      {{/if}}
      
      {{#eq orderStatus 'processing'}}
      <div class="alert alert-info">
        <div class="alert-title">⚡ Processamento Iniciado</div>
        <div class="alert-text">
          Nossa equipe iniciou o processamento do seu pedido. Estamos consultando as bases de dados oficiais para coletar todas as informações necessárias.
        </div>
      </div>
      {{/eq}}
      
      {{#eq orderStatus 'completed'}}
      <div class="alert alert-success">
        <div class="alert-title">🎉 Pedido Concluído</div>
        <div class="alert-text">
          Excelente! Seu pedido foi processado com sucesso. O documento está disponível para download em sua conta.
        </div>
      </div>
      {{/eq}}
      
      {{#eq orderStatus 'cancelled'}}
      <div class="alert alert-warning">
        <div class="alert-title">❌ Pedido Cancelado</div>
        <div class="alert-text">
          Seu pedido foi cancelado. Se você não solicitou o cancelamento ou tem dúvidas, entre em contato conosco.
        </div>
      </div>
      {{/eq}}
      
      {{#eq orderStatus 'failed'}}
      <div class="alert alert-error">
        <div class="alert-title">⚠️ Problema no Processamento</div>
        <div class="alert-text">
          Encontramos um problema durante o processamento do seu pedido. Nossa equipe está analisando a situação e entrará em contato em breve.
        </div>
      </div>
      {{/eq}}
      
      {{#eq orderStatus 'pending'}}
      <div class="alert alert-warning">
        <div class="alert-title">⏳ Aguardando Ação</div>
        <div class="alert-text">
          Seu pedido está aguardando uma ação. Verifique se há pendências de pagamento ou documentação adicional necessária.
        </div>
      </div>
      {{/eq}}
      
      {{#if message}}
      <div class="info-box">
        <h3>💬 Mensagem da Equipe</h3>
        <p style="margin: 0; font-style: italic; color: #4b5563;">
          "{{message}}"
        </p>
      </div>
      {{/if}}
      
      {{#if orderNumber}}
      <div class="progress">
        <div class="progress-step {{#if orderCreated}}completed{{/if}}">
          <div class="progress-circle">{{#if orderCreated}}✓{{#else}}1{{/if}}</div>
          <div class="progress-label">Pedido</div>
        </div>
        <div class="progress-step {{#if paymentConfirmed}}completed{{#else}}{{#eq orderStatus 'processing'}}active{{/eq}}{{/if}}">
          <div class="progress-circle">{{#if paymentConfirmed}}✓{{#else}}2{{/if}}</div>
          <div class="progress-label">Pagamento</div>
        </div>
        <div class="progress-step {{#eq orderStatus 'processing'}}active{{/eq}} {{#eq orderStatus 'completed'}}completed{{/eq}}">
          <div class="progress-circle">{{#eq orderStatus 'completed'}}✓{{#else}}{{#eq orderStatus 'processing'}}⚡{{#else}}3{{/eq}}{{/eq}}</div>
          <div class="progress-label">Processamento</div>
        </div>
        <div class="progress-step {{#eq orderStatus 'completed'}}completed{{/eq}}">
          <div class="progress-circle">{{#eq orderStatus 'completed'}}🎉{{#else}}4{{/eq}}</div>
          <div class="progress-label">Concluído</div>
        </div>
      </div>
      {{/if}}
      
      {{#if nextSteps}}
      <div class="info-box">
        <h3>🚀 Próximas Etapas</h3>
        <ul>
          {{#each nextSteps}}
          <li>{{this}}</li>
          {{/each}}
        </ul>
      </div>
      {{/if}}
      
      {{#if documents}}
      <div class="document-list">
        <h3>📁 Documentos Relacionados</h3>
        {{#each documents}}
        <div class="document-item">
          <div class="document-icon">📄</div>
          <div class="document-info">
            <h4>{{this.name}}</h4>
            <p>{{this.type}} • Status: {{this.status}}</p>
            {{#if this.url}}
            <a href="{{this.url}}" style="color: #3b82f6; text-decoration: none; font-size: 12px;">⬇️ Download</a>
            {{/if}}
          </div>
        </div>
        {{/each}}
      </div>
      {{/if}}
      
      {{#if estimatedTime}}
      <div class="alert alert-info">
        <div class="alert-title">⏰ Tempo Estimado</div>
        <div class="alert-text">
          {{#eq orderStatus 'processing'}}
          Previsão para conclusão: <strong>{{estimatedTime}}</strong>
          {{#else}}
          {{#eq orderStatus 'pending'}}
          Aguardando ação: <strong>{{estimatedTime}}</strong>
          {{/eq}}
          {{/eq}}
        </div>
      </div>
      {{/if}}
      
      <div class="button-center">
        {{#if orderNumber}}
        <a href="{{dashboardUrl}}/pedidos/{{orderNumber}}" class="button">Ver Detalhes do Pedido</a>
        {{/if}}
        <a href="{{dashboardUrl}}" class="button button-secondary">Ir para Dashboard</a>
        {{#if downloadUrl}}
        <a href="{{downloadUrl}}" class="button">📥 Baixar Documento</a>
        {{/if}}
      </div>
      
      {{#if requiresAction}}
      <div class="alert alert-warning">
        <div class="alert-title">👆 Ação Necessária</div>
        <div class="alert-text">
          {{actionRequired}}
          {{#if actionUrl}}
          <br><br>
          <a href="{{actionUrl}}" style="color: #dc2626; font-weight: 600;">🔗 Clique aqui para tomar a ação necessária</a>
          {{/if}}
        </div>
      </div>
      {{/if}}
      
      <hr class="divider">
      
      <h3>📞 Precisa de Esclarecimentos?</h3>
      <p>Nossa equipe está sempre disponível para ajudá-lo:</p>
      
      <div style="display: flex; gap: 16px; margin: 16px 0; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px; background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; margin-bottom: 8px;">💬</div>
          <h4 style="margin: 0 0 8px 0; color: #374151;">WhatsApp</h4>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            {{#if orderNumber}}Informe o número: {{orderNumber}}{{#else}}Suporte geral disponível{{/if}}
          </p>
        </div>
        <div style="flex: 1; min-width: 200px; background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; margin-bottom: 8px;">💻</div>
          <h4 style="margin: 0 0 8px 0; color: #374151;">Chat Online</h4>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            Disponível em sua conta<br>no site
          </p>
        </div>
        <div style="flex: 1; min-width: 200px; background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; margin-bottom: 8px;">📧</div>
          <h4 style="margin: 0 0 8px 0; color: #374151;">Email</h4>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            Resposta em até<br>2 horas úteis
          </p>
        </div>
      </div>
      
      {{#if additionalInfo}}
      <div class="info-box">
        <h3>ℹ️ Informações Adicionais</h3>
        <p style="margin: 0;">{{additionalInfo}}</p>
      </div>
      {{/if}}
      
      <p><strong>Obrigado por escolher o QueroDocumento!</strong></p>
      <p>Continuamos trabalhando para oferecer o melhor serviço em consulta e certificação de protestos.</p>
    </div>
  `

  const textContent = `
    {{#if orderStatus}}STATUS DO PEDIDO ATUALIZADO{{#else}}ATUALIZAÇÃO IMPORTANTE{{/if}}
    
    Olá {{name|capitalize}},
    
    Temos uma atualização sobre {{#if orderNumber}}seu pedido #{{orderNumber}}{{#else}}sua conta{{/if}}.
    
    {{#if orderStatus}}
    📋 ATUALIZAÇÃO DO PEDIDO:
    • Pedido: {{orderNumber}}
    • Serviço: {{serviceType}}
    • Status Anterior: {{previousStatus}}
    • Status Atual: {{orderStatus|capitalize}}
    • Atualizado: {{createdAt|date}} às {{createdAt|time}}
    {{/if}}
    
    {{#eq orderStatus 'processing'}}
    ⚡ PROCESSAMENTO INICIADO
    Nossa equipe iniciou o processamento. Consultando bases de dados oficiais.
    {{/eq}}
    
    {{#eq orderStatus 'completed'}}
    🎉 PEDIDO CONCLUÍDO
    Excelente! Documento disponível para download em sua conta.
    {{/eq}}
    
    {{#eq orderStatus 'cancelled'}}
    ❌ PEDIDO CANCELADO
    Pedido cancelado. Dúvidas? Entre em contato conosco.
    {{/eq}}
    
    {{#eq orderStatus 'failed'}}
    ⚠️ PROBLEMA NO PROCESSAMENTO
    Problema encontrado. Nossa equipe está analisando e entrará em contato.
    {{/eq}}
    
    {{#eq orderStatus 'pending'}}
    ⏳ AGUARDANDO AÇÃO
    Verifique pendências de pagamento ou documentação adicional.
    {{/eq}}
    
    {{#if message}}
    💬 MENSAGEM DA EQUIPE:
    "{{message}}"
    {{/if}}
    
    {{#if orderNumber}}
    PROGRESSO:
    1. {{#if orderCreated}}✅{{#else}}⏳{{/if}} Pedido
    2. {{#if paymentConfirmed}}✅{{#else}}{{#eq orderStatus 'processing'}}⚡{{#else}}⏳{{/eq}}{{/if}} Pagamento
    3. {{#eq orderStatus 'processing'}}⚡{{/eq}}{{#eq orderStatus 'completed'}}✅{{/eq}}{{#if orderStatus}}{{#else}}⏳{{/if}} Processamento
    4. {{#eq orderStatus 'completed'}}🎉{{#else}}⏳{{/eq}} Concluído
    {{/if}}
    
    {{#if nextSteps}}
    🚀 PRÓXIMAS ETAPAS:
    {{#each nextSteps}}
    • {{this}}
    {{/each}}
    {{/if}}
    
    {{#if documents}}
    📁 DOCUMENTOS RELACIONADOS:
    {{#each documents}}
    • {{this.name}} ({{this.type}}) - Status: {{this.status}}
    {{#if this.url}}  Download: {{this.url}}{{/if}}
    {{/each}}
    {{/if}}
    
    {{#if estimatedTime}}
    ⏰ TEMPO ESTIMADO:
    {{#eq orderStatus 'processing'}}Previsão para conclusão: {{estimatedTime}}{{/eq}}
    {{#eq orderStatus 'pending'}}Aguardando ação: {{estimatedTime}}{{/eq}}
    {{/if}}
    
    {{#if orderNumber}}Ver pedido: {{dashboardUrl}}/pedidos/{{orderNumber}}{{/if}}
    Dashboard: {{dashboardUrl}}
    {{#if downloadUrl}}Baixar: {{downloadUrl}}{{/if}}
    
    {{#if requiresAction}}
    👆 AÇÃO NECESSÁRIA:
    {{actionRequired}}
    {{#if actionUrl}}
    Link: {{actionUrl}}{{/if}}
    {{/if}}
    
    📞 PRECISA DE ESCLARECIMENTOS?
    💬 WhatsApp: {{#if orderNumber}}Informe número {{orderNumber}}{{#else}}Suporte geral{{/if}}
    💻 Chat Online: Disponível em sua conta
    📧 Email: Resposta em 2h úteis
    
    {{#if additionalInfo}}
    ℹ️ INFORMAÇÕES ADICIONAIS:
    {{additionalInfo}}
    {{/if}}
    
    Obrigado por escolher o QueroDocumento!
    Continuamos trabalhando para oferecer o melhor serviço.
  `

  // Determine header color based on status
  let headerColor = '#3b82f6' // Default blue
  if (data.orderStatus) {
    switch (data.orderStatus) {
      case 'completed':
        headerColor = '#10b981' // Green
        break
      case 'processing':
        headerColor = '#f97316' // Orange
        break
      case 'failed':
      case 'cancelled':
        headerColor = '#dc2626' // Red
        break
      case 'pending':
        headerColor = '#f59e0b' // Yellow
        break
    }
  }

  const processedHtml = createEmailTemplate(
    TemplateEngine.process(htmlContent, {
      ...data,
      dashboardUrl: data.dashboardUrl || `${process.env.NEXTAUTH_URL}/dashboard`,
      createdAt: data.createdAt || new Date()
    }),
    'Atualização de Status',
    headerColor
  )

  const processedText = createTextTemplate(
    TemplateEngine.process(textContent, {
      ...data,
      dashboardUrl: data.dashboardUrl || `${process.env.NEXTAUTH_URL}/dashboard`,
      createdAt: data.createdAt || new Date()
    }),
    'Atualização de Status'
  )

  // Dynamic subject based on status
  let subject = '📊 Atualização de status'
  if (data.orderNumber) {
    subject += ` - Pedido #${data.orderNumber}`
  }
  if (data.orderStatus) {
    const statusEmojis = {
      'processing': '⚡',
      'completed': '🎉',
      'cancelled': '❌',
      'failed': '⚠️',
      'pending': '⏳'
    }
    const emoji = statusEmojis[data.orderStatus as keyof typeof statusEmojis] || '📊'
    subject = `${emoji} ${data.orderStatus === 'completed' ? 'Pedido concluído' : 
                         data.orderStatus === 'processing' ? 'Processamento iniciado' :
                         data.orderStatus === 'cancelled' ? 'Pedido cancelado' :
                         data.orderStatus === 'failed' ? 'Problema no pedido' :
                         'Status atualizado'}`
    if (data.orderNumber) {
      subject += ` #${data.orderNumber}`
    }
  }

  return {
    html: processedHtml,
    text: processedText,
    subject
  }
}