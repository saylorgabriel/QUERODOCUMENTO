/**
 * Email service exports
 * Main entry point for email functionality
 */

// Core email service
export { EmailService } from './email-service'

// Template functions
export {
  getEmailTemplate,
  getAvailableTemplates,
  getTemplateMetadata,
  getLegacyWelcomeTemplate,
  getLegacyOrderConfirmationTemplate,
  getLegacyOrderCompletedTemplate,
  getLegacyPaymentConfirmationTemplate,
  getLegacyPasswordResetTemplate
} from './templates'

// Template types
export type { EmailTemplateData, EmailTemplate } from './templates/base'

// Email helper functions
import { EmailService } from './email-service'
import { getEmailTemplate } from './templates'

const emailService = new EmailService()

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(data: {
  to: string
  name: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const template = getEmailTemplate('welcome', {
      name: data.name,
      email: data.to,
      dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
      createdAt: new Date().toISOString()
    })

    const result = await emailService.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text
    })

    return { success: result.success, error: result.error }
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return { success: false, error: (error as any).message }
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(data: {
  to: string
  userName: string
  orderNumber: string
  serviceType: string
  amount?: number
  requiresPayment?: boolean
}): Promise<{ success: boolean; error?: string }> {
  try {
    const template = getEmailTemplate('order-confirmation', {
      name: data.userName,
      email: data.to,
      orderNumber: data.orderNumber,
      serviceType: data.serviceType,
      amount: data.amount,
      requiresPayment: data.requiresPayment,
      dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`
    })

    const result = await emailService.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text
    })

    return { success: result.success, error: result.error }
  } catch (error) {
    console.error('Failed to send order confirmation email:', error)
    return { success: false, error: (error as any).message }
  }
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(data: {
  to: string
  userName: string
  orderNumber: string
  amount: number
  paymentMethod: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const template = getEmailTemplate('payment-confirmed', {
      name: data.userName,
      email: data.to,
      orderNumber: data.orderNumber,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`
    })

    const result = await emailService.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text
    })

    return { success: result.success, error: result.error }
  } catch (error) {
    console.error('Failed to send payment confirmation email:', error)
    return { success: false, error: (error as any).message }
  }
}

/**
 * Send order status update email
 */
export async function sendOrderStatusEmail(data: {
  to: string
  userName: string
  orderNumber: string
  status: string
  statusMessage: string
  orderUrl?: string
  nextSteps?: string[]
}): Promise<{ success: boolean; error?: string }> {
  try {
    const template = getEmailTemplate('status-update', {
      name: data.userName,
      email: data.to,
      orderNumber: data.orderNumber,
      orderStatus: data.status,
      message: data.statusMessage,
      nextSteps: data.nextSteps,
      actionUrl: data.orderUrl,
      dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`
    })

    const result = await emailService.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text
    })

    return { success: result.success, error: result.error }
  } catch (error) {
    console.error('Failed to send order status email:', error)
    return { success: false, error: (error as any).message }
  }
}

/**
 * Send order completion email
 */
export async function sendOrderCompletionEmail(data: {
  to: string
  userName: string
  orderNumber: string
  downloadUrl: string
  serviceType?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const template = getEmailTemplate('order-completed', {
      name: data.userName,
      email: data.to,
      orderNumber: data.orderNumber,
      downloadUrl: data.downloadUrl,
      serviceType: data.serviceType,
      dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`
    })

    const result = await emailService.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text
    })

    return { success: result.success, error: result.error }
  } catch (error) {
    console.error('Failed to send order completion email:', error)
    return { success: false, error: (error as any).message }
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(data: {
  to: string
  name: string
  resetUrl: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const template = getEmailTemplate('password-reset', {
      name: data.name,
      email: data.to,
      resetUrl: data.resetUrl,
      createdAt: new Date().toISOString()
    })

    const result = await emailService.sendEmail({
      to: data.to,
      subject: template.subject,
      html: template.html,
      text: template.text
    })

    return { success: result.success, error: result.error }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return { success: false, error: (error as any).message }
  }
}