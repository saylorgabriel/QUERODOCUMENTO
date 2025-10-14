/**
 * Enhanced Email Template Engine for QUERODOCUMENTO
 * Provides professional email templates with advanced features:
 * - Variable substitution with safe HTML escaping
 * - Conditional content rendering
 * - Loop support for dynamic lists
 * - Brazilian date and currency formatting
 * - Responsive design for all email clients
 */

export interface EmailTemplateData {
  // User information
  name: string
  email?: string
  cpfCnpj?: string
  phone?: string
  
  // Order information
  orderNumber?: string
  orderStatus?: string
  serviceType?: string
  amount?: string | number
  paymentMethod?: string
  
  // URLs
  resetUrl?: string
  downloadUrl?: string
  dashboardUrl?: string
  
  // Arrays for loops
  documents?: Array<{
    name: string
    type: string
    url?: string
    size?: string
  }>
  
  protests?: Array<{
    date: string
    value: string
    creditor: string
    notary: string
  }>
  
  // Conditional flags
  hasProtests?: boolean
  requiresPayment?: boolean
  isPIX?: boolean
  isCreditCard?: boolean
  
  // Dates
  createdAt?: Date | string
  dueDate?: Date | string
  expiresAt?: Date | string
  
  // Additional metadata
  [key: string]: any
}

export interface EmailTemplate {
  html: string
  text: string
  subject: string
}

/**
 * Enhanced template engine with advanced features
 */
export class TemplateEngine {
  /**
   * Process template with data, supporting advanced features
   */
  static process(template: string, data: EmailTemplateData): string {
    let result = template
    
    // 1. Process loops first ({{#each items}}...{{/each}})
    result = this.processLoops(result, data)
    
    // 2. Process conditionals ({{#if condition}}...{{/if}})
    result = this.processConditionals(result, data)
    
    // 3. Process variables ({{variable}})
    result = this.processVariables(result, data)
    
    // 4. Process formatters ({{variable|formatter}})
    result = this.processFormatters(result, data)
    
    return result
  }
  
  /**
   * Process loop structures
   */
  private static processLoops(template: string, data: EmailTemplateData): string {
    const loopRegex = /\{\{#each\s+(\w+)\}\}(.*?)\{\{\/each\}\}/gs
    
    return template.replace(loopRegex, (match, arrayName, loopContent) => {
      const array = data[arrayName] as any[]
      if (!Array.isArray(array)) return ''
      
      return array.map((item, index) => {
        let itemContent = loopContent
        
        // Replace item properties ({{this.property}})
        itemContent = itemContent.replace(/\{\{this\.(\w+)\}\}/g, (_, prop) => {
          return this.escapeHtml(item[prop] || '')
        })
        
        // Replace {{@index}}
        itemContent = itemContent.replace(/\{\{@index\}\}/g, String(index))
        
        // Replace {{@first}}, {{@last}}
        itemContent = itemContent.replace(/\{\{@first\}\}/g, String(index === 0))
        itemContent = itemContent.replace(/\{\{@last\}\}/g, String(index === array.length - 1))
        
        return itemContent
      }).join('')
    })
  }
  
  /**
   * Process conditional structures
   */
  private static processConditionals(template: string, data: EmailTemplateData): string {
    const conditionalRegex = /\{\{#if\s+(\w+)\}\}(.*?)(?:\{\{#else\}\}(.*?))?\{\{\/if\}\}/gs
    
    return template.replace(conditionalRegex, (match, condition, ifContent, elseContent = '') => {
      const value = data[condition]
      const isTrue = this.isTruthy(value)
      return isTrue ? ifContent : elseContent
    })
  }
  
  /**
   * Process simple variables
   */
  private static processVariables(template: string, data: EmailTemplateData): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = data[key]
      return this.escapeHtml(String(value || ''))
    })
  }
  
  /**
   * Process formatted variables ({{variable|formatter}})
   */
  private static processFormatters(template: string, data: EmailTemplateData): string {
    return template.replace(/\{\{(\w+)\|(\w+)\}\}/g, (match, key, formatter) => {
      const value = data[key]
      return this.applyFormatter(value, formatter)
    })
  }
  
  /**
   * Apply formatting functions
   */
  private static applyFormatter(value: any, formatter: string): string {
    switch (formatter) {
      case 'date':
        return this.formatBrazilianDate(value)
      case 'time':
        return this.formatBrazilianTime(value)
      case 'currency':
        return this.formatBrazilianCurrency(value)
      case 'cpfCnpj':
        return this.formatCpfCnpj(value)
      case 'phone':
        return this.formatPhone(value)
      case 'uppercase':
        return String(value || '').toUpperCase()
      case 'lowercase':
        return String(value || '').toLowerCase()
      case 'capitalize':
        return this.capitalize(String(value || ''))
      default:
        return this.escapeHtml(String(value || ''))
    }
  }
  
  /**
   * Format date in Brazilian format
   */
  private static formatBrazilianDate(value: any): string {
    if (!value) return ''
    const date = new Date(value)
    if (isNaN(date.getTime())) return String(value)
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  /**
   * Format time in Brazilian format
   */
  private static formatBrazilianTime(value: any): string {
    if (!value) return ''
    const date = new Date(value)
    if (isNaN(date.getTime())) return String(value)
    
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  /**
   * Format currency in Brazilian Real
   */
  private static formatBrazilianCurrency(value: any): string {
    if (!value) return 'R$ 0,00'
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return String(value)
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num)
  }
  
  /**
   * Format CPF/CNPJ
   */
  private static formatCpfCnpj(value: any): string {
    if (!value) return ''
    const str = String(value).replace(/\D/g, '')
    
    if (str.length === 11) {
      // CPF
      return str.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else if (str.length === 14) {
      // CNPJ
      return str.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
    
    return String(value)
  }
  
  /**
   * Format phone number
   */
  private static formatPhone(value: any): string {
    if (!value) return ''
    const str = String(value).replace(/\D/g, '')
    
    if (str.length === 11) {
      return str.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (str.length === 10) {
      return str.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    
    return String(value)
  }
  
  /**
   * Capitalize first letter of each word
   */
  private static capitalize(str: string): string {
    return str.replace(/\b\w/g, l => l.toUpperCase())
  }
  
  /**
   * Check if value is truthy for conditionals
   */
  private static isTruthy(value: any): boolean {
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'string') return value.trim().length > 0
    return !!value
  }
  
  /**
   * Escape HTML to prevent XSS
   */
  private static escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }
}

/**
 * Professional email template wrapper with responsive design
 */
export function createEmailTemplate(content: string, title: string = 'QueroDocumento', headerColor: string = '#1e40af'): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${title}</title>
      <style>
        /* Reset styles */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        /* Base styles */
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
          line-height: 1.6;
          color: #374151;
          background-color: #f9fafb;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        
        table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
        
        /* Container */
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        /* Header */
        .header {
          background: linear-gradient(135deg, ${headerColor} 0%, #3b82f6 50%, #60a5fa 100%);
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
          font-size: 16px;
        }
        
        .header-subtitle {
          margin: 0;
          opacity: 0.9;
          font-size: 16px;
          font-weight: 400;
        }
        
        /* Content */
        .content {
          padding: 40px 30px;
        }
        
        .content h1 {
          color: #111827;
          margin-bottom: 20px;
          font-size: 24px;
          font-weight: 700;
        }
        
        .content h2 {
          color: #374151;
          margin: 24px 0 16px 0;
          font-size: 20px;
          font-weight: 600;
        }
        
        .content h3 {
          color: #4b5563;
          margin: 20px 0 12px 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .content p {
          margin-bottom: 16px;
          color: #4b5563;
          font-size: 16px;
        }
        
        .content ul, .content ol {
          margin: 16px 0 16px 20px;
          color: #4b5563;
        }
        
        .content li {
          margin-bottom: 8px;
        }
        
        /* Buttons */
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #ea580c, #f97316);
          color: white !important;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-weight: 600;
          margin: 24px 0;
          transition: all 0.2s ease;
          font-size: 16px;
        }
        
        .button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
        }
        
        .button-secondary {
          background: linear-gradient(135deg, #6b7280, #9ca3af);
        }
        
        .button-center {
          text-align: center;
        }
        
        /* Info boxes */
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
          margin-top: 0;
        }
        
        .info-box table {
          width: 100%;
        }
        
        .info-box td {
          padding: 4px 8px 4px 0;
          vertical-align: top;
        }
        
        .info-box .label {
          font-weight: 600;
          color: #374151;
          white-space: nowrap;
          width: 40%;
        }
        
        .info-box .value {
          color: #4b5563;
        }
        
        /* Status indicators */
        .status {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin: 8px 0;
        }
        
        .status-success {
          background: #d1fae5;
          color: #047857;
        }
        
        .status-warning {
          background: #fef3c7;
          color: #92400e;
        }
        
        .status-info {
          background: #dbeafe;
          color: #1d4ed8;
        }
        
        .status-error {
          background: #fee2e2;
          color: #dc2626;
        }
        
        /* Alert boxes */
        .alert {
          border-radius: 8px;
          padding: 16px;
          margin: 24px 0;
        }
        
        .alert-success {
          background: #d1fae5;
          border: 1px solid #10b981;
        }
        
        .alert-warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
        }
        
        .alert-info {
          background: #dbeafe;
          border: 1px solid #3b82f6;
        }
        
        .alert-error {
          background: #fee2e2;
          border: 1px solid #ef4444;
        }
        
        .alert-title {
          font-weight: 600;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
        }
        
        .alert-success .alert-title { color: #059669; }
        .alert-warning .alert-title { color: #92400e; }
        .alert-info .alert-title { color: #1d4ed8; }
        .alert-error .alert-title { color: #dc2626; }
        
        .alert-text {
          font-size: 14px;
        }
        
        .alert-success .alert-text { color: #047857; }
        .alert-warning .alert-text { color: #78350f; }
        .alert-info .alert-text { color: #1e40af; }
        .alert-error .alert-text { color: #b91c1c; }
        
        /* Document list */
        .document-list {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin: 24px 0;
        }
        
        .document-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .document-item:last-child {
          border-bottom: none;
        }
        
        .document-icon {
          width: 40px;
          height: 40px;
          background: #3b82f6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          font-size: 16px;
          color: white;
          font-weight: bold;
        }
        
        .document-info h4 {
          margin: 0 0 4px 0;
          color: #111827;
          font-size: 14px;
          font-weight: 600;
        }
        
        .document-info p {
          margin: 0;
          color: #6b7280;
          font-size: 12px;
        }
        
        /* Progress indicator */
        .progress {
          display: flex;
          align-items: center;
          margin: 24px 0;
        }
        
        .progress-step {
          flex: 1;
          text-align: center;
          position: relative;
        }
        
        .progress-step::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 50%;
          height: 2px;
          background: #e5e7eb;
          z-index: 1;
        }
        
        .progress-step:first-child::before {
          display: none;
        }
        
        .progress-step.active::before {
          background: #3b82f6;
        }
        
        .progress-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #e5e7eb;
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          position: relative;
          z-index: 2;
          margin-bottom: 8px;
        }
        
        .progress-step.active .progress-circle {
          background: #3b82f6;
        }
        
        .progress-step.completed .progress-circle {
          background: #10b981;
        }
        
        .progress-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
        }
        
        .progress-step.active .progress-label {
          color: #3b82f6;
          font-weight: 600;
        }
        
        /* Footer */
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
        
        .footer-brand {
          font-weight: 600;
          color: #374151;
        }
        
        .footer-links {
          margin: 16px 0;
        }
        
        .footer-links a {
          color: #6b7280;
          text-decoration: none;
          margin: 0 8px;
          font-size: 12px;
        }
        
        .footer-links a:hover {
          color: #3b82f6;
        }
        
        .footer-copyright {
          font-size: 12px;
          color: #9ca3af;
          border-top: 1px solid #e5e7eb;
          padding-top: 16px;
          margin-top: 16px;
        }
        
        /* Dividers */
        .divider {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 32px 0;
        }
        
        /* Responsive design */
        @media only screen and (max-width: 600px) {
          .email-container { margin: 0; }
          .content, .header, .footer { padding: 20px !important; }
          .button { display: block; text-align: center; }
          .info-box { padding: 16px; }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .footer { background: #1f2937; }
          .footer, .footer p { color: #9ca3af; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">
            <span class="logo-icon">Q</span>
            QueroDocumento
          </div>
          <p class="header-subtitle">${title}</p>
        </div>
        ${content}
        <div class="footer">
          <p class="footer-brand">QueroDocumento</p>
          <p>Consulta e Certidão de Protesto com Segurança e Agilidade</p>
          <p>📞 Atendimento via WhatsApp - Resposta em até 2 horas úteis</p>
          
          <div class="footer-links">
            <a href="${process.env.NEXTAUTH_URL}/politica-de-privacidade">Política de Privacidade</a>
            <a href="${process.env.NEXTAUTH_URL}/termos-de-uso">Termos de Uso</a>
            <a href="${process.env.NEXTAUTH_URL}/fale-conosco">Suporte</a>
          </div>
          
          <div class="footer-copyright">
            © ${new Date().getFullYear()} QueroDocumento. Todos os direitos reservados.<br>
            CNPJ: 62.757.039/0001-05<br>
            Esta é uma comunicação automática. Em caso de dúvidas, entre em contato conosco.
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Create plain text version of email
 */
export function createTextTemplate(content: string, title: string = 'QueroDocumento'): string {
  // Remove HTML tags and format for plain text
  const plainContent = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .replace(/\n\s*\n/g, '\n\n') // Multiple newlines to double
    .trim()

  return `
QUERODOCUMENTO - ${title.toUpperCase()}
${'='.repeat(50)}

${plainContent}

${'='.repeat(50)}
QueroDocumento - Consulta e Certidão de Protesto
📞 Atendimento via WhatsApp - Resposta em até 2 horas úteis

Acesse: ${process.env.NEXTAUTH_URL}

© ${new Date().getFullYear()} QueroDocumento. Todos os direitos reservados.
CNPJ: 62.757.039/0001-05
Esta é uma comunicação automática. Em caso de dúvidas, entre em contato.
  `.trim()
}