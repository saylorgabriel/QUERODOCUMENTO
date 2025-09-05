/**
 * SendGrid Email Provider Implementation
 */

import { SendGridConfig } from '../email-config'

export interface SendGridClient {
  send(data: SendGridEmailData): Promise<[any, any]>
}

interface SendGridEmailData {
  to: string | string[]
  from: {
    email: string
    name?: string
  }
  subject: string
  html?: string
  text?: string
  attachments?: Array<{
    content: string
    filename: string
    type?: string
    disposition?: string
  }>
  customArgs?: Record<string, string>
  trackingSettings?: {
    clickTracking?: { enable: boolean }
    openTracking?: { enable: boolean }
  }
}

interface SendGridResponse {
  success: boolean
  messageId?: string
  error?: string
  statusCode?: number
}

export class SendGridProvider {
  private client: SendGridClient | null = null
  
  constructor(private config: SendGridConfig) {
    this.initializeClient()
  }
  
  private initializeClient() {
    try {
      // Dynamic import to avoid bundling if not used
      const sgMail = require('@sendgrid/mail')
      sgMail.setApiKey(this.config.apiKey)
      this.client = sgMail
    } catch (error) {
      console.error('Failed to initialize SendGrid client:', error)
      this.client = null
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
  }): Promise<SendGridResponse> {
    if (!this.client) {
      return {
        success: false,
        error: 'SendGrid client not initialized',
      }
    }
    
    try {
      const emailData: SendGridEmailData = {
        to: Array.isArray(to) ? to : [to],
        from: {
          email: from,
          name: this.config.fromName,
        },
        subject,
        html,
        text,
        customArgs: metadata,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true },
        },
      }
      
      // Convert attachments to SendGrid format
      if (attachments.length > 0) {
        emailData.attachments = attachments.map(attachment => ({
          content: attachment.content.toString('base64'),
          filename: attachment.filename,
          type: attachment.contentType,
          disposition: 'attachment',
        }))
      }
      
      const [response] = await this.client.send(emailData)
      
      return {
        success: true,
        messageId: response?.headers?.['x-message-id'] || 'unknown',
        statusCode: response?.statusCode,
      }
    } catch (error: any) {
      console.error('SendGrid send error:', error)
      
      let errorMessage = 'Unknown error'
      let statusCode: number | undefined
      
      if (error.response) {
        statusCode = error.response.status
        errorMessage = error.response.body?.errors?.[0]?.message || error.message
      } else {
        errorMessage = error.message
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
      return { success: false, error: 'SendGrid client not initialized' }
    }
    
    try {
      // Test with a minimal email to verify API key and configuration
      const testEmail: SendGridEmailData = {
        to: 'test@example.com',
        from: {
          email: 'test@example.com',
          name: this.config.fromName,
        },
        subject: 'Connection Test',
        text: 'This is a test email to verify SendGrid connection.',
      }
      
      // Use SendGrid's validation mode (sandbox mode) if available
      const response = await this.client.send({
        ...testEmail,
        // @ts-ignore - SendGrid specific property
        mailSettings: {
          sandboxMode: { enable: true },
        },
      })
      
      return { success: true }
    } catch (error: any) {
      console.error('SendGrid connection test failed:', error)
      return {
        success: false,
        error: error.response?.body?.errors?.[0]?.message || error.message,
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
    // SendGrid Event Webhook would typically handle this
    // This is a placeholder for future webhook integration
    return {
      success: false,
      error: 'Delivery status tracking requires webhook integration',
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
    }
  }
  
  getProviderInfo() {
    return {
      name: 'SendGrid',
      version: '7.x',
      description: 'SendGrid Email API v3',
      website: 'https://sendgrid.com',
      documentation: 'https://docs.sendgrid.com/api-reference/mail-send/mail-send',
    }
  }
}