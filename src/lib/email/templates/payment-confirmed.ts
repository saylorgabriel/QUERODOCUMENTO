/**
 * Payment Confirmed Email Template
 * Professional confirmation email sent when payment is successful
 */

import { EmailTemplateData, EmailTemplate, TemplateEngine, createEmailTemplate, createTextTemplate } from './base'

export function getPaymentConfirmedTemplate(data: EmailTemplateData): EmailTemplate {
  const htmlContent = `
    <div class="content">
      <h1>✅ Pagamento Confirmado!</h1>
      
      <p>Olá <strong>{{name|capitalize}}</strong>,</p>
      
      <p>Excelentes notícias! Recebemos a confirmação do seu pagamento com sucesso. Seu pedido já está sendo processado pela nossa equipe.</p>
      
      <div class="alert alert-success">
        <div class="alert-title">💳 Pagamento Processado</div>
        <div class="alert-text">
          Transação aprovada e pedido liberado para processamento imediato.
        </div>
      </div>
      
      <div class="info-box">
        <h3>💰 Detalhes do Pagamento</h3>
        <table>
          <tr>
            <td class="label">Pedido:</td>
            <td class="value"><strong>{{orderNumber}}</strong></td>
          </tr>
          <tr>
            <td class="label">Valor Pago:</td>
            <td class="value"><strong>{{amount|currency}}</strong></td>
          </tr>
          <tr>
            <td class="label">Método de Pagamento:</td>
            <td class="value">{{paymentMethod}}</td>
          </tr>
          <tr>
            <td class="label">Data/Hora:</td>
            <td class="value">{{createdAt|date}} às {{createdAt|time}}</td>
          </tr>
          <tr>
            <td class="label">Status:</td>
            <td class="value"><span class="status status-success">Pago ✅</span></td>
          </tr>
        </table>
      </div>
      
      <h2>🚀 O que acontece agora?</h2>
      
      <div class="progress">
        <div class="progress-step completed">
          <div class="progress-circle">✓</div>
          <div class="progress-label">Pedido Criado</div>
        </div>
        <div class="progress-step completed">
          <div class="progress-circle">✓</div>
          <div class="progress-label">Pagamento</div>
        </div>
        <div class="progress-step active">
          <div class="progress-circle">⚡</div>
          <div class="progress-label">Processando</div>
        </div>
        <div class="progress-step">
          <div class="progress-circle">4</div>
          <div class="progress-label">Concluído</div>
        </div>
      </div>
      
      <div class="info-box">
        <h3>⏰ Cronograma de Execução</h3>
        <ul>
          <li>✅ <strong>Agora:</strong> Pagamento confirmado e pedido em processamento</li>
          <li>🔄 <strong>Próximas horas:</strong> Nossa equipe iniciará a busca nos cartórios</li>
          <li>📊 <strong>Em breve:</strong> Coleta e análise dos dados encontrados</li>
          <li>📄 <strong>Finalização:</strong> Geração e revisão do documento final</li>
          <li>📧 <strong>Entrega:</strong> Envio por email e disponibilização na sua conta</li>
        </ul>
      </div>
      
      {{#if isPIX}}
      <div class="alert alert-info">
        <div class="alert-title">🏦 PIX Confirmado</div>
        <div class="alert-text">
          Seu PIX foi processado instantaneamente. O valor já está em nossa conta e o pedido foi liberado automaticamente.
        </div>
      </div>
      {{/if}}
      
      {{#if isCreditCard}}
      <div class="alert alert-info">
        <div class="alert-title">💳 Cartão de Crédito</div>
        <div class="alert-text">
          Sua transação foi aprovada e processada com segurança. O valor aparecerá na fatura do seu cartão conforme a data de fechamento.
        </div>
      </div>
      {{/if}}
      
      <div class="button-center">
        <a href="{{dashboardUrl}}/pedidos/{{orderNumber}}" class="button">Ver Detalhes do Pedido</a>
        <a href="{{dashboardUrl}}" class="button button-secondary">Ir para Dashboard</a>
      </div>
      
      <h3>📱 Notificações Automáticas</h3>
      <p>Você receberá notificações por email em cada etapa:</p>
      <ul>
        <li>✅ <strong>Pagamento confirmado</strong> (este email)</li>
        <li>🔄 <strong>Processamento iniciado</strong> (quando nossa equipe começar a busca)</li>
        <li>📊 <strong>Dados coletados</strong> (quando encontrarmos informações relevantes)</li>
        <li>📄 <strong>Documento pronto</strong> (quando o resultado estiver disponível)</li>
      </ul>
      
      <div class="document-list">
        <h3>🏛️ Cartórios Consultados</h3>
        <div class="document-item">
          <div class="document-icon">🏛️</div>
          <div class="document-info">
            <h4>Base Nacional de Protestos</h4>
            <p>Consulta em todos os cartórios do Brasil</p>
          </div>
        </div>
        <div class="document-item">
          <div class="document-icon">⚖️</div>
          <div class="document-info">
            <h4>Tabelionatos Credenciados</h4>
            <p>Rede oficial de cartórios certificados</p>
          </div>
        </div>
        <div class="document-item">
          <div class="document-icon">🔐</div>
          <div class="document-info">
            <h4>Sistema Seguro</h4>
            <p>Consulta oficial com validade jurídica</p>
          </div>
        </div>
      </div>
      
      <div class="alert alert-warning">
        <div class="alert-title">⚠️ Importante sobre o Resultado</div>
        <div class="alert-text">
          • Se não houver protestos, você receberá uma <strong>Certidão Negativa</strong><br>
          • Se houver protestos, você receberá uma <strong>Certidão Positiva</strong> com todos os detalhes<br>
          • Ambos os documentos têm <strong>validade jurídica</strong> e podem ser usados oficialmente
        </div>
      </div>
      
      <hr class="divider">
      
      <h3>💸 Recibo de Pagamento</h3>
      <div class="info-box">
        <table>
          <tr>
            <td class="label">Empresa:</td>
            <td class="value">QueroDocumento Ltda</td>
          </tr>
          <tr>
            <td class="label">CNPJ:</td>
            <td class="value">00.000.000/0001-00</td>
          </tr>
          <tr>
            <td class="label">Serviço:</td>
            <td class="value">{{serviceType}}</td>
          </tr>
          <tr>
            <td class="label">Valor:</td>
            <td class="value"><strong>{{amount|currency}}</strong></td>
          </tr>
          <tr>
            <td class="label">Forma de Pagamento:</td>
            <td class="value">{{paymentMethod}}</td>
          </tr>
        </table>
      </div>
      
      <p><strong>Obrigado pela confiança!</strong></p>
      <p>Nossa equipe está trabalhando para entregar seu documento com a máxima qualidade e agilidade.</p>
    </div>
  `

  const textContent = `
    PAGAMENTO CONFIRMADO!
    
    Olá {{name|capitalize}},
    
    Excelentes notícias! Recebemos a confirmação do seu pagamento com sucesso. Seu pedido já está sendo processado.
    
    ✅ PAGAMENTO PROCESSADO
    Transação aprovada e pedido liberado para processamento imediato.
    
    💰 DETALHES DO PAGAMENTO:
    • Pedido: {{orderNumber}}
    • Valor: {{amount|currency}}
    • Método: {{paymentMethod}}
    • Data/Hora: {{createdAt|date}} às {{createdAt|time}}
    • Status: Pago ✅
    
    🚀 O QUE ACONTECE AGORA?
    1. ✅ Pedido Criado
    2. ✅ Pagamento Confirmado  
    3. ⚡ Processando (ATUAL)
    4. 📄 Concluído
    
    ⏰ CRONOGRAMA:
    ✅ Agora: Pagamento confirmado
    🔄 Próximas horas: Busca nos cartórios
    📊 Em breve: Coleta e análise dos dados
    📄 Finalização: Geração do documento
    📧 Entrega: Envio por email
    
    {{#if isPIX}}
    🏦 PIX CONFIRMADO
    Processado instantaneamente. Pedido liberado automaticamente.
    {{/if}}
    
    {{#if isCreditCard}}
    💳 CARTÃO APROVADO  
    Transação processada com segurança. Aparecerá na sua fatura.
    {{/if}}
    
    Ver pedido: {{dashboardUrl}}/pedidos/{{orderNumber}}
    Dashboard: {{dashboardUrl}}
    
    📱 NOTIFICAÇÕES:
    ✅ Pagamento confirmado (este email)
    🔄 Processamento iniciado
    📊 Dados coletados  
    📄 Documento pronto
    
    🏛️ CARTÓRIOS CONSULTADOS:
    • Base Nacional de Protestos
    • Tabelionatos Credenciados
    • Sistema Seguro com validade jurídica
    
    ⚠️ SOBRE O RESULTADO:
    • Sem protestos = Certidão Negativa
    • Com protestos = Certidão Positiva com detalhes
    • Ambos documentos têm validade jurídica
    
    💸 RECIBO:
    Empresa: QueroDocumento Ltda
    CNPJ: 00.000.000/0001-00
    Serviço: {{serviceType}}
    Valor: {{amount|currency}}
    Pagamento: {{paymentMethod}}
    
    Obrigado pela confiança!
    Nossa equipe está trabalhando no seu documento.
  `

  const processedHtml = createEmailTemplate(
    TemplateEngine.process(htmlContent, {
      ...data,
      dashboardUrl: data.dashboardUrl || `${process.env.NEXTAUTH_URL}/dashboard`,
      createdAt: data.createdAt || new Date()
    }),
    'Pagamento Confirmado',
    '#10b981' // Green header for success
  )

  const processedText = createTextTemplate(
    TemplateEngine.process(textContent, {
      ...data,
      dashboardUrl: data.dashboardUrl || `${process.env.NEXTAUTH_URL}/dashboard`,
      createdAt: data.createdAt || new Date()
    }),
    'Pagamento Confirmado'
  )

  return {
    html: processedHtml,
    text: processedText,
    subject: `✅ Pagamento confirmado - Pedido #${data.orderNumber}`
  }
}