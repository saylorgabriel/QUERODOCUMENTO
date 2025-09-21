/**
 * Quote Ready Email Template
 * Professional email sent when a certificate quote is ready for approval
 */

import { EmailTemplateData, EmailTemplate, TemplateEngine, createEmailTemplate, createTextTemplate } from './base'

export function getQuoteReadyTemplate(data: EmailTemplateData): EmailTemplate {
  const htmlContent = `
    <div class="content">
      <h1>💰 Orçamento Pronto para Aprovação</h1>
      
      <p>Olá <strong>{{name|capitalize}}</strong>,</p>
      
      <p>Sua consulta foi processada com sucesso! Com base nos resultados encontrados, preparamos um orçamento personalizado para a emissão da sua certidão oficial.</p>
      
      <div class="alert alert-success">
        <div class="alert-title">📊 Consulta Finalizada</div>
        <div class="alert-text">
          Análise completa realizada. Orçamento baseado nos dados oficiais dos cartórios.
        </div>
      </div>
      
      <div class="info-box">
        <h3>📋 Dados do Orçamento</h3>
        <table>
          <tr>
            <td class="label">Número da Consulta:</td>
            <td class="value"><strong>{{orderNumber}}</strong></td>
          </tr>
          <tr>
            <td class="label">Tipo de Certidão:</td>
            <td class="value">{{serviceType}}</td>
          </tr>
          <tr>
            <td class="label">Valor Total:</td>
            <td class="value"><strong style="font-size: 18px; color: #059669;">{{amount|currency}}</strong></td>
          </tr>
          <tr>
            <td class="label">Validade do Orçamento:</td>
            <td class="value">{{expiresAt|date}} (7 dias)</td>
          </tr>
          <tr>
            <td class="label">Prazo de Entrega:</td>
            <td class="value"><strong>24 horas úteis</strong> após aprovação</td>
          </tr>
        </table>
      </div>
      
      {{#if hasProtests}}
      <div class="alert alert-warning">
        <div class="alert-title">⚠️ Protestos Encontrados</div>
        <div class="alert-text">
          Foram identificados protestos registrados. A certidão será <strong>POSITIVA</strong> com todos os detalhes dos registros encontrados.
        </div>
      </div>
      
      {{#if protests}}
      <div class="document-list">
        <h3>📊 Resumo dos Protestos Encontrados</h3>
        {{#each protests}}
        <div class="document-item">
          <div class="document-icon">⚖️</div>
          <div class="document-info">
            <h4>{{this.creditor}}</h4>
            <p><strong>{{this.value|currency}}</strong> • {{this.date|date}} • {{this.notary}}</p>
          </div>
        </div>
        {{/each}}
        <div style="background: #fef3c7; padding: 12px; border-radius: 6px; margin-top: 12px;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            <strong>Total de registros:</strong> {{protests.length}} protesto(s) encontrado(s)
          </p>
        </div>
      </div>
      {{/if}}
      
      {{#else}}
      <div class="alert alert-success">
        <div class="alert-title">✅ Nenhum Protesto Encontrado</div>
        <div class="alert-text">
          Excelente! Não foram encontrados protestos em seu nome. A certidão será <strong>NEGATIVA</strong> comprovando sua situação regular.
        </div>
      </div>
      {{/if}}
      
      <div class="info-box">
        <h3>📄 O que está incluso na Certidão</h3>
        <ul>
          <li>✅ <strong>Documento com validade jurídica</strong> - Aceito em órgãos públicos e privados</li>
          <li>✅ <strong>Busca nacional completa</strong> - Consulta em todos os cartórios do Brasil</li>
          <li>✅ <strong>Dados atualizados</strong> - Informações coletadas em tempo real</li>
          <li>✅ <strong>Assinatura digital certificada</strong> - Documento autenticado e verificável</li>
          <li>✅ <strong>QR Code de verificação</strong> - Para confirmar autenticidade online</li>
          <li>✅ <strong>Suporte especializado</strong> - Esclarecimento de dúvidas sobre o documento</li>
        </ul>
      </div>
      
      <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 24px; border-radius: 12px; text-align: center; margin: 32px 0;">
        <h3 style="color: white; margin: 0 0 16px 0;">💳 Aprove seu Orçamento</h3>
        <p style="color: rgba(255,255,255,0.9); margin: 0 0 20px 0;">
          Valor: <span style="font-size: 24px; font-weight: bold; color: white;">{{amount|currency}}</span>
        </p>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <a href="{{dashboardUrl}}/pedidos/{{orderNumber}}/aprovar?method=pix" class="button" style="background: rgba(255,255,255,0.2); border: 2px solid white;">
            🏦 Pagar com PIX
          </a>
          <a href="{{dashboardUrl}}/pedidos/{{orderNumber}}/aprovar?method=card" class="button" style="background: rgba(255,255,255,0.2); border: 2px solid white;">
            💳 Cartão de Crédito
          </a>
        </div>
      </div>
      
      <h3>⚡ Formas de Pagamento</h3>
      <div style="display: flex; gap: 16px; margin: 16px 0;">
        <div style="flex: 1; background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; margin-bottom: 8px;">🏦</div>
          <h4 style="margin: 0 0 8px 0; color: #374151;">PIX</h4>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            Pagamento instantâneo<br>
            <strong>Desconto de 5%</strong>
          </p>
        </div>
        <div style="flex: 1; background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; margin-bottom: 8px;">💳</div>
          <h4 style="margin: 0 0 8px 0; color: #374151;">Cartão</h4>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            Débito ou Crédito<br>
            <strong>Até 12x sem juros</strong>
          </p>
        </div>
      </div>
      
      <div class="progress">
        <div class="progress-step completed">
          <div class="progress-circle">✓</div>
          <div class="progress-label">Consulta</div>
        </div>
        <div class="progress-step completed">
          <div class="progress-circle">✓</div>
          <div class="progress-label">Análise</div>
        </div>
        <div class="progress-step active">
          <div class="progress-circle">💰</div>
          <div class="progress-label">Orçamento</div>
        </div>
        <div class="progress-step">
          <div class="progress-circle">4</div>
          <div class="progress-label">Certidão</div>
        </div>
      </div>
      
      <div class="alert alert-info">
        <div class="alert-title">⏰ Importante sobre o Prazo</div>
        <div class="alert-text">
          • Este orçamento é válido por <strong>7 dias</strong><br>
          • Após a aprovação, sua certidão ficará pronta em <strong>24 horas úteis</strong><br>
          • Para consultas urgentes, temos opções de prazo reduzido
        </div>
      </div>
      
      <div class="button-center">
        <a href="{{dashboardUrl}}/pedidos/{{orderNumber}}" class="button">Ver Orçamento Completo</a>
        <a href="{{dashboardUrl}}" class="button button-secondary">Ir para Dashboard</a>
      </div>
      
      <hr class="divider">
      
      <h3>🤔 Tem Dúvidas sobre o Orçamento?</h3>
      <p>Nossa equipe está disponível para esclarecer qualquer questão:</p>
      <ul>
        <li><strong>WhatsApp:</strong> Atendimento especializado - mencione o número {{orderNumber}}</li>
        <li><strong>Chat Online:</strong> Disponível em sua conta no site</li>
        <li><strong>Email:</strong> Resposta em até 2 horas úteis</li>
      </ul>
      
      <div class="info-box">
        <h3>🔒 Garantias QueroDocumento</h3>
        <ul style="margin: 0;">
          <li>✅ <strong>100% Seguro:</strong> Transações protegidas com criptografia</li>
          <li>✅ <strong>Satisfação Garantida:</strong> Reembolso se não ficar satisfeito</li>
          <li>✅ <strong>Prazo Cumprido:</strong> Entrega conforme prometido</li>
          <li>✅ <strong>Suporte Completo:</strong> Ajuda durante todo o processo</li>
        </ul>
      </div>
      
      <p><strong>Pronto para prosseguir?</strong></p>
      <p>Aprove seu orçamento agora e receba sua certidão oficial em até 24 horas úteis. Nosso processo é rápido, seguro e completamente confiável.</p>
    </div>
  `

  const textContent = `
    ORÇAMENTO PRONTO PARA APROVAÇÃO
    
    Olá {{name|capitalize}},
    
    Sua consulta foi processada! Preparamos um orçamento personalizado para sua certidão oficial.
    
    📊 CONSULTA FINALIZADA
    Análise completa realizada. Orçamento baseado em dados oficiais.
    
    📋 DADOS DO ORÇAMENTO:
    • Consulta: {{orderNumber}}
    • Certidão: {{serviceType}}
    • Valor Total: {{amount|currency}}
    • Validade: {{expiresAt|date}} (7 dias)
    • Prazo: 24 horas úteis após aprovação
    
    {{#if hasProtests}}
    ⚠️ PROTESTOS ENCONTRADOS
    Registros identificados. Certidão será POSITIVA com todos os detalhes.
    
    {{#if protests}}
    📊 RESUMO DOS PROTESTOS:
    {{#each protests}}
    • {{this.creditor}}: {{this.value|currency}} ({{this.date|date}})
    {{/each}}
    Total: {{protests.length}} protesto(s) encontrado(s)
    {{/if}}
    
    {{#else}}
    ✅ NENHUM PROTESTO ENCONTRADO
    Excelente! Certidão será NEGATIVA comprovando situação regular.
    {{/if}}
    
    📄 INCLUSO NA CERTIDÃO:
    ✅ Documento com validade jurídica
    ✅ Busca nacional completa
    ✅ Dados atualizados em tempo real
    ✅ Assinatura digital certificada
    ✅ QR Code de verificação
    ✅ Suporte especializado
    
    💳 APROVAR ORÇAMENTO - {{amount|currency}}:
    
    🏦 PIX (Desconto 5%): {{dashboardUrl}}/pedidos/{{orderNumber}}/aprovar?method=pix
    💳 Cartão (12x sem juros): {{dashboardUrl}}/pedidos/{{orderNumber}}/aprovar?method=card
    
    ⚡ FORMAS DE PAGAMENTO:
    • PIX: Pagamento instantâneo + desconto 5%
    • Cartão: Débito/Crédito até 12x sem juros
    
    PROGRESSO:
    1. ✅ Consulta
    2. ✅ Análise  
    3. 💰 Orçamento (ATUAL)
    4. 📄 Certidão
    
    ⏰ IMPORTANTE:
    • Orçamento válido por 7 dias
    • Certidão pronta em 24 horas úteis após aprovação
    • Opções de prazo reduzido disponíveis
    
    Ver orçamento: {{dashboardUrl}}/pedidos/{{orderNumber}}
    Dashboard: {{dashboardUrl}}
    
    🤔 DÚVIDAS?
    • WhatsApp: Mencione número {{orderNumber}}
    • Chat Online: Disponível em sua conta
    • Email: Resposta em 2h úteis
    
    🔒 GARANTIAS:
    ✅ 100% Seguro - Transações protegidas
    ✅ Satisfação Garantida - Reembolso disponível
    ✅ Prazo Cumprido - Entrega conforme prometido
    ✅ Suporte Completo - Ajuda durante processo
    
    Pronto para prosseguir?
    Aprove seu orçamento e receba sua certidão oficial em 24 horas úteis.
  `

  const processedHtml = createEmailTemplate(
    TemplateEngine.process(htmlContent, {
      ...data,
      dashboardUrl: data.dashboardUrl || `${process.env.NEXTAUTH_URL}/dashboard`,
      expiresAt: data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    }),
    'Orçamento Disponível',
    '#f97316' // Orange header for quotes
  )

  const processedText = createTextTemplate(
    TemplateEngine.process(textContent, {
      ...data,
      dashboardUrl: data.dashboardUrl || `${process.env.NEXTAUTH_URL}/dashboard`,
      expiresAt: data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    }),
    'Orçamento Disponível'
  )

  return {
    html: processedHtml,
    text: processedText,
    subject: `💰 Orçamento pronto - ${data.amount} - Pedido #${data.orderNumber}`
  }
}