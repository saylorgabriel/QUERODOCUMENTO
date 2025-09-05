/**
 * Email Template Helpers
 * Convenience functions for sending common email types with proper data formatting
 */

import { sendEmail, EmailMessage } from './email-service'
import { getEmailTemplate, EmailTemplateData } from './templates'

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(userData: {
  name: string
  email: string
  createdAt?: Date
}) {
  const templateData: EmailTemplateData = {
    name: userData.name,
    email: userData.email,
    createdAt: userData.createdAt || new Date(),
    dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`
  }

  const template = getEmailTemplate('welcome', templateData)
  
  const message: EmailMessage = {
    to: userData.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
    metadata: {
      template: 'welcome',
      userId: userData.email,
      category: 'user-onboarding'
    }
  }

  return await sendEmail(message)
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(orderData: {
  customerName: string
  customerEmail: string
  orderNumber: string
  serviceType: string
  amount?: string | number
  requiresPayment?: boolean
  isPIX?: boolean
  isCreditCard?: boolean
  documents?: Array<{ name: string; type: string }>
}) {
  const templateData: EmailTemplateData = {
    name: orderData.customerName,
    email: orderData.customerEmail,
    orderNumber: orderData.orderNumber,
    serviceType: orderData.serviceType,
    amount: orderData.amount,
    requiresPayment: orderData.requiresPayment,
    isPIX: orderData.isPIX,
    isCreditCard: orderData.isCreditCard,
    documents: orderData.documents,
    createdAt: new Date(),
    dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`
  }

  const template = getEmailTemplate('order-confirmation', templateData)
  
  const message: EmailMessage = {
    to: orderData.customerEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
    metadata: {
      template: 'order-confirmation',
      orderId: orderData.orderNumber,
      category: 'order-management'
    }
  }

  return await sendEmail(message)
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(paymentData: {
  customerName: string
  customerEmail: string
  orderNumber: string
  amount: string | number
  paymentMethod: string
  isPIX?: boolean
  isCreditCard?: boolean
}) {
  const templateData: EmailTemplateData = {
    name: paymentData.customerName,
    orderNumber: paymentData.orderNumber,
    amount: paymentData.amount,
    paymentMethod: paymentData.paymentMethod,
    isPIX: paymentData.isPIX,
    isCreditCard: paymentData.isCreditCard,
    createdAt: new Date(),
    dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`
  }

  const template = getEmailTemplate('payment-confirmed', templateData)
  
  const message: EmailMessage = {
    to: paymentData.customerEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
    metadata: {
      template: 'payment-confirmed',
      orderId: paymentData.orderNumber,
      category: 'payment-processing'
    }
  }

  return await sendEmail(message)
}

/**
 * Send order processing update email
 */
export async function sendOrderProcessingEmail(processingData: {
  customerName: string
  customerEmail: string
  orderNumber: string
  serviceType: string
  orderStatus: string
  hasProtests?: boolean
  protests?: Array<{
    date: string
    value: string
    creditor: string
    notary: string
  }>
  dueDate?: Date
}) {
  const templateData: EmailTemplateData = {
    name: processingData.customerName,
    orderNumber: processingData.orderNumber,
    serviceType: processingData.serviceType,
    orderStatus: processingData.orderStatus,
    hasProtests: processingData.hasProtests,
    protests: processingData.protests,
    dueDate: processingData.dueDate,
    createdAt: new Date(),
    dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`
  }

  const template = getEmailTemplate('order-processing', templateData)
  
  const message: EmailMessage = {
    to: processingData.customerEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
    metadata: {
      template: 'order-processing',
      orderId: processingData.orderNumber,
      category: 'order-updates'
    }
  }

  return await sendEmail(message)
}

/**
 * Send quote ready email
 */
export async function sendQuoteReadyEmail(quoteData: {
  customerName: string
  customerEmail: string
  orderNumber: string
  serviceType: string
  amount: string | number
  hasProtests?: boolean
  protests?: Array<{
    date: string
    value: string
    creditor: string
    notary: string
  }>
  expiresAt?: Date
}) {
  const templateData: EmailTemplateData = {
    name: quoteData.customerName,
    orderNumber: quoteData.orderNumber,
    serviceType: quoteData.serviceType,
    amount: quoteData.amount,
    hasProtests: quoteData.hasProtests,
    protests: quoteData.protests,
    expiresAt: quoteData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`
  }

  const template = getEmailTemplate('quote-ready', templateData)
  
  const message: EmailMessage = {
    to: quoteData.customerEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
    metadata: {
      template: 'quote-ready',
      orderId: quoteData.orderNumber,
      category: 'quote-management'
    }
  }

  return await sendEmail(message)
}

/**
 * Send order completed email
 */
export async function sendOrderCompletedEmail(completionData: {
  customerName: string
  customerEmail: string
  orderNumber: string
  serviceType: string
  downloadUrl?: string
  hasProtests?: boolean
  protests?: Array<{
    date: string
    value: string
    creditor: string
    notary: string
  }>
  documents?: Array<{
    name: string
    type: string
    url?: string
    size?: string
  }>
  expiresAt?: Date
}) {
  const templateData: EmailTemplateData = {
    name: completionData.customerName,
    orderNumber: completionData.orderNumber,
    serviceType: completionData.serviceType,
    downloadUrl: completionData.downloadUrl,
    hasProtests: completionData.hasProtests,
    protests: completionData.protests,
    documents: completionData.documents,
    expiresAt: completionData.expiresAt,
    createdAt: new Date(),
    dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`
  }

  const template = getEmailTemplate('order-completed', templateData)
  
  const message: EmailMessage = {
    to: completionData.customerEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
    metadata: {
      template: 'order-completed',
      orderId: completionData.orderNumber,
      category: 'order-completion'
    }
  }

  return await sendEmail(message)
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(resetData: {
  name: string
  email: string
  resetUrl: string
}) {
  const templateData: EmailTemplateData = {
    name: resetData.name,
    email: resetData.email,
    resetUrl: resetData.resetUrl,
    createdAt: new Date()
  }

  const template = getEmailTemplate('password-reset', templateData)
  
  const message: EmailMessage = {
    to: resetData.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
    metadata: {
      template: 'password-reset',
      userId: resetData.email,
      category: 'security'
    },
    priority: 'high' // Security-related emails have high priority
  }

  return await sendEmail(message)
}

/**
 * Send generic status update email
 */
export async function sendStatusUpdateEmail(updateData: {
  customerName: string
  customerEmail: string
  orderNumber?: string
  orderStatus?: string
  previousStatus?: string
  message?: string
  nextSteps?: string[]
  requiresAction?: boolean
  actionRequired?: string
  actionUrl?: string
  documents?: Array<{
    name: string
    type: string
    status: string
    url?: string
  }>
  estimatedTime?: string
  additionalInfo?: string
  downloadUrl?: string
}) {
  const templateData: EmailTemplateData = {
    name: updateData.customerName,
    orderNumber: updateData.orderNumber,
    orderStatus: updateData.orderStatus,
    previousStatus: updateData.previousStatus,
    message: updateData.message,
    nextSteps: updateData.nextSteps,
    requiresAction: updateData.requiresAction,
    actionRequired: updateData.actionRequired,
    actionUrl: updateData.actionUrl,
    documents: updateData.documents,
    estimatedTime: updateData.estimatedTime,
    additionalInfo: updateData.additionalInfo,
    downloadUrl: updateData.downloadUrl,
    createdAt: new Date(),
    dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`
  }

  const template = getEmailTemplate('status-update', templateData)
  
  const message: EmailMessage = {
    to: updateData.customerEmail,
    subject: template.subject,
    html: template.html,
    text: template.text,
    metadata: {
      template: 'status-update',
      orderId: updateData.orderNumber || 'system',
      category: 'status-updates'
    }
  }

  return await sendEmail(message)
}

/**
 * Batch send emails with rate limiting
 */
export async function batchSendEmails(emails: Array<{
  type: 'welcome' | 'order-confirmation' | 'payment-confirmed' | 'order-processing' | 'quote-ready' | 'order-completed' | 'password-reset' | 'status-update'
  data: any
}>, options: {
  delayBetweenEmails?: number // milliseconds
  maxConcurrent?: number
} = {}) {
  const { delayBetweenEmails = 100, maxConcurrent = 5 } = options
  const results = []
  
  // Process in batches
  for (let i = 0; i < emails.length; i += maxConcurrent) {
    const batch = emails.slice(i, i + maxConcurrent)
    
    const batchPromises = batch.map(async (emailConfig) => {
      try {
        switch (emailConfig.type) {
          case 'welcome':
            return await sendWelcomeEmail(emailConfig.data)
          case 'order-confirmation':
            return await sendOrderConfirmationEmail(emailConfig.data)
          case 'payment-confirmed':
            return await sendPaymentConfirmationEmail(emailConfig.data)
          case 'order-processing':
            return await sendOrderProcessingEmail(emailConfig.data)
          case 'quote-ready':
            return await sendQuoteReadyEmail(emailConfig.data)
          case 'order-completed':
            return await sendOrderCompletedEmail(emailConfig.data)
          case 'password-reset':
            return await sendPasswordResetEmail(emailConfig.data)
          case 'status-update':
            return await sendStatusUpdateEmail(emailConfig.data)
          default:
            throw new Error(`Unsupported email type: ${emailConfig.type}`)
        }
      } catch (error) {
        console.error(`Failed to send ${emailConfig.type} email:`, error)
        return { success: false, error: error.message }
      }
    })
    
    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
    
    // Add delay between batches
    if (i + maxConcurrent < emails.length && delayBetweenEmails > 0) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenEmails))
    }
  }
  
  return results
}