import cron from 'node-cron'

class PaymentChecker {
  private isRunning = false
  private task: cron.ScheduledTask | null = null

  start() {
    if (this.isRunning) {
      console.log('⚠️ Payment checker cron is already running')
      return
    }

    // Run every 5 minutes
    this.task = cron.schedule('*/5 * * * *', async () => {
      console.log('🕐 Running payment status check cron...')

      try {
        // Call our cron endpoint
        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/cron/payment-check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'PaymentChecker/1.0'
          }
        })

        if (response.ok) {
          const result = await response.json()
          console.log('✅ Payment check completed:', result.summary)
        } else {
          console.error('❌ Payment check failed:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('💥 Payment check error:', error)
      }
    }, {
      scheduled: false,
      timezone: 'America/Sao_Paulo'
    })

    this.task.start()
    this.isRunning = true
    console.log('✅ Payment checker cron started (every 5 minutes)')
  }

  stop() {
    if (this.task) {
      this.task.stop()
      this.task = null
    }
    this.isRunning = false
    console.log('⏹️ Payment checker cron stopped')
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      schedule: 'Every 5 minutes',
      timezone: 'America/Sao_Paulo'
    }
  }

  // Manual trigger for testing
  async runNow() {
    console.log('🔄 Manually triggering payment check...')

    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/cron/payment-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PaymentChecker/1.0-Manual'
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Manual payment check completed:', result.summary)
        return result
      } else {
        console.error('❌ Manual payment check failed:', response.status, response.statusText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('💥 Manual payment check error:', error)
      throw error
    }
  }
}

export const paymentChecker = new PaymentChecker()

// Auto-start in production or when explicitly enabled
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_PAYMENT_CRON === 'true') {
  paymentChecker.start()
}