// Sistema de inicialização da aplicação
// Este arquivo é executado no startup da aplicação

import { paymentChecker } from '@/lib/cron/payment-checker'

let isInitialized = false

export function initializeApp() {
  if (isInitialized) {
    console.log('⚠️ App already initialized')
    return
  }

  console.log('🚀 Initializing QueroDocumento application...')

  try {
    // Iniciar cron jobs em produção ou quando habilitado
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_PAYMENT_CRON === 'true') {
      console.log('🕐 Starting payment checker cron...')
      paymentChecker.start()
    } else {
      console.log('⏸️ Payment cron disabled (development mode)')
      console.log('💡 To enable: set ENABLE_PAYMENT_CRON=true in .env')
    }

    isInitialized = true
    console.log('✅ Application initialized successfully')

  } catch (error) {
    console.error('❌ Error during app initialization:', error)
  }
}

export function getAppStatus() {
  return {
    initialized: isInitialized,
    paymentCron: paymentChecker.getStatus(),
    environment: process.env.NODE_ENV,
    cronEnabled: process.env.ENABLE_PAYMENT_CRON === 'true'
  }
}

// Auto-initialize
if (typeof window === 'undefined') { // Server-side only
  initializeApp()
}