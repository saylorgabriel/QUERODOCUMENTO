/**
 * Email Templates for QUERODOCUMENTO
 * Professional email templates for all transactional emails
 * Now includes enhanced templates with advanced features
 */

// Import all template functions
import { getWelcomeTemplate } from './templates/welcome'
import { getOrderConfirmationTemplate } from './templates/order-confirmation'
import { getPaymentConfirmedTemplate } from './templates/payment-confirmed'
import { getOrderProcessingTemplate } from './templates/order-processing'
import { getQuoteReadyTemplate } from './templates/quote-ready'
import { getOrderCompletedTemplate } from './templates/order-completed'
import { getPasswordResetTemplate } from './templates/password-reset'
import { getStatusUpdateTemplate } from './templates/status-update'
import { EmailTemplateData, EmailTemplate } from './templates/base'

// Re-export for compatibility
export { EmailTemplateData, EmailTemplate }

/**
 * Legacy base email template wrapper (deprecated)
 * Use templates/base.ts for new implementations
 */
function wrapTemplate(content: string, title: string = 'QueroDocumento'): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          line-height: 1.6;
          color: #374151;
          background-color: #f9fafb;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
        }
        .logo {
          display: inline-flex;
          align-items: center;
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .logo-icon {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          font-weight: bold;
        }
        .content {
          padding: 40px 30px;
        }
        .content h1 {
          color: #111827;
          margin-bottom: 20px;
          font-size: 24px;
        }
        .content h2 {
          color: #374151;
          margin: 24px 0 16px 0;
          font-size: 20px;
        }
        .content p {
          margin-bottom: 16px;
          color: #4b5563;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #ea580c, #f97316);
          color: white !important;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-weight: 600;
          margin: 24px 0;
          transition: transform 0.2s;
        }
        .button:hover {
          transform: translateY(-1px);
        }
        .info-box {
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin: 24px 0;
        }
        .info-box h3 {
          color: #374151;
          margin-bottom: 12px;
        }
        .warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 16px;
          margin: 24px 0;
        }
        .warning-title {
          font-weight: 600;
          color: #92400e;
          margin-bottom: 8px;
        }
        .warning-text {
          color: #78350f;
          font-size: 14px;
        }
        .success {
          background: #d1fae5;
          border: 1px solid #10b981;
          border-radius: 8px;
          padding: 16px;
          margin: 24px 0;
        }
        .success-title {
          font-weight: 600;
          color: #059669;
          margin-bottom: 8px;
        }
        .success-text {
          color: #047857;
          font-size: 14px;
        }
        .footer {
          background: #f9fafb;
          padding: 30px;
          text-align: center;
          font-size: 14px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 8px 0;
        }
        .divider {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 32px 0;
        }
        @media (max-width: 600px) {
          .container { margin: 0; }
          .content, .header, .footer { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <span class="logo-icon">Q</span>
            QueroDocumento
          </div>
          <p style="margin: 0; opacity: 0.9; font-size: 16px;">${title}</p>
        </div>
        ${content}
        <div class="footer">
          <p><strong>QueroDocumento</strong> - Consulta e Certidão de Protesto</p>
          <p>Atendimento via WhatsApp - Resposta em até 24 horas úteis</p>
          <p>Nossa equipe de especialistas garante rapidez e qualidade</p>
          <hr style="border: none; border-top: 1px solid #d1d5db; margin: 16px 0;">
          <p style="font-size: 12px;">© ${new Date().getFullYear()} QueroDocumento. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Password Reset Email Template (Legacy)
 * Use templates/password-reset.ts for enhanced version
 */
export function getLegacyPasswordResetTemplate(data: EmailTemplateData): { html: string; text: string; subject: string } {
  const { name, email, resetUrl } = data
  
  const html = wrapTemplate(`
    <div class="content">
      <h1>Redefinir Senha</h1>
      <p>Olá <strong>${name}</strong>,</p>
      <p>Recebemos uma solicitação para redefinir a senha da sua conta no QueroDocumento.</p>
      <p>Se você fez esta solicitação, clique no botão abaixo para criar uma nova senha:</p>
      
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Redefinir Minha Senha</a>
      </div>
      
      <div class="warning">
        <div class="warning-title">⚠️ Importante:</div>
        <div class="warning-text">
          • Este link expira em <strong>30 minutos</strong><br>
          • Se você não solicitou esta alteração, ignore este email<br>
          • Sua senha atual permanecerá inalterada até que você crie uma nova
        </div>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        Se o botão acima não funcionar, copie e cole este link no seu navegador:<br>
        <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
      </p>
      
      <hr class="divider">
      
      <p style="font-size: 14px; color: #6b7280;">
        Esta solicitação foi feita para o email: <strong>${email}</strong>
      </p>
    </div>
  `, 'Redefinição de Senha')
  
  const text = `
QueroDocumento - Redefinir Senha

Olá ${name},

Recebemos uma solicitação para redefinir a senha da sua conta no QueroDocumento.

Se você fez esta solicitação, acesse o link abaixo para criar uma nova senha:
${resetUrl}

IMPORTANTE:
• Este link expira em 30 minutos
• Se você não solicitou esta alteração, ignore este email
• Sua senha atual permanecerá inalterada até que você crie uma nova

Esta solicitação foi feita para o email: ${email}

Atenciosamente,
Equipe QueroDocumento
  `.trim()
  
  return {
    html,
    text,
    subject: 'Redefinir sua senha - QueroDocumento'
  }
}

/**
 * Welcome Email Template (Legacy)
 * Use templates/welcome.ts for enhanced version
 */
export function getLegacyWelcomeTemplate(data: EmailTemplateData): { html: string; text: string; subject: string } {
  const { name } = data
  
  const html = wrapTemplate(`
    <div class="content">
      <h1>🎉 Bem-vindo(a)!</h1>
      <p>Olá <strong>${name}</strong>,</p>
      <p>Parabéns! Sua conta no QueroDocumento foi criada com sucesso.</p>
      
      <p>Agora você pode:</p>
      <ul style="margin-left: 20px; margin-bottom: 20px;">
        <li style="margin-bottom: 8px;">📋 <strong>Consultar protestos</strong> em seu nome ou empresa</li>
        <li style="margin-bottom: 8px;">📄 <strong>Emitir certidões</strong> positivas e negativas</li>
        <li style="margin-bottom: 8px;">⚡ <strong>Receber resultados</strong> em até 48 horas</li>
        <li style="margin-bottom: 8px;">💬 <strong>Suporte via WhatsApp</strong> sempre disponível</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Acessar Minha Conta</a>
      </div>
      
      <div class="success">
        <div class="success-title">🚀 Próximos Passos</div>
        <div class="success-text">
          1. Acesse sua conta e complete seu perfil<br>
          2. Faça sua primeira consulta de protesto<br>
          3. Explore nossos serviços de certidão
        </div>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        Se tiver alguma dúvida, nossa equipe está disponível via WhatsApp para te ajudar!
      </p>
    </div>
  `, 'Bem-vindo ao QueroDocumento')
  
  const text = `
QueroDocumento - Bem-vindo!

Olá ${name},

Parabéns! Sua conta no QueroDocumento foi criada com sucesso.

Agora você pode:
• Consultar protestos em seu nome ou empresa
• Emitir certidões positivas e negativas  
• Receber resultados em até 48 horas
• Suporte via WhatsApp sempre disponível

Acesse sua conta: ${process.env.NEXTAUTH_URL}/dashboard

Próximos Passos:
1. Acesse sua conta e complete seu perfil
2. Faça sua primeira consulta de protesto
3. Explore nossos serviços de certidão

Se tiver alguma dúvida, nossa equipe está disponível via WhatsApp!

Atenciosamente,
Equipe QueroDocumento
  `.trim()
  
  return {
    html,
    text,
    subject: 'Bem-vindo ao QueroDocumento! 🎉'
  }
}

/**
 * Order Confirmation Email Template (Legacy)
 * Use templates/order-confirmation.ts for enhanced version
 */
export function getLegacyOrderConfirmationTemplate(data: EmailTemplateData): { html: string; text: string; subject: string } {
  const { name, orderNumber, serviceType, amount } = data
  
  const html = wrapTemplate(`
    <div class="content">
      <h1>Pedido Confirmado</h1>
      <p>Olá <strong>${name}</strong>,</p>
      <p>Seu pedido foi confirmado com sucesso! Estamos processando sua solicitação.</p>
      
      <div class="info-box">
        <h3>📋 Detalhes do Pedido</h3>
        <p><strong>Número do Pedido:</strong> ${orderNumber}</p>
        <p><strong>Serviço:</strong> ${serviceType}</p>
        <p><strong>Valor:</strong> ${amount}</p>
        <p><strong>Status:</strong> Confirmado</p>
      </div>
      
      <div class="success">
        <div class="success-title">✅ Próximas Etapas</div>
        <div class="success-text">
          1. Processaremos sua solicitação em até 48 horas<br>
          2. Você receberá um email quando estiver pronto<br>
          3. O documento ficará disponível em sua conta
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Acompanhar Pedido</a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        Precisa de ajuda? Entre em contato conosco via WhatsApp.
      </p>
    </div>
  `, 'Pedido Confirmado')
  
  const text = `
QueroDocumento - Pedido Confirmado

Olá ${name},

Seu pedido foi confirmado com sucesso!

Detalhes do Pedido:
• Número: ${orderNumber}
• Serviço: ${serviceType}
• Valor: ${amount}
• Status: Confirmado

Próximas Etapas:
1. Processaremos sua solicitação em até 48 horas
2. Você receberá um email quando estiver pronto
3. O documento ficará disponível em sua conta

Acompanhe em: ${process.env.NEXTAUTH_URL}/dashboard

Precisa de ajuda? Entre em contato via WhatsApp.

Atenciosamente,
Equipe QueroDocumento
  `.trim()
  
  return {
    html,
    text,
    subject: `Pedido confirmado - ${orderNumber}`
  }
}

/**
 * Order Completed Email Template (Legacy)
 * Use templates/order-completed.ts for enhanced version
 */
export function getLegacyOrderCompletedTemplate(data: EmailTemplateData): { html: string; text: string; subject: string } {
  const { name, orderNumber, downloadUrl } = data
  
  const html = wrapTemplate(`
    <div class="content">
      <h1>🎉 Pedido Pronto!</h1>
      <p>Olá <strong>${name}</strong>,</p>
      <p>Ótimas notícias! Seu pedido foi processado e está pronto para download.</p>
      
      <div class="info-box">
        <h3>📋 Pedido Finalizado</h3>
        <p><strong>Número do Pedido:</strong> ${orderNumber}</p>
        <p><strong>Status:</strong> Concluído ✅</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${downloadUrl}" class="button">Baixar Documento</a>
      </div>
      
      <div class="warning">
        <div class="warning-title">📱 Importante:</div>
        <div class="warning-text">
          • O documento também está disponível em sua conta<br>
          • Mantenha o documento em local seguro<br>
          • Em caso de dúvidas, entre em contato conosco
        </div>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        Obrigado por escolher o QueroDocumento! Conte conosco para futuros serviços.
      </p>
    </div>
  `, 'Documento Pronto')
  
  const text = `
QueroDocumento - Documento Pronto

Olá ${name},

Ótimas notícias! Seu pedido foi processado e está pronto para download.

Pedido: ${orderNumber}
Status: Concluído ✅

Baixar documento: ${downloadUrl}

Importante:
• O documento também está disponível em sua conta
• Mantenha o documento em local seguro
• Em caso de dúvidas, entre em contato conosco

Obrigado por escolher o QueroDocumento!

Atenciosamente,
Equipe QueroDocumento
  `.trim()
  
  return {
    html,
    text,
    subject: `Seu pedido está pronto! - ${orderNumber}`
  }
}

/**
 * Payment Confirmation Email Template (Legacy)
 * Use templates/payment-confirmed.ts for enhanced version
 */
export function getLegacyPaymentConfirmationTemplate(data: EmailTemplateData): { html: string; text: string; subject: string } {
  const { name, orderNumber, amount, paymentMethod } = data
  
  const html = wrapTemplate(`
    <div class="content">
      <h1>✅ Pagamento Confirmado</h1>
      <p>Olá <strong>${name}</strong>,</p>
      <p>Recebemos a confirmação do seu pagamento. Seu pedido será processado em breve!</p>
      
      <div class="info-box">
        <h3>💳 Detalhes do Pagamento</h3>
        <p><strong>Pedido:</strong> ${orderNumber}</p>
        <p><strong>Valor:</strong> ${amount}</p>
        <p><strong>Método:</strong> ${paymentMethod}</p>
        <p><strong>Status:</strong> Confirmado ✅</p>
      </div>
      
      <div class="success">
        <div class="success-title">🚀 O que acontece agora?</div>
        <div class="success-text">
          1. Iniciaremos o processamento do seu pedido<br>
          2. Você receberá atualizações por email<br>
          3. O resultado estará pronto em até 48 horas
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Ver Meus Pedidos</a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        Agradecemos pela confiança! Nossa equipe já está trabalhando no seu pedido.
      </p>
    </div>
  `, 'Pagamento Confirmado')
  
  const text = `
QueroDocumento - Pagamento Confirmado

Olá ${name},

Recebemos a confirmação do seu pagamento!

Detalhes:
• Pedido: ${orderNumber}
• Valor: ${amount}  
• Método: ${paymentMethod}
• Status: Confirmado ✅

O que acontece agora?
1. Iniciaremos o processamento do seu pedido
2. Você receberá atualizações por email
3. O resultado estará pronto em até 48 horas

Acompanhe em: ${process.env.NEXTAUTH_URL}/dashboard

Agradecemos pela confiança!

Atenciosamente,
Equipe QueroDocumento
  `.trim()
  
  return {
    html,
    text,
    subject: `Pagamento confirmado - ${orderNumber}`
  }
}

/**
 * Enhanced template selector with all available templates
 * Supports both legacy and new template formats
 */
export function getEmailTemplate(templateName: string, data: EmailTemplateData): EmailTemplate {
  switch (templateName) {
    // Enhanced templates (recommended)
    case 'welcome':
      return getWelcomeTemplate(data)
    case 'order-confirmation':
      return getOrderConfirmationTemplate(data)
    case 'payment-confirmed':
    case 'payment-confirmation': // Backward compatibility
      return getPaymentConfirmedTemplate(data)
    case 'order-processing':
      return getOrderProcessingTemplate(data)
    case 'quote-ready':
      return getQuoteReadyTemplate(data)
    case 'order-completed':
      return getOrderCompletedTemplate(data)
    case 'password-reset':
      return getPasswordResetTemplate(data)
    case 'status-update':
      return getStatusUpdateTemplate(data)
    
    // Legacy templates (for backward compatibility)
    case 'legacy-welcome':
      return getLegacyWelcomeTemplate(data)
    case 'legacy-order-confirmation':
      return getLegacyOrderConfirmationTemplate(data)
    case 'legacy-order-completed':
      return getLegacyOrderCompletedTemplate(data)
    case 'legacy-payment-confirmation':
      return getLegacyPaymentConfirmationTemplate(data)
    case 'legacy-password-reset':
      return getLegacyPasswordResetTemplate(data)
    
    default:
      throw new Error(`Unknown email template: ${templateName}. Available templates: welcome, order-confirmation, payment-confirmed, order-processing, quote-ready, order-completed, password-reset, status-update`)
  }
}

/**
 * Get list of available templates
 */
export function getAvailableTemplates(): string[] {
  return [
    'welcome',
    'order-confirmation', 
    'payment-confirmed',
    'order-processing',
    'quote-ready',
    'order-completed',
    'password-reset',
    'status-update'
  ]
}

/**
 * Template metadata for admin interface
 */
export interface TemplateMetadata {
  name: string
  description: string
  category: 'user' | 'order' | 'system'
  variables: string[]
}

export function getTemplateMetadata(): Record<string, TemplateMetadata> {
  return {
    'welcome': {
      name: 'Boas-vindas',
      description: 'Email de boas-vindas enviado após o cadastro',
      category: 'user',
      variables: ['name', 'email', 'dashboardUrl', 'createdAt']
    },
    'order-confirmation': {
      name: 'Confirmação de Pedido',
      description: 'Confirmação enviada quando um pedido é criado',
      category: 'order',
      variables: ['name', 'orderNumber', 'serviceType', 'amount', 'requiresPayment', 'isPIX', 'isCreditCard', 'documents']
    },
    'payment-confirmed': {
      name: 'Pagamento Confirmado',
      description: 'Enviado quando o pagamento é processado com sucesso',
      category: 'order', 
      variables: ['name', 'orderNumber', 'amount', 'paymentMethod', 'isPIX', 'isCreditCard']
    },
    'order-processing': {
      name: 'Pedido em Processamento',
      description: 'Enviado quando o processamento é iniciado',
      category: 'order',
      variables: ['name', 'orderNumber', 'serviceType', 'orderStatus', 'hasProtests', 'protests', 'dueDate']
    },
    'quote-ready': {
      name: 'Orçamento Disponível',
      description: 'Enviado quando um orçamento está pronto para aprovação',
      category: 'order',
      variables: ['name', 'orderNumber', 'serviceType', 'amount', 'hasProtests', 'protests', 'expiresAt']
    },
    'order-completed': {
      name: 'Pedido Concluído',
      description: 'Enviado quando o pedido é finalizado e documentos estão prontos',
      category: 'order',
      variables: ['name', 'orderNumber', 'serviceType', 'downloadUrl', 'hasProtests', 'protests', 'documents', 'expiresAt']
    },
    'password-reset': {
      name: 'Redefinição de Senha',
      description: 'Email para recuperação de senha',
      category: 'user',
      variables: ['name', 'email', 'resetUrl', 'createdAt']
    },
    'status-update': {
      name: 'Atualização de Status',
      description: 'Template genérico para mudanças de status',
      category: 'system',
      variables: ['name', 'orderNumber', 'orderStatus', 'previousStatus', 'message', 'nextSteps', 'requiresAction', 'actionRequired', 'actionUrl', 'documents', 'estimatedTime', 'additionalInfo']
    }
  }
}