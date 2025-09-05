/**
 * Email Templates Index
 * Central export point for all email templates
 */

// Export base components and types
export { 
  EmailTemplateData, 
  EmailTemplate, 
  TemplateEngine, 
  createEmailTemplate, 
  createTextTemplate 
} from './base'

// Export individual template functions
export { getWelcomeTemplate } from './welcome'
export { getOrderConfirmationTemplate } from './order-confirmation'
export { getPaymentConfirmedTemplate } from './payment-confirmed'
export { getOrderProcessingTemplate } from './order-processing'
export { getQuoteReadyTemplate } from './quote-ready'
export { getOrderCompletedTemplate } from './order-completed'
export { getPasswordResetTemplate } from './password-reset'
export { getStatusUpdateTemplate } from './status-update'

// Template registry for dynamic access
export const TEMPLATE_REGISTRY = {
  'welcome': () => import('./welcome').then(m => m.getWelcomeTemplate),
  'order-confirmation': () => import('./order-confirmation').then(m => m.getOrderConfirmationTemplate),
  'payment-confirmed': () => import('./payment-confirmed').then(m => m.getPaymentConfirmedTemplate),
  'order-processing': () => import('./order-processing').then(m => m.getOrderProcessingTemplate),
  'quote-ready': () => import('./quote-ready').then(m => m.getQuoteReadyTemplate),
  'order-completed': () => import('./order-completed').then(m => m.getOrderCompletedTemplate),
  'password-reset': () => import('./password-reset').then(m => m.getPasswordResetTemplate),
  'status-update': () => import('./status-update').then(m => m.getStatusUpdateTemplate)
} as const

export type TemplateNames = keyof typeof TEMPLATE_REGISTRY

/**
 * Template categories for organization
 */
export const TEMPLATE_CATEGORIES = {
  user: ['welcome', 'password-reset'],
  order: ['order-confirmation', 'payment-confirmed', 'order-processing', 'quote-ready', 'order-completed'],
  system: ['status-update']
} as const

/**
 * Get template function by name
 */
export async function getTemplateFunction(templateName: TemplateNames) {
  const loader = TEMPLATE_REGISTRY[templateName]
  if (!loader) {
    throw new Error(`Template '${templateName}' not found`)
  }
  return await loader()
}