/**
 * Resend Email Provider Implementation
 */

import { ResendConfig } from '../email-config'

interface ResendClient {
  emails: {
    send(data: ResendEmailData): Promise<ResendResponse>
  }
}

interface ResendEmailData {
  from: string
  to: string | string[]
  subject: string
  html?: string
  text?: string
  attachments?: Array<{
    content: string
    filename: string
    type?: string
  }>
  headers?: Record<string, string>
}

interface ResendResponse {
  id: string
  from: string
  to: string[]
  created_at: string
}

export interface ResendProviderResponse {
  success: boolean
  messageId?: string
  error?: string
  statusCode?: number
}

export class ResendProvider {
  private client: ResendClient | null = null
  private config: ResendConfig

  constructor(config: ResendConfig) {
    this.config = config
    this.initializeClient()
  }

  private async initializeClient() {
    try {
      // Import Resend client dynamically to avoid bundling if not used
      const { Resend } = await import('resend')
      this.client = new Resend(this.config.apiKey)
      console.log('✅ Resend client initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Resend client:', error)
      throw error
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
  }): Promise<ResendProviderResponse> {
    if (!this.client) {
      return {
        success: false,
        error: 'Resend client not initialized',
      }
    }
    
    try {
      const fromAddress = this.config.fromName 
        ? `${this.config.fromName} <${from}>`
        : from
      
      const emailData: ResendEmailData = {
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
        headers: {
          ...metadata
        }
      }

      // Convert attachments if provided
      if (attachments && attachments.length > 0) {
        emailData.attachments = attachments.map(attachment => ({
          content: attachment.content.toString('base64'),
          filename: attachment.filename,
          type: attachment.contentType
        }))
      }

      const result = await this.client.emails.send(emailData)

      return {
        success: true,
        messageId: result.id,
      }
    } catch (error: any) {
      console.error('❌ Resend send error:', error)
      
      const errorMessage = error?.message || 'Unknown error occurred'
      const statusCode = error?.statusCode || error?.status || 500
      
      return {
        success: false,
        error: errorMessage,
        statusCode,
      }
    }
  }
  
  async verifyConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.client) {
      return { success: false, error: 'Resend client not initialized' }
    }
    
    try {
      // Test connection by attempting to get API info
      // Resend doesn't have a specific test endpoint, so we'll assume connection is OK if client is initialized
      return { success: true }
    } catch (error: any) {
      console.error('Resend connection test failed:', error)
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
    // Resend doesn't provide delivery status API yet
    // Return a basic response indicating we can't track status
    return {
      success: false,
      error: 'Delivery status tracking not available with Resend'
    }
  }
}