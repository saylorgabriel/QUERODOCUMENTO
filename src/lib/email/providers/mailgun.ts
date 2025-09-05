/**
 * Mailgun Email Provider Implementation
 */

import { MailgunConfig } from '../email-config'

export interface MailgunClient {
  messages: {
    create(domain: string, data: MailgunMessageData): Promise<MailgunResponse>
  }
}

interface MailgunMessageData {
  from: string
  to: string | string[]
  subject: string
  text?: string
  html?: string
  attachment?: any[]
  'o:tracking'?: boolean
  'o:tracking-clicks'?: boolean
  'o:tracking-opens'?: boolean
  'v:metadata'?: string
  [key: string]: any
}

interface MailgunResponse {
  status: number
  message: string
  id: string
}

interface MailgunProviderResponse {
  success: boolean
  messageId?: string
  error?: string
  statusCode?: number
}

export class MailgunProvider {
  private client: MailgunClient | null = null
  
  constructor(private config: MailgunConfig) {
    this.initializeClient()
  }
  
  private initializeClient() {
    try {
      // Dynamic import to avoid bundling if not used
      const Mailgun = require('mailgun.js')
      const formData = require('form-data')
      
      const mailgun = new Mailgun(formData)
      this.client = mailgun.client({
        username: 'api',
        key: this.config.apiKey,
        url: this.getMailgunUrl(),
      })
    } catch (error) {
      console.error('Failed to initialize Mailgun client:', error)
      this.client = null
    }
  }
  
  private getMailgunUrl(): string {
    // Support for EU region
    if (this.config.host?.includes('eu')) {
      return 'https://api.eu.mailgun.net'
    }
    return 'https://api.mailgun.net'
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
  }): Promise<MailgunProviderResponse> {
    if (!this.client) {
      return {
        success: false,
        error: 'Mailgun client not initialized',
      }
    }
    
    try {
      const fromAddress = this.config.fromName 
        ? `${this.config.fromName} <${from}>`
        : from
      
      const messageData: MailgunMessageData = {
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject,
        'o:tracking': true,
        'o:tracking-clicks': true,
        'o:tracking-opens': true,
      }
      
      if (html) messageData.html = html
      if (text) messageData.text = text
      
      // Add metadata as custom variables
      if (Object.keys(metadata).length > 0) {
        messageData['v:metadata'] = JSON.stringify(metadata)
      }
      
      // Convert attachments to Mailgun format
      if (attachments.length > 0) {
        messageData.attachment = attachments.map(attachment => ({
          data: attachment.content,
          filename: attachment.filename,
          contentType: attachment.contentType,
        }))
      }
      
      const response = await this.client.messages.create(this.config.domain, messageData)
      
      return {
        success: true,
        messageId: response.id,
        statusCode: response.status,
      }
    } catch (error: any) {
      console.error('Mailgun send error:', error)
      
      let errorMessage = 'Unknown error'
      let statusCode: number | undefined
      
      if (error.status) {
        statusCode = error.status
        errorMessage = error.message || error.details || 'Mailgun API error'
      } else {
        errorMessage = error.message || 'Network error'
      }
      
      return {
        success: false,
        error: errorMessage,
        statusCode,
      }
    }
  }
  
  async verifyConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.client) {
      return { success: false, error: 'Mailgun client not initialized' }
    }
    
    try {
      // Test connection by attempting to create a test message
      const testData: MailgunMessageData = {
        from: `Test <test@${this.config.domain}>`,
        to: 'test@example.com',
        subject: 'Connection Test',
        text: 'This is a test email to verify Mailgun connection.',
        'o:testmode': true, // Mailgun test mode
      }
      
      await this.client.messages.create(this.config.domain, testData)
      return { success: true }
    } catch (error: any) {
      console.error('Mailgun connection test failed:', error)
      return {
        success: false,
        error: error.message || 'Connection test failed',
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
    if (!this.client) {
      return {
        success: false,
        error: 'Mailgun client not initialized',
      }
    }
    
    try {
      // This would require implementing Mailgun Events API
      // For now, return placeholder response
      return {
        success: false,
        error: 'Delivery status tracking requires Events API integration',
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get delivery status',
      }
    }
  }
  
  getSupportedFeatures() {
    return {
      attachments: true,
      templates: true,
      bulkEmail: true,
      tracking: true,
      analytics: true,
      webhooks: true,
      scheduling: true,
      testMode: true,
    }
  }
  
  getProviderInfo() {
    return {
      name: 'Mailgun',
      version: '4.x',
      description: 'Mailgun Email API',
      website: 'https://www.mailgun.com',
      documentation: 'https://documentation.mailgun.com/en/latest/api-sending.html',
    }
  }
}