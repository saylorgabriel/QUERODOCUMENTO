/**
 * MailHog Email Provider Implementation
 * For development and testing purposes
 */

import { MailHogConfig } from '../email-config'

export interface MailHogTransporter {
  sendMail(options: MailHogMailOptions): Promise<MailHogSendResult>
  verify(): Promise<boolean>
}

interface MailHogMailOptions {
  from: string
  to: string | string[]
  subject: string
  text?: string
  html?: string
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>
  headers?: Record<string, string>
}

interface MailHogSendResult {
  messageId: string
  envelope: {
    from: string
    to: string[]
  }
  accepted: string[]
  rejected: string[]
  response: string
}

interface MailHogProviderResponse {
  success: boolean
  messageId?: string
  error?: string
  accepted?: string[]
  rejected?: string[]
}

export class MailHogProvider {
  private transporter: MailHogTransporter | null = null
  
  constructor(private config: MailHogConfig) {
    this.initializeTransporter()
  }
  
  private initializeTransporter() {
    try {
      // Dynamic import to avoid bundling if not used
      const nodemailer = require('nodemailer')
      
      // MailHog SMTP configuration
      this.transporter = nodemailer.createTransporter({
        host: this.config.host,
        port: this.config.port,
        secure: false, // MailHog doesn't use SSL/TLS
        auth: false,   // MailHog doesn't require authentication
        ignoreTLS: true,
        // Development-friendly settings
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 5000,    // 5 seconds
        socketTimeout: 10000,     // 10 seconds
        debug: true,
        logger: true,
      })
    } catch (error) {
      console.error('Failed to initialize MailHog transporter:', error)
      this.transporter = null
    }
  }
  
  async sendEmail({
    to,
    from,
    subject,
    html,
    text,
    attachments = [],
    metadata = {},
  }: {
    to: string | string[]
    from: string
    subject: string
    html?: string
    text?: string
    attachments?: Array<{
      content: Buffer
      filename: string
      contentType: string
    }>
    metadata?: Record<string, string>
  }): Promise<MailHogProviderResponse> {
    if (!this.transporter) {
      return {
        success: false,
        error: 'MailHog transporter not initialized',
      }
    }
    
    try {
      const fromAddress = this.config.fromName 
        ? `${this.config.fromName} <${from}>`
        : from
      
      const mailOptions: MailHogMailOptions = {
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject: `[DEV] ${subject}`,
        text,
        html,
      }
      
      // Add development notice to emails
      if (html) {
        mailOptions.html = this.addDevelopmentNotice(html)
      }
      
      if (text) {
        mailOptions.text = `[DESENVOLVIMENTO] Este é um email de teste.\n\n${text}`
      }
      
      // Add attachments if provided
      if (attachments.length > 0) {
        mailOptions.attachments = attachments.map(attachment => ({
          filename: attachment.filename,
          content: attachment.content,
          contentType: attachment.contentType,
        }))
      }
      
      // Add metadata and development info as headers
      mailOptions.headers = {
        'X-Environment': 'development',
        'X-Mailer': 'MailHog Provider',
        'X-Development-Notice': 'This email was sent via MailHog for testing',
        ...Object.entries(metadata).reduce((acc, [key, value]) => {
          acc[`X-Metadata-${key}`] = value
          return acc
        }, {} as Record<string, string>),
      }
      
      const result = await this.transporter.sendMail(mailOptions)
      
      // Log email details for development
      console.log('📧 MailHog Email Sent:', {
        to: mailOptions.to,
        subject: mailOptions.subject,
        messageId: result.messageId,
        viewUrl: `http://${this.config.host}:8025`, // MailHog web UI
      })
      
      return {
        success: true,
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected,
      }
    } catch (error: any) {
      console.error('MailHog send error:', error)
      
      let errorMessage = 'MailHog error'
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage = `Cannot connect to MailHog at ${this.config.host}:${this.config.port}. Make sure MailHog is running.`
      } else {
        errorMessage = error.message || 'Unknown MailHog error'
      }
      
      return {
        success: false,
        error: errorMessage,
      }
    }
  }
  
  private addDevelopmentNotice(html: string): string {
    const devNotice = `
      <div style="background: #fee2e2; border: 2px solid #fca5a5; padding: 16px; margin-bottom: 20px; border-radius: 8px; color: #991b1b;">
        <strong>🚧 AMBIENTE DE DESENVOLVIMENTO 🚧</strong><br>
        Este email foi enviado através do MailHog para fins de teste e desenvolvimento.<br>
        <strong>Este email não seria enviado em produção.</strong><br>
        <small>Visualizar no MailHog: <a href="http://${this.config.host}:8025" target="_blank">http://${this.config.host}:8025</a></small>
      </div>
    `
    
    // Insert the notice after the opening body tag, or at the beginning if no body tag
    if (html.includes('<body')) {
      return html.replace(/(<body[^>]*>)/i, `$1${devNotice}`)
    } else {
      return devNotice + html
    }
  }
  
  async verifyConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.transporter) {
      return { success: false, error: 'MailHog transporter not initialized' }
    }
    
    try {
      // For MailHog, we just need to check if we can connect to the host
      const verified = await this.transporter.verify()
      
      if (verified) {
        console.log(`✅ MailHog connection verified at ${this.config.host}:${this.config.port}`)
        console.log(`📱 Web UI available at: http://${this.config.host}:8025`)
      }
      
      return { success: verified }
    } catch (error: any) {
      console.error('MailHog connection verification failed:', error)
      
      let errorMessage = 'MailHog connection failed'
      
      if (error.code === 'ECONNREFUSED') {
        errorMessage = `MailHog is not running at ${this.config.host}:${this.config.port}. Please start MailHog or check your configuration.`
      } else {
        errorMessage = error.message || 'MailHog verification error'
      }
      
      return {
        success: false,
        error: errorMessage,
      }
    }
  }
  
  async getDeliveryStatus(messageId: string): Promise<{
    success: boolean
    status?: string
    delivered?: boolean
    bounced?: boolean
    opened?: boolean
    clicked?: boolean
    error?: string
  }> {
    // MailHog captures all emails, so they're always "delivered" to the UI
    return {
      success: true,
      status: 'delivered',
      delivered: true,
      bounced: false,
      opened: false, // MailHog doesn't track opens
      clicked: false, // MailHog doesn't track clicks
    }
  }
  
  getSupportedFeatures() {
    return {
      attachments: true,
      templates: false,
      bulkEmail: true,
      tracking: false,
      analytics: false,
      webhooks: false,
      scheduling: false,
      webUI: true, // Unique to MailHog
    }
  }
  
  getProviderInfo() {
    return {
      name: 'MailHog',
      version: '1.x',
      description: 'MailHog email testing tool for development',
      website: 'https://github.com/mailhog/MailHog',
      documentation: 'https://github.com/mailhog/MailHog/blob/master/docs/CONFIG.md',
      webUI: `http://${this.config.host}:8025`,
    }
  }
  
  /**
   * Get MailHog installation instructions
   */
  static getInstallationInstructions() {
    return {
      docker: {
        command: 'docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog',
        description: 'Run MailHog in Docker container',
      },
      dockerCompose: {
        service: `
mailhog:
  image: mailhog/mailhog:latest
  container_name: mailhog
  ports:
    - "1025:1025"  # SMTP port
    - "8025:8025"  # Web UI port
  networks:
    - app-network
        `,
        description: 'Add to docker-compose.yml',
      },
      binary: {
        download: 'https://github.com/mailhog/MailHog/releases',
        description: 'Download binary and run ./MailHog',
      },
      homebrew: {
        command: 'brew install mailhog && mailhog',
        description: 'Install via Homebrew (macOS)',
      },
    }
  }
  
  /**
   * Get development tips
   */
  static getDevelopmentTips() {
    return [
      'MailHog captures all outgoing emails in development',
      'Access the web UI at http://localhost:8025 to view emails',
      'No authentication required - all emails are caught',
      'Perfect for testing email workflows without sending real emails',
      'Supports attachments and HTML emails',
      'Can simulate different email scenarios for testing',
    ]
  }
}