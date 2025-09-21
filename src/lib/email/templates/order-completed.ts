/**
 * Order Completed Email Template
 * Professional email sent when an order is completed and documents are ready
 */

import { EmailTemplateData, EmailTemplate, TemplateEngine, createEmailTemplate, createTextTemplate } from './base'

export function getOrderCompletedTemplate(data: EmailTemplateData): EmailTemplate {
  const htmlContent = `
    <div class="content">
      <h1>🎉 Seu Documento Está Pronto!</h1>
      
      <p>Olá <strong>{{name|capitalize}}</strong>,</p>
      
      <p>Temos uma excelente notícia! Seu pedido foi processado com sucesso e seu documento oficial está disponível para download.</p>
      
      <div class="alert alert-success">
        <div class="alert-title">✅ Pedido Concluído</div>
        <div class="alert-text">
          Documento gerado com validade jurídica e pronto para uso oficial.
        </div>
      </div>
      
      <div class="info-box">
        <h3>📋 Detalhes do Pedido Concluído</h3>
        <table>
          <tr>
            <td class="label">Número do Pedido:</td>
            <td class="value"><strong>{{orderNumber}}</strong></td>
          </tr>
          <tr>
            <td class="label">Tipo de Documento:</td>
            <td class="value">{{serviceType}}</td>
          </tr>
          <tr>
            <td class="label">Status:</td>
            <td class="value"><span class="status status-success">Concluído ✅</span></td>
          </tr>
          <tr>
            <td class="label">Data de Conclusão:</td>
            <td class="value">{{createdAt|date}} às {{createdAt|time}}</td>
          </tr>
          {{#if expiresAt}}
          <tr>
            <td class="label">Válido até:</td>
            <td class="value"><strong>{{expiresAt|date}}</strong></td>
          </tr>
          {{/if}}
        </table>
      </div>
      
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; border-radius: 12px; text-align: center; margin: 32px 0; color: white;">
        <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
        <h2 style="margin: 0 0 16px 0; color: white;">Documento Disponível</h2>
        <p style="margin: 0 0 24px 0; color: rgba(255,255,255,0.9);">
          Seu documento oficial está pronto para download
        </p>
        {{#if downloadUrl}}
        <a href="{{downloadUrl}}" class="button" style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white !important;">
          ⬇️ Baixar Documento Agora
        </a>
        {{/if}}
      </div>
      
      {{#if hasProtests}}
      <div class="alert alert-warning">
        <div class="alert-title">📊 Certidão de Protesto Gerada</div>
        <div class="alert-text">
          Foram encontrados protestos registrados. Sua certidão contém todos os detalhes dos registros oficiais.
        </div>
      </div>
      
      {{#if protests}}
      <div class="document-list">
        <h3>📋 Protestos Constantes no Documento</h3>
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
            <strong>Total:</strong> {{protests.length}} registro(s) de protesto encontrado(s)
          </p>
        </div>
      </div>
      {{/if}}
      
      {{#else}}
      <div class="alert alert-success">
        <div class="alert-title">✅ Certidão Negativa Gerada</div>
        <div class="alert-text">
          Parabéns! Não foram encontrados protestos. Sua certidão comprova sua situação regular perante os cartórios.
        </div>
      </div>
      {{/if}}
      
      <div class="progress">
        <div class="progress-step completed">
          <div class="progress-circle">✓</div>
          <div class="progress-label">Pedido</div>
        </div>
        <div class="progress-step completed">
          <div class="progress-circle">✓</div>
          <div class="progress-label">Pagamento</div>
        </div>
        <div class="progress-step completed">
          <div class="progress-circle">✓</div>
          <div class="progress-label">Processamento</div>
        </div>
        <div class="progress-step completed">
          <div class="progress-circle">🎉</div>
          <div class="progress-label">Concluído</div>
        </div>
      </div>
      
      {{#if documents}}
      <div class="document-list">
        <h3>📁 Documentos Disponíveis</h3>
        {{#each documents}}
        <div class="document-item">
          <div class="document-icon">📄</div>
          <div class="document-info">
            <h4>{{this.name}}</h4>
            <p>{{this.type}} • {{this.size}}</p>
            {{#if this.url}}
            <a href="{{this.url}}" style="color: #3b82f6; text-decoration: none; font-size: 12px;">⬇️ Download</a>
            {{/if}}
          </div>
        </div>
        {{/each}}
      </div>
      {{/if}}
      
      <div class="info-box">
        <h3>🔐 Características do Documento</h3>
        <ul>
          <li>✅ <strong>Validade Jurídica:</strong> Aceito em órgãos públicos, bancos e empresas</li>
          <li>✅ <strong>Assinatura Digital:</strong> Certificado com tecnologia ICP-Brasil</li>
          <li>✅ <strong>QR Code:</strong> Verificação de autenticidade online instantânea</li>
          <li>✅ <strong>Dados Oficiais:</strong> Consulta realizada diretamente nos cartórios</li>
          <li>✅ <strong>Formato PDF:</strong> Compatível com todos os sistemas</li>
          <li>✅ <strong>Backup Seguro:</strong> Documento mantido em nossa plataforma por 1 ano</li>
        </ul>
      </div>
      
      <h3>📱 Como Usar seu Documento</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 16px 0;">
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; margin-bottom: 8px;">🏦</div>
          <h4 style="margin: 0 0 8px 0; color: #374151;">Bancos</h4>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            Abertura de contas<br>
            Solicitação de crédito
          </p>
        </div>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; margin-bottom: 8px;">🏛️</div>
          <h4 style="margin: 0 0 8px 0; color: #374151;">Órgãos Públicos</h4>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            Licitações<br>
            Certames públicos
          </p>
        </div>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; margin-bottom: 8px;">🏢</div>
          <h4 style="margin: 0 0 8px 0; color: #374151;">Empresas</h4>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            Contratos comerciais<br>
            Parcerias de negócio
          </p>
        </div>
      </div>
      
      <div class="button-center">
        {{#if downloadUrl}}
        <a href="{{downloadUrl}}" class="button">📥 Baixar Documento</a>
        {{/if}}
        <a href="{{dashboardUrl}}/pedidos/{{orderNumber}}" class="button button-secondary">Ver Detalhes</a>
        <a href="{{dashboardUrl}}" class="button button-secondary">Fazer Nova Consulta</a>
      </div>
      
      <div class="alert alert-info">
        <div class="alert-title">💡 Dicas Importantes</div>
        <div class="alert-text">
          • <strong>Salve o documento:</strong> Faça backup em local seguro<br>
          • <strong>Imprima se necessário:</strong> Versão impressa também é válida<br>
          • <strong>Verificação online:</strong> Use o QR Code para confirmar autenticidade<br>
          • <strong>Prazo de validade:</strong> Verifique se o documento ainda está válido antes de usar
        </div>
      </div>
      
      <hr class="divider">
      
      <h3>⭐ Avalie Nosso Serviço</h3>
      <p>Sua opinião é muito importante para nós! Que tal nos contar sobre sua experiência?</p>
      
      <div style="text-align: center; margin: 20px 0;">
        <p style="margin-bottom: 12px;"><strong>Como você avalia nosso atendimento?</strong></p>
        <div style="font-size: 24px;">
          <a href="{{dashboardUrl}}/avaliar/{{orderNumber}}?rating=5" style="text-decoration: none; margin: 0 4px;">⭐</a>
          <a href="{{dashboardUrl}}/avaliar/{{orderNumber}}?rating=4" style="text-decoration: none; margin: 0 4px;">⭐</a>
          <a href="{{dashboardUrl}}/avaliar/{{orderNumber}}?rating=3" style="text-decoration: none; margin: 0 4px;">⭐</a>
          <a href="{{dashboardUrl}}/avaliar/{{orderNumber}}?rating=2" style="text-decoration: none; margin: 0 4px;">⭐</a>
          <a href="{{dashboardUrl}}/avaliar/{{orderNumber}}?rating=1" style="text-decoration: none; margin: 0 4px;">⭐</a>
        </div>
        <p style="font-size: 12px; color: #6b7280;">Clique nas estrelas para avaliar</p>
      </div>
      
      <h3>🤝 Precisa de Mais Alguma Coisa?</h3>
      <p>Nosso suporte continua disponível para você:</p>
      <ul>
        <li><strong>WhatsApp:</strong> Tire dúvidas sobre seu documento</li>
        <li><strong>Segunda Via:</strong> Download disponível na sua conta por 1 ano</li>
        <li><strong>Novos Pedidos:</strong> Descontos especiais para clientes</li>
        <li><strong>Suporte Técnico:</strong> Ajuda com verificação de autenticidade</li>
      </ul>
      
      <div class="alert alert-success">
        <div class="alert-title">🎁 Oferta Especial</div>
        <div class="alert-text">
          Como cliente satisfeito, você tem <strong>10% de desconto</strong> no seu próximo pedido! 
          Use o código <strong>CLIENTE10</strong> em uma nova consulta.
        </div>
      </div>
      
      <p><strong>Muito obrigado por confiar no QueroDocumento!</strong></p>
      <p>Foi um prazer atendê-lo. Estamos sempre aqui quando precisar de nossos serviços novamente.</p>
    </div>
  `

  const textContent = `
    SEU DOCUMENTO ESTÁ PRONTO!
    
    Olá {{name|capitalize}},
    
    Excelente notícia! Seu pedido foi processado com sucesso e seu documento oficial está disponível.
    
    ✅ PEDIDO CONCLUÍDO
    Documento gerado com validade jurídica e pronto para uso oficial.
    
    📋 DETALHES:
    • Pedido: {{orderNumber}}
    • Documento: {{serviceType}}
    • Status: Concluído ✅
    • Conclusão: {{createdAt|date}} às {{createdAt|time}}
    {{#if expiresAt}}• Válido até: {{expiresAt|date}}{{/if}}
    
    📄 DOCUMENTO DISPONÍVEL
    {{#if downloadUrl}}
    Baixar agora: {{downloadUrl}}
    {{/if}}
    
    {{#if hasProtests}}
    📊 CERTIDÃO DE PROTESTO
    Protestos encontrados. Certidão contém todos os detalhes oficiais.
    
    {{#if protests}}
    📋 PROTESTOS NO DOCUMENTO:
    {{#each protests}}
    • {{this.creditor}}: {{this.value|currency}} ({{this.date|date}})
    {{/each}}
    Total: {{protests.length}} registro(s)
    {{/if}}
    
    {{#else}}
    ✅ CERTIDÃO NEGATIVA  
    Parabéns! Nenhum protesto encontrado. Situação regular comprovada.
    {{/if}}
    
    PROGRESSO:
    1. ✅ Pedido
    2. ✅ Pagamento
    3. ✅ Processamento  
    4. 🎉 Concluído
    
    {{#if documents}}
    📁 DOCUMENTOS DISPONÍVEIS:
    {{#each documents}}
    • {{this.name}} ({{this.type}}) - {{this.size}}
    {{#if this.url}}  Download: {{this.url}}{{/if}}
    {{/each}}
    {{/if}}
    
    🔐 CARACTERÍSTICAS:
    ✅ Validade jurídica - aceito oficialmente
    ✅ Assinatura digital certificada
    ✅ QR Code para verificação  
    ✅ Dados oficiais dos cartórios
    ✅ Formato PDF compatível
    ✅ Backup seguro por 1 ano
    
    📱 COMO USAR:
    🏦 Bancos: Abertura contas, crédito
    🏛️ Órgãos Públicos: Licitações, certames
    🏢 Empresas: Contratos, parcerias
    
    {{#if downloadUrl}}Baixar: {{downloadUrl}}{{/if}}
    Ver detalhes: {{dashboardUrl}}/pedidos/{{orderNumber}}
    Nova consulta: {{dashboardUrl}}
    
    💡 DICAS:
    • Salve o documento em local seguro
    • Versão impressa também é válida
    • Use QR Code para verificar autenticidade
    • Verifique prazo de validade antes de usar
    
    ⭐ AVALIE NOSSO SERVIÇO:
    Sua opinião é importante!
    Avaliar: {{dashboardUrl}}/avaliar/{{orderNumber}}
    
    🤝 SUPORTE DISPONÍVEL:
    • WhatsApp: Dúvidas sobre documento
    • Segunda Via: Download por 1 ano
    • Novos Pedidos: Descontos especiais
    • Suporte Técnico: Ajuda com verificação
    
    🎁 OFERTA ESPECIAL
    10% desconto no próximo pedido!
    Use código: CLIENTE10
    
    Muito obrigado por confiar no QueroDocumento!
    Foi um prazer atendê-lo.
  `

  const processedHtml = createEmailTemplate(
    TemplateEngine.process(htmlContent, {
      ...data,
      dashboardUrl: data.dashboardUrl || `${process.env.NEXTAUTH_URL}/dashboard`,
      createdAt: data.createdAt || new Date()
    }),
    'Documento Concluído',
    '#10b981' // Green header for completed orders
  )

  const processedText = createTextTemplate(
    TemplateEngine.process(textContent, {
      ...data,
      dashboardUrl: data.dashboardUrl || `${process.env.NEXTAUTH_URL}/dashboard`,
      createdAt: data.createdAt || new Date()
    }),
    'Documento Concluído'
  )

  return {
    html: processedHtml,
    text: processedText,
    subject: `🎉 Documento pronto para download - Pedido #${data.orderNumber}`
  }
}