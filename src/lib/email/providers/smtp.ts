/**
 * SMTP Email Provider Implementation
 * Generic SMTP support for any email service
 */

import { SMTPConfig } from '../email-config'

export interface SMTPTransporter {
  sendMail(options: SMTPMailOptions): Promise<SMTPSendResult>
  verify(): Promise<boolean>
}

interface SMTPMailOptions {
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

interface SMTPSendResult {
  messageId: string
  envelope: {
    from: string
    to: string[]
  }
  accepted: string[]
  rejected: string[]
  pending: string[]
  response: string
}

interface SMTPProviderResponse {
  success: boolean
  messageId?: string
  error?: string
  accepted?: string[]
  rejected?: string[]
}

export class SMTPProvider {
  private transporter: SMTPTransporter | null = null
  
  constructor(private config: SMTPConfig) {
    this.initializeTransporter()
  }
  
  private initializeTransporter() {
    try {
      // Dynamic import to avoid bundling if not used
      const nodemailer = require('nodemailer')
      
      this.transporter = nodemailer.createTransporter({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure, // true for 465, false for other ports
        auth: {
          user: this.config.auth.user,
          pass: this.config.auth.pass,
        },
        // Additional SMTP options
        connectionTimeout: 60000, // 60 seconds
        greetingTimeout: 30000,   // 30 seconds
        socketTimeout: 60000,     // 60 seconds
        // Enable debug if in development
        debug: process.env.NODE_ENV === 'development',
        logger: process.env.NODE_ENV === 'development',
      })
    } catch (error) {
      console.error('Failed to initialize SMTP transporter:', error)
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
  }): Promise<SMTPProviderResponse> {
    if (!this.transporter) {
      return {
        success: false,
        error: 'SMTP transporter not initialized',
      }
    }
    
    try {
      const fromAddress = this.config.fromName 
        ? `${this.config.fromName} <${from}>`
        : from
      
      const mailOptions: SMTPMailOptions = {
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject,
        text,
        html,
      }
      
      // Add attachments if provided
      if (attachments.length > 0) {
        mailOptions.attachments = attachments.map(attachment => ({
          filename: attachment.filename,
          content: attachment.content,
          contentType: attachment.contentType,
        }))
      }
      
      // Add metadata as custom headers
      if (Object.keys(metadata).length > 0) {
        mailOptions.headers = {}
        Object.entries(metadata).forEach(([key, value]) => {
          mailOptions.headers![`X-Metadata-${key}`] = value
        })
      }
      
      const result = await this.transporter.sendMail(mailOptions)
      
      return {
        success: true,
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected,
      }
    } catch (error: any) {
      console.error('SMTP send error:', error)
      
      let errorMessage = 'Unknown SMTP error'
      
      if (error.code) {
        switch (error.code) {
          case 'ECONNECTION':
            errorMessage = 'Connection failed to SMTP server'
            break
          case 'EAUTH':
            errorMessage = 'Authentication failed'
            break
          case 'EMESSAGE':
            errorMessage = 'Message rejected by server'
            break
          case 'EENVELOPE':
            errorMessage = 'Invalid envelope'
            break
          default:
            errorMessage = error.message || 'SMTP error occurred'
        }
      } else {
        errorMessage = error.message || 'Network error'
      }
      
      return {
        success: false,
        error: errorMessage,
      }
    }
  }
  
  async verifyConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.transporter) {
      return { success: false, error: 'SMTP transporter not initialized' }
    }
    
    try {
      const verified = await this.transporter.verify()
      return { success: verified }
    } catch (error: any) {
      console.error('SMTP connection verification failed:', error)
      
      let errorMessage = 'Connection verification failed'
      
      if (error.code) {
        switch (error.code) {
          case 'ECONNECTION':
            errorMessage = 'Cannot connect to SMTP server'
            break
          case 'EAUTH':
            errorMessage = 'SMTP authentication failed'
            break
          case 'ESECURITY':
            errorMessage = 'Security requirements not met'
            break
          default:
            errorMessage = error.message || 'SMTP verification error'
        }
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
    // SMTP doesn't provide delivery status tracking by default
    // Would need to implement bounce handling or use additional services
    return {
      success: false,
      error: 'SMTP delivery status tracking not available without additional services',
    }
  }
  
  getSupportedFeatures() {
    return {
      attachments: true,
      templates: false, // Depends on server
      bulkEmail: true,
      tracking: false,  // Not built-in
      analytics: false, // Not built-in
      webhooks: false,  // Not built-in
      scheduling: false, // Not built-in
    }
  }
  
  getProviderInfo() {
    return {
      name: 'SMTP',
      version: 'Generic',
      description: 'Generic SMTP email provider using Nodemailer',
      website: 'https://nodemailer.com',
      documentation: 'https://nodemailer.com/smtp/',
    }
  }
  
  /**
   * Test SMTP configuration with common providers
   */
  static getCommonConfigurations() {
    return {
      gmail: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        note: 'Requires App Password for 2FA accounts',
      },
      outlook: {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        note: 'Use full email as username',
      },
      yahoo: {
        host: 'smtp.mail.yahoo.com',
        port: 587,
        secure: false,
        note: 'Requires App Password',
      },
      zoho: {
        host: 'smtp.zoho.com',
        port: 587,
        secure: false,
        note: 'Professional email service',
      },
      ses: {
        host: 'email-smtp.us-east-1.amazonaws.com',
        port: 587,
        secure: false,
        note: 'Amazon SES - change region as needed',
      },
    }
  }
}