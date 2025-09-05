/**
 * Order Processing Email Template
 * Professional notification email sent during order processing stages
 */

import { EmailTemplateData, EmailTemplate, TemplateEngine, createEmailTemplate, createTextTemplate } from './base'

export function getOrderProcessingTemplate(data: EmailTemplateData): EmailTemplate {
  const htmlContent = `
    <div class="content">
      <h1>🔄 Seu Pedido Está em Processamento</h1>
      
      <p>Olá <strong>{{name|capitalize}}</strong>,</p>
      
      <p>Temos boas notícias sobre seu pedido! Nossa equipe especializada já iniciou o processamento e está trabalhando para entregar seu documento o mais rápido possível.</p>
      
      <div class="alert alert-info">
        <div class="alert-title">⚡ Processamento em Andamento</div>
        <div class="alert-text">
          Nossos especialistas estão consultando as bases de dados oficiais para coletar todas as informações necessárias.
        </div>
      </div>
      
      <div class="info-box">
        <h3>📋 Status do Pedido</h3>
        <table>
          <tr>
            <td class="label">Número do Pedido:</td>
            <td class="value"><strong>{{orderNumber}}</strong></td>
          </tr>
          <tr>
            <td class="label">Tipo de Serviço:</td>
            <td class="value">{{serviceType}}</td>
          </tr>
          <tr>
            <td class="label">Status Atual:</td>
            <td class="value"><span class="status status-info">{{orderStatus}}</span></td>
          </tr>
          <tr>
            <td class="label">Iniciado em:</td>
            <td class="value">{{createdAt|date}} às {{createdAt|time}}</td>
          </tr>
          {{#if dueDate}}
          <tr>
            <td class="label">Previsão de Entrega:</td>
            <td class="value"><strong>{{dueDate|date}}</strong></td>
          </tr>
          {{/if}}
        </table>
      </div>
      
      <h2>🏃‍♂️ Etapas do Processamento</h2>
      
      <div class="progress">
        <div class="progress-step completed">
          <div class="progress-circle">✓</div>
          <div class="progress-label">Pedido Recebido</div>
        </div>
        <div class="progress-step completed">
          <div class="progress-circle">✓</div>
          <div class="progress-label">Pagamento OK</div>
        </div>
        <div class="progress-step active">
          <div class="progress-circle">⚡</div>
          <div class="progress-label">Processando</div>
        </div>
        <div class="progress-step">
          <div class="progress-circle">4</div>
          <div class="progress-label">Finalização</div>
        </div>
      </div>
      
      <div class="info-box">
        <h3>🔍 O que estamos fazendo agora</h3>
        <ul>
          <li>✅ <strong>Validação dos Dados:</strong> Conferência das informações fornecidas (CPF/CNPJ)</li>
          <li>🔄 <strong>Consulta Cartorária:</strong> Busca em todos os cartórios de protesto do Brasil</li>
          <li>📊 <strong>Análise de Resultados:</strong> Verificação e consolidação dos dados encontrados</li>
          <li>📄 <strong>Geração do Documento:</strong> Criação da certidão com validade jurídica</li>
          <li>✅ <strong>Revisão Final:</strong> Conferência de qualidade antes da entrega</li>
        </ul>
      </div>
      
      {{#if hasProtests}}
      <div class="alert alert-warning">
        <div class="alert-title">⚠️ Informações Encontradas</div>
        <div class="alert-text">
          Encontramos registros que requerem análise detalhada. Estamos verificando todos os dados para garantir a precisão do documento final.
        </div>
      </div>
      {{/if}}
      
      {{#if protests}}
      <div class="document-list">
        <h3>📊 Protestos Identificados (Análise Preliminar)</h3>
        {{#each protests}}
        <div class="document-item">
          <div class="document-icon">⚖️</div>
          <div class="document-info">
            <h4>{{this.creditor}}</h4>
            <p>Valor: {{this.value|currency}} • Data: {{this.date|date}} • Cartório: {{this.notary}}</p>
          </div>
        </div>
        {{/each}}
        <p style="font-size: 12px; color: #6b7280; margin-top: 16px;">
          <strong>Nota:</strong> Dados em análise. O documento final conterá informações detalhadas e verificadas.
        </p>
      </div>
      {{/if}}
      
      <div class="button-center">
        <a href="{{dashboardUrl}}/pedidos/{{orderNumber}}" class="button">Acompanhar em Tempo Real</a>
        <a href="{{dashboardUrl}}" class="button button-secondary">Ver Todos os Pedidos</a>
      </div>
      
      <h3>⏰ Tempo Estimado</h3>
      <div class="info-box">
        <table>
          <tr>
            <td class="label">Consulta de Protesto:</td>
            <td class="value">30 minutos a 2 horas</td>
          </tr>
          <tr>
            <td class="label">Certidão Negativa:</td>
            <td class="value">2 a 24 horas</td>
          </tr>
          <tr>
            <td class="label">Certidão Positiva:</td>
            <td class="value">4 a 48 horas</td>
          </tr>
          <tr>
            <td class="label">Casos Complexos:</td>
            <td class="value">Até 72 horas</td>
          </tr>
        </table>
        <p style="font-size: 14px; color: #6b7280; margin-top: 12px;">
          Os tempos podem variar conforme a complexidade do caso e disponibilidade dos sistemas cartorários.
        </p>
      </div>
      
      <div class="alert alert-success">
        <div class="alert-title">🎯 Garantia de Qualidade</div>
        <div class="alert-text">
          • <strong>Precisão 100%:</strong> Todos os documentos são revisados por especialistas<br>
          • <strong>Validade Jurídica:</strong> Certidões aceitas em órgãos públicos e privados<br>
          • <strong>Atualização Completa:</strong> Consulta em tempo real nos sistemas oficiais<br>
          • <strong>Suporte Especializado:</strong> Equipe disponível para esclarecer dúvidas
        </div>
      </div>
      
      <hr class="divider">
      
      <h3>📞 Precisa de Informações?</h3>
      <p>Nossa equipe está monitorando o progresso do seu pedido:</p>
      <ul>
        <li><strong>WhatsApp:</strong> Atendimento especializado com o número do pedido</li>
        <li><strong>Dashboard:</strong> Acompanhamento em tempo real na sua conta</li>
        <li><strong>Email:</strong> Notificações automáticas a cada etapa</li>
      </ul>
      
      <div class="info-box">
        <h3>🔐 Segurança e Conformidade</h3>
        <p>Garantimos a proteção total dos seus dados durante todo o processo:</p>
        <ul style="margin: 0;">
          <li>✅ Criptografia de ponta a ponta</li>
          <li>✅ Conformidade com LGPD</li>
          <li>✅ Acesso restrito aos especialistas</li>
          <li>✅ Logs de auditoria completos</li>
        </ul>
      </div>
      
      <p><strong>Fique tranquilo!</strong></p>
      <p>Nossa equipe experiente está cuidando do seu pedido com todo o cuidado e atenção que ele merece. Em breve você receberá seu documento.</p>
    </div>
  `

  const textContent = `
    SEU PEDIDO ESTÁ EM PROCESSAMENTO
    
    Olá {{name|capitalize}},
    
    Temos boas notícias! Nossa equipe já iniciou o processamento do seu pedido.
    
    ⚡ PROCESSAMENTO EM ANDAMENTO
    Especialistas consultando bases de dados oficiais para coletar informações.
    
    📋 STATUS DO PEDIDO:
    • Número: {{orderNumber}}
    • Serviço: {{serviceType}}
    • Status: {{orderStatus}}
    • Iniciado: {{createdAt|date}} às {{createdAt|time}}
    {{#if dueDate}}• Previsão: {{dueDate|date}}{{/if}}
    
    🏃‍♂️ ETAPAS:
    1. ✅ Pedido Recebido
    2. ✅ Pagamento OK
    3. ⚡ Processando (ATUAL)
    4. 📄 Finalização
    
    🔍 O QUE ESTAMOS FAZENDO:
    ✅ Validação dos dados (CPF/CNPJ)
    🔄 Consulta em cartórios do Brasil
    📊 Análise e consolidação
    📄 Geração do documento
    ✅ Revisão de qualidade
    
    {{#if hasProtests}}
    ⚠️ INFORMAÇÕES ENCONTRADAS
    Registros identificados. Analisando dados para garantir precisão.
    {{/if}}
    
    {{#if protests}}
    📊 PROTESTOS IDENTIFICADOS (Análise Preliminar):
    {{#each protests}}
    • {{this.creditor}} - {{this.value|currency}} ({{this.date|date}})
    {{/each}}
    Nota: Dados em análise. Documento final terá informações detalhadas.
    {{/if}}
    
    Acompanhar: {{dashboardUrl}}/pedidos/{{orderNumber}}
    Dashboard: {{dashboardUrl}}
    
    ⏰ TEMPO ESTIMADO:
    • Consulta: 30min a 2h
    • Certidão Negativa: 2 a 24h
    • Certidão Positiva: 4 a 48h
    • Casos Complexos: Até 72h
    
    🎯 GARANTIA DE QUALIDADE:
    • Precisão 100% - revisão por especialistas
    • Validade jurídica - aceito em órgãos oficiais
    • Atualização completa - consulta em tempo real
    • Suporte especializado - equipe disponível
    
    📞 INFORMAÇÕES:
    • WhatsApp: Atendimento com número do pedido
    • Dashboard: Acompanhamento em tempo real
    • Email: Notificações automáticas
    
    🔐 SEGURANÇA:
    ✅ Criptografia ponta a ponta
    ✅ Conformidade LGPD
    ✅ Acesso restrito
    ✅ Logs de auditoria
    
    Fique tranquilo!
    Nossa equipe experiente está cuidando do seu pedido. Em breve você receberá seu documento.
  `

  const processedHtml = createEmailTemplate(
    TemplateEngine.process(htmlContent, {
      ...data,
      dashboardUrl: data.dashboardUrl || `${process.env.NEXTAUTH_URL}/dashboard`,
      createdAt: data.createdAt || new Date()
    }),
    'Processamento em Andamento',
    '#3b82f6' // Blue header for processing
  )

  const processedText = createTextTemplate(
    TemplateEngine.process(textContent, {
      ...data,
      dashboardUrl: data.dashboardUrl || `${process.env.NEXTAUTH_URL}/dashboard`,
      createdAt: data.createdAt || new Date()
    }),
    'Processamento em Andamento'
  )

  return {
    html: processedHtml,
    text: processedText,
    subject: `🔄 Pedido em processamento #${data.orderNumber} - QueroDocumento`
  }
}