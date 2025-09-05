/**
 * Legacy Email Functions
 * These functions are maintained for backward compatibility
 * 
 * ⚡ RECOMMENDATION: For new code, use the enhanced template helpers:
 * import { sendWelcomeEmail, sendOrderConfirmationEmail } from './email/template-helpers'
 */

import { emailService } from './email/email-service'
import { getEmailTemplate } from './email/templates'

// Re-export enhanced template helpers for convenience
export * from './email/template-helpers'

export interface SendPasswordResetEmailParams {
  to: string
  name: string
  resetToken: string
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetToken
}: SendPasswordResetEmailParams) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?email=${encodeURIComponent(to)}&token=${resetToken}`

  try {
    const template = getEmailTemplate('password-reset', {
      name,
      email: to,
      resetUrl
    })

    const result = await emailService.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      metadata: {
        type: 'password-reset',
        resetToken,
        userEmail: to
      }
    })

    if (result.success) {
      console.log(`Password reset email sent via ${result.provider}:`, result.messageId)
      return { success: true, messageId: result.messageId }
    } else {
      console.error('Password reset email failed:', result.error)
      return { success: false, error: result.error || 'Erro ao enviar email' }
    }
  } catch (error: any) {
    console.error('Password reset email error:', error)
    return { success: false, error: error.message || 'Erro ao enviar email' }
  }
}

// Legacy template functions removed - using new template system

export async function sendWelcomeEmail({
  to,
  name
}: {
  to: string
  name: string
}) {
  try {
    const template = getEmailTemplate('welcome', {
      name,
      email: to
    })

    const result = await emailService.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      metadata: {
        type: 'welcome',
        userEmail: to
      }
    })

    if (result.success) {
      console.log(`Welcome email sent via ${result.provider}:`, result.messageId)
      return { success: true, messageId: result.messageId }
    } else {
      console.error('Welcome email failed:', result.error)
      return { success: false, error: result.error || 'Erro ao enviar email de boas-vindas' }
    }
  } catch (error: any) {
    console.error('Welcome email error:', error)
    return { success: false, error: error.message || 'Erro ao enviar email de boas-vindas' }
  }
}

/**
 * Add convenience functions for common email operations
 */

export async function sendOrderConfirmationEmail({
  to,
  name,
  orderNumber,
  serviceType,
  amount
}: {
  to: string
  name: string
  orderNumber: string
  serviceType: string
  amount: string
}) {
  try {
    const template = getEmailTemplate('order-confirmation', {
      name,
      email: to,
      orderNumber,
      serviceType,
      amount
    })

    const result = await emailService.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      metadata: {
        type: 'order-confirmation',
        orderNumber,
        serviceType,
        amount,
        userEmail: to
      }
    })

    if (result.success) {
      console.log(`Order confirmation email sent via ${result.provider}:`, result.messageId)
      return { success: true, messageId: result.messageId }
    } else {
      console.error('Order confirmation email failed:', result.error)
      return { success: false, error: result.error || 'Erro ao enviar email de confirmação' }
    }
  } catch (error: any) {
    console.error('Order confirmation email error:', error)
    return { success: false, error: error.message || 'Erro ao enviar email de confirmação' }
  }
}

export async function sendOrderCompletedEmail({
  to,
  name,
  orderNumber,
  downloadUrl
}: {
  to: string
  name: string
  orderNumber: string
  downloadUrl: string
}) {
  try {
    const template = getEmailTemplate('order-completed', {
      name,
      email: to,
      orderNumber,
      downloadUrl
    })

    const result = await emailService.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      metadata: {
        type: 'order-completed',
        orderNumber,
        downloadUrl,
        userEmail: to
      }
    })

    if (result.success) {
      console.log(`Order completed email sent via ${result.provider}:`, result.messageId)
      return { success: true, messageId: result.messageId }
    } else {
      console.error('Order completed email failed:', result.error)
      return { success: false, error: result.error || 'Erro ao enviar email de conclusão' }
    }
  } catch (error: any) {
    console.error('Order completed email error:', error)
    return { success: false, error: error.message || 'Erro ao enviar email de conclusão' }
  }
}

export async function sendPaymentConfirmationEmail({
  to,
  name,
  orderNumber,
  amount,
  paymentMethod
}: {
  to: string
  name: string
  orderNumber: string
  amount: string
  paymentMethod: string
}) {
  try {
    const template = getEmailTemplate('payment-confirmation', {
      name,
      email: to,
      orderNumber,
      amount,
      paymentMethod
    })

    const result = await emailService.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      metadata: {
        type: 'payment-confirmation',
        orderNumber,
        amount,
        paymentMethod,
        userEmail: to
      }
    })

    if (result.success) {
      console.log(`Payment confirmation email sent via ${result.provider}:`, result.messageId)
      return { success: true, messageId: result.messageId }
    } else {
      console.error('Payment confirmation email failed:', result.error)
      return { success: false, error: result.error || 'Erro ao enviar email de pagamento' }
    }
  } catch (error: any) {
    console.error('Payment confirmation email error:', error)
    return { success: false, error: error.message || 'Erro ao enviar email de pagamento' }
  }
}