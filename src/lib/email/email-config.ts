/**
 * Email Service Configuration
 * Supports multiple email providers with fallback and environment-based configuration
 */

export interface EmailConfig {
  // Primary provider configuration
  primaryProvider: EmailProvider
  fallbackProvider?: EmailProvider
  
  // Global settings
  defaultFrom: string
  replyTo?: string
  
  // Rate limiting
  rateLimiting: {
    maxPerMinute: number
    maxPerHour: number
    maxPerDay: number
  }
  
  // Retry configuration
  retryConfig: {
    maxAttempts: number
    backoffMultiplier: number
    initialDelayMs: number
  }
  
  // Queue configuration
  queueConfig: {
    enabled: boolean
    maxConcurrent: number
    defaultDelay: number
  }
  
  // Development settings
  development: {
    skipSending: boolean
    logToConsole: boolean
    useMailHog: boolean
    mailHogHost?: string
    mailHogPort?: number
  }
  
  // LGPD compliance
  compliance: {
    logEmails: boolean
    retentionDays: number
    trackDelivery: boolean
    includeUnsubscribeLink: boolean
  }
}

export type EmailProvider = 'sendgrid' | 'mailgun' | 'smtp' | 'resend' | 'mailhog'

export interface ProviderConfig {
  type: EmailProvider
  enabled: boolean
  config: Record<string, any>
}

export interface SendGridConfig {
  apiKey: string
  fromName?: string
}

export interface MailgunConfig {
  apiKey: string
  domain: string
  host?: string
  fromName?: string
}

export interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  fromName?: string
}

export interface ResendConfig {
  apiKey: string
  fromName?: string
}

export interface MailHogConfig {
  host: string
  port: number
  fromName?: string
}

/**
 * Get email configuration based on environment variables
 */
export function getEmailConfig(): EmailConfig {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'
  
  // Determine primary provider based on available environment variables
  let primaryProvider: EmailProvider = 'smtp' // Default fallback
  
  if (process.env.SENDGRID_API_KEY) {
    primaryProvider = 'sendgrid'
  } else if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    primaryProvider = 'mailgun'
  } else if (process.env.RESEND_API_KEY) {
    primaryProvider = 'resend'
  } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    primaryProvider = 'smtp'
  } else if (isDevelopment && process.env.MAILHOG_HOST) {
    primaryProvider = 'mailhog'
  }
  
  // Determine fallback provider
  let fallbackProvider: EmailProvider | undefined
  
  if (primaryProvider !== 'smtp' && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    fallbackProvider = 'smtp'
  } else if (primaryProvider !== 'sendgrid' && process.env.SENDGRID_API_KEY) {
    fallbackProvider = 'sendgrid'
  } else if (primaryProvider !== 'mailgun' && process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    fallbackProvider = 'mailgun'
  }
  
  return {
    primaryProvider,
    fallbackProvider,
    
    defaultFrom: process.env.EMAIL_FROM || 'noreply@querodocumento.com.br',
    replyTo: process.env.EMAIL_REPLY_TO || 'contato@querodocumento.com.br',
    
    rateLimiting: {
      maxPerMinute: parseInt(process.env.EMAIL_RATE_LIMIT_PER_MINUTE || '30'),
      maxPerHour: parseInt(process.env.EMAIL_RATE_LIMIT_PER_HOUR || '1000'),
      maxPerDay: parseInt(process.env.EMAIL_RATE_LIMIT_PER_DAY || '10000'),
    },
    
    retryConfig: {
      maxAttempts: parseInt(process.env.EMAIL_MAX_RETRY_ATTEMPTS || '3'),
      backoffMultiplier: parseFloat(process.env.EMAIL_RETRY_BACKOFF_MULTIPLIER || '2'),
      initialDelayMs: parseInt(process.env.EMAIL_INITIAL_RETRY_DELAY || '1000'),
    },
    
    queueConfig: {
      enabled: process.env.EMAIL_QUEUE_ENABLED !== 'false',
      maxConcurrent: parseInt(process.env.EMAIL_MAX_CONCURRENT || '10'),
      defaultDelay: parseInt(process.env.EMAIL_QUEUE_DELAY || '100'),
    },
    
    development: {
      skipSending: isDevelopment && process.env.EMAIL_SKIP_SENDING === 'true',
      logToConsole: isDevelopment || process.env.EMAIL_LOG_TO_CONSOLE === 'true',
      useMailHog: isDevelopment && process.env.EMAIL_USE_MAILHOG === 'true',
      mailHogHost: process.env.MAILHOG_HOST || 'localhost',
      mailHogPort: parseInt(process.env.MAILHOG_PORT || '1025'),
    },
    
    compliance: {
      logEmails: process.env.EMAIL_LOG_EMAILS !== 'false',
      retentionDays: parseInt(process.env.EMAIL_LOG_RETENTION_DAYS || '365'),
      trackDelivery: process.env.EMAIL_TRACK_DELIVERY !== 'false',
      includeUnsubscribeLink: process.env.EMAIL_INCLUDE_UNSUBSCRIBE === 'true',
    },
  }
}

/**
 * Get provider-specific configuration
 */
export function getProviderConfig(provider: EmailProvider): ProviderConfig {
  const baseConfig = { type: provider, enabled: false, config: {} }
  
  switch (provider) {
    case 'sendgrid':
      return {
        ...baseConfig,
        enabled: !!process.env.SENDGRID_API_KEY,
        config: {
          apiKey: process.env.SENDGRID_API_KEY,
          fromName: process.env.SENDGRID_FROM_NAME || 'QueroDocumento',
        } as SendGridConfig,
      }
    
    case 'mailgun':
      return {
        ...baseConfig,
        enabled: !!(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN),
        config: {
          apiKey: process.env.MAILGUN_API_KEY,
          domain: process.env.MAILGUN_DOMAIN,
          host: process.env.MAILGUN_HOST || 'api.mailgun.net',
          fromName: process.env.MAILGUN_FROM_NAME || 'QueroDocumento',
        } as MailgunConfig,
      }
    
    case 'smtp':
      return {
        ...baseConfig,
        enabled: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
        config: {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          fromName: process.env.SMTP_FROM_NAME || 'QueroDocumento',
        } as SMTPConfig,
      }
    
    case 'resend':
      return {
        ...baseConfig,
        enabled: !!process.env.RESEND_API_KEY,
        config: {
          apiKey: process.env.RESEND_API_KEY,
          fromName: process.env.RESEND_FROM_NAME || 'QueroDocumento',
        } as ResendConfig,
      }
    
    case 'mailhog':
      return {
        ...baseConfig,
        enabled: process.env.NODE_ENV === 'development' && process.env.EMAIL_USE_MAILHOG === 'true',
        config: {
          host: process.env.MAILHOG_HOST || 'localhost',
          port: parseInt(process.env.MAILHOG_PORT || '1025'),
          fromName: process.env.MAILHOG_FROM_NAME || 'QueroDocumento (Dev)',
        } as MailHogConfig,
      }
    
    default:
      return baseConfig
  }
}

/**
 * Validate email configuration
 */
export function validateEmailConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const config = getEmailConfig()
  
  // Check if at least one provider is configured
  const primaryConfig = getProviderConfig(config.primaryProvider)
  if (!primaryConfig.enabled) {
    errors.push(`Primary email provider '${config.primaryProvider}' is not properly configured`)
  }
  
  // Validate email addresses
  if (!isValidEmail(config.defaultFrom)) {
    errors.push('EMAIL_FROM is not a valid email address')
  }
  
  if (config.replyTo && !isValidEmail(config.replyTo)) {
    errors.push('EMAIL_REPLY_TO is not a valid email address')
  }
  
  // Validate rate limits
  if (config.rateLimiting.maxPerMinute <= 0) {
    errors.push('EMAIL_RATE_LIMIT_PER_MINUTE must be greater than 0')
  }
  
  // Validate retry configuration
  if (config.retryConfig.maxAttempts <= 0) {
    errors.push('EMAIL_MAX_RETRY_ATTEMPTS must be greater than 0')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Get email templates configuration
 */
export interface EmailTemplate {
  name: string
  subject: string
  htmlTemplate: string
  textTemplate?: string
  variables: string[]
}

export function getEmailTemplates(): Record<string, EmailTemplate> {
  return {
    'password-reset': {
      name: 'Password Reset',
      subject: 'Redefinir sua senha - QueroDocumento',
      htmlTemplate: 'password-reset.html',
      textTemplate: 'password-reset.txt',
      variables: ['name', 'resetUrl', 'email'],
    },
    'welcome': {
      name: 'Welcome Email',
      subject: 'Bem-vindo ao QueroDocumento! 🎉',
      htmlTemplate: 'welcome.html',
      textTemplate: 'welcome.txt', 
      variables: ['name'],
    },
    'order-confirmation': {
      name: 'Order Confirmation',
      subject: 'Pedido confirmado - #{orderNumber}',
      htmlTemplate: 'order-confirmation.html',
      textTemplate: 'order-confirmation.txt',
      variables: ['name', 'orderNumber', 'serviceType', 'amount'],
    },
    'order-completed': {
      name: 'Order Completed',
      subject: 'Seu pedido está pronto! - #{orderNumber}',
      htmlTemplate: 'order-completed.html',
      textTemplate: 'order-completed.txt',
      variables: ['name', 'orderNumber', 'downloadUrl'],
    },
    'payment-confirmation': {
      name: 'Payment Confirmation',
      subject: 'Pagamento confirmado - #{orderNumber}',
      htmlTemplate: 'payment-confirmation.html',
      textTemplate: 'payment-confirmation.txt',
      variables: ['name', 'orderNumber', 'amount', 'paymentMethod'],
    },
  }
}