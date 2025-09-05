/**
 * Email Queue System
 * Provides reliable email delivery with retry mechanism, background processing,
 * and failure handling for the QUERODOCUMENTO platform
 */

import { prisma } from './prisma'
import { emailService, EmailMessage, EmailResult } from './email/email-service'

export interface QueuedEmail {
  id: string
  to: string
  subject: string
  html: string
  text?: string
  metadata?: Record<string, any>
  priority: 'low' | 'normal' | 'high'
  attempts: number
  maxAttempts: number
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'cancelled'
  scheduledFor: Date
  lastAttempt?: Date
  error?: string
  messageId?: string
  createdAt: Date
  updatedAt: Date
}

export interface EmailQueueStats {
  pending: number
  sending: number
  sent: number
  failed: number
  total: number
  byPriority: {
    high: number
    normal: number
    low: number
  }
  recentFailures: Array<{
    id: string
    to: string
    subject: string
    error: string
    failedAt: Date
  }>
}

class EmailQueue {
  private processing = false
  private processingInterval?: NodeJS.Timeout
  private readonly batchSize = 10
  private readonly processingIntervalMs = 30000 // 30 seconds
  
  constructor() {
    // Start background processing if not already running
    this.startBackgroundProcessing()
  }

  /**
   * Add an email to the queue
   */
  async queueEmail(
    message: EmailMessage & { 
      priority?: 'low' | 'normal' | 'high'
      scheduledFor?: Date
      maxAttempts?: number
    }
  ): Promise<string> {
    try {
      // For high priority emails, try sending immediately
      if (message.priority === 'high') {
        const immediateResult = await emailService.sendEmail(message)
        if (immediateResult.success) {
          // Log successful immediate send
          await this.logEmailAttempt({
            ...message,
            status: 'sent',
            messageId: immediateResult.messageId,
            attempts: 1
          })
          return immediateResult.messageId || 'immediate-send'
        }
        // If immediate send fails, fall through to queue
      }

      const queueEntry = await prisma.emailQueue.create({
        data: {
          to: Array.isArray(message.to) ? message.to.join(', ') : message.to,
          subject: message.subject,
          html: message.html || '',
          text: message.text,
          metadata: message.metadata ? JSON.stringify(message.metadata) : null,
          priority: message.priority || 'normal',
          maxAttempts: message.maxAttempts || 3,
          scheduledFor: message.scheduledFor || new Date(),
          status: 'pending'
        }
      })

      console.log(`Email queued with ID ${queueEntry.id}: ${message.subject}`)
      
      // Process queue immediately if it's high priority
      if (message.priority === 'high') {
        setImmediate(() => this.processQueue())
      }

      return queueEntry.id
    } catch (error) {
      console.error('Failed to queue email:', error)
      throw new Error('Failed to add email to queue')
    }
  }

  /**
   * Process pending emails in the queue
   */
  async processQueue(): Promise<{ processed: number; failed: number }> {
    if (this.processing) {
      console.log('Queue processing already in progress, skipping...')
      return { processed: 0, failed: 0 }
    }

    this.processing = true
    let processed = 0
    let failed = 0

    try {
      // Get pending emails ordered by priority and scheduled time
      const pendingEmails = await prisma.emailQueue.findMany({
        where: {
          status: 'pending',
          scheduledFor: {
            lte: new Date()
          },
          attempts: {
            lt: prisma.emailQueue.fields.maxAttempts
          }
        },
        orderBy: [
          { priority: 'desc' },
          { scheduledFor: 'asc' }
        ],
        take: this.batchSize
      })

      console.log(`Processing ${pendingEmails.length} emails from queue`)

      for (const queuedEmail of pendingEmails) {
        try {
          // Mark as sending
          await prisma.emailQueue.update({
            where: { id: queuedEmail.id },
            data: { 
              status: 'sending',
              lastAttempt: new Date(),
              attempts: queuedEmail.attempts + 1
            }
          })

          // Prepare email message
          const emailMessage: EmailMessage = {
            to: queuedEmail.to,
            subject: queuedEmail.subject,
            html: queuedEmail.html,
            text: queuedEmail.text || undefined,
            metadata: queuedEmail.metadata ? JSON.parse(queuedEmail.metadata) : undefined
          }

          // Attempt to send
          const result = await emailService.sendEmail(emailMessage)

          if (result.success) {
            // Mark as sent
            await prisma.emailQueue.update({
              where: { id: queuedEmail.id },
              data: { 
                status: 'sent',
                messageId: result.messageId,
                updatedAt: new Date()
              }
            })
            processed++
            console.log(`✓ Email sent successfully: ${queuedEmail.subject}`)
          } else {
            // Handle failure
            const isMaxAttempts = queuedEmail.attempts + 1 >= queuedEmail.maxAttempts
            const nextScheduled = isMaxAttempts 
              ? null 
              : new Date(Date.now() + this.calculateRetryDelay(queuedEmail.attempts + 1))

            await prisma.emailQueue.update({
              where: { id: queuedEmail.id },
              data: { 
                status: isMaxAttempts ? 'failed' : 'pending',
                error: result.error || 'Unknown error',
                ...(nextScheduled && { scheduledFor: nextScheduled }),
                updatedAt: new Date()
              }
            })

            if (isMaxAttempts) {
              console.error(`✗ Email failed permanently after ${queuedEmail.maxAttempts} attempts: ${queuedEmail.subject}`)
              failed++
            } else {
              console.warn(`⚠ Email attempt ${queuedEmail.attempts + 1} failed, will retry: ${queuedEmail.subject}`)
            }
          }

        } catch (error) {
          console.error(`Error processing queued email ${queuedEmail.id}:`, error)
          
          // Mark as failed or pending for retry
          const isMaxAttempts = queuedEmail.attempts >= queuedEmail.maxAttempts
          await prisma.emailQueue.update({
            where: { id: queuedEmail.id },
            data: { 
              status: isMaxAttempts ? 'failed' : 'pending',
              error: (error as any).message || 'Processing error',
              scheduledFor: isMaxAttempts 
                ? queuedEmail.scheduledFor 
                : new Date(Date.now() + this.calculateRetryDelay(queuedEmail.attempts + 1)),
              updatedAt: new Date()
            }
          })
          failed++
        }
      }

    } catch (error) {
      console.error('Queue processing error:', error)
    } finally {
      this.processing = false
    }

    if (processed > 0 || failed > 0) {
      console.log(`Queue processing completed: ${processed} sent, ${failed} failed`)
    }

    return { processed, failed }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<EmailQueueStats> {
    try {
      const [counts, recentFailures] = await Promise.all([
        prisma.emailQueue.groupBy({
          by: ['status', 'priority'],
          _count: {
            id: true
          }
        }),
        prisma.emailQueue.findMany({
          where: {
            status: 'failed',
            updatedAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          },
          select: {
            id: true,
            to: true,
            subject: true,
            error: true,
            updatedAt: true
          },
          orderBy: {
            updatedAt: 'desc'
          },
          take: 10
        })
      ])

      const stats: EmailQueueStats = {
        pending: 0,
        sending: 0,
        sent: 0,
        failed: 0,
        total: 0,
        byPriority: {
          high: 0,
          normal: 0,
          low: 0
        },
        recentFailures: recentFailures.map(failure => ({
          id: failure.id,
          to: failure.to,
          subject: failure.subject,
          error: failure.error || 'Unknown error',
          failedAt: failure.updatedAt
        }))
      }

      // Process counts
      counts.forEach(count => {
        const status = count.status as keyof Pick<EmailQueueStats, 'pending' | 'sending' | 'sent' | 'failed'>
        const priority = count.priority as keyof EmailQueueStats['byPriority']
        
        stats[status] += count._count.id
        stats.total += count._count.id
        stats.byPriority[priority] += count._count.id
      })

      return stats
    } catch (error) {
      console.error('Failed to get queue stats:', error)
      throw new Error('Failed to retrieve queue statistics')
    }
  }

  /**
   * Retry failed emails
   */
  async retryFailedEmails(emailIds?: string[]): Promise<{ queued: number }> {
    try {
      const whereCondition = emailIds 
        ? { id: { in: emailIds }, status: 'failed' }
        : { status: 'failed' }

      const result = await prisma.emailQueue.updateMany({
        where: whereCondition,
        data: {
          status: 'pending',
          scheduledFor: new Date(),
          error: null,
          updatedAt: new Date()
        }
      })

      console.log(`Requeued ${result.count} failed emails`)
      
      // Process queue immediately
      setImmediate(() => this.processQueue())
      
      return { queued: result.count }
    } catch (error) {
      console.error('Failed to retry emails:', error)
      throw new Error('Failed to retry failed emails')
    }
  }

  /**
   * Cancel pending emails
   */
  async cancelEmails(emailIds: string[]): Promise<{ cancelled: number }> {
    try {
      const result = await prisma.emailQueue.updateMany({
        where: {
          id: { in: emailIds },
          status: { in: ['pending', 'sending'] }
        },
        data: {
          status: 'cancelled',
          updatedAt: new Date()
        }
      })

      return { cancelled: result.count }
    } catch (error) {
      console.error('Failed to cancel emails:', error)
      throw new Error('Failed to cancel emails')
    }
  }

  /**
   * Clean up old queue entries
   */
  async cleanupOldEntries(daysOld = 30): Promise<{ deleted: number }> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const result = await prisma.emailQueue.deleteMany({
        where: {
          status: { in: ['sent', 'cancelled'] },
          updatedAt: {
            lt: cutoffDate
          }
        }
      })

      console.log(`Cleaned up ${result.count} old queue entries`)
      return { deleted: result.count }
    } catch (error) {
      console.error('Failed to cleanup old entries:', error)
      throw new Error('Failed to cleanup old queue entries')
    }
  }

  /**
   * Start background queue processing
   */
  private startBackgroundProcessing(): void {
    if (this.processingInterval) {
      return // Already running
    }

    console.log('Starting email queue background processing...')
    
    this.processingInterval = setInterval(async () => {
      try {
        await this.processQueue()
      } catch (error) {
        console.error('Background queue processing error:', error)
      }
    }, this.processingIntervalMs)

    // Process immediately on startup
    setImmediate(() => this.processQueue())
  }

  /**
   * Stop background queue processing
   */
  public stopBackgroundProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = undefined
      console.log('Email queue background processing stopped')
    }
  }

  /**
   * Calculate exponential backoff delay for retries
   */
  private calculateRetryDelay(attempt: number): number {
    // Base delay: 5 minutes, exponentially increasing
    const baseDelay = 5 * 60 * 1000 // 5 minutes in ms
    const maxDelay = 2 * 60 * 60 * 1000 // 2 hours max
    
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay)
    
    // Add some jitter to avoid thundering herd
    const jitter = Math.random() * 0.1 * delay
    
    return delay + jitter
  }

  /**
   * Log email attempt for tracking
   */
  private async logEmailAttempt(email: any): Promise<void> {
    try {
      // This could be expanded to create more detailed logs
      console.log(`Email attempt logged: ${email.subject} - Status: ${email.status}`)
    } catch (error) {
      console.error('Failed to log email attempt:', error)
    }
  }
}

// Create singleton instance
export const emailQueue = new EmailQueue()

// Convenience functions
export async function queueEmail(message: EmailMessage & { 
  priority?: 'low' | 'normal' | 'high'
  scheduledFor?: Date
  maxAttempts?: number
}): Promise<string> {
  return emailQueue.queueEmail(message)
}

export async function processEmailQueue(): Promise<{ processed: number; failed: number }> {
  return emailQueue.processQueue()
}

export async function getEmailQueueStats(): Promise<EmailQueueStats> {
  return emailQueue.getQueueStats()
}

export async function retryFailedEmails(emailIds?: string[]): Promise<{ queued: number }> {
  return emailQueue.retryFailedEmails(emailIds)
}

export async function cancelQueuedEmails(emailIds: string[]): Promise<{ cancelled: number }> {
  return emailQueue.cancelEmails(emailIds)
}

export async function cleanupEmailQueue(daysOld?: number): Promise<{ deleted: number }> {
  return emailQueue.cleanupOldEntries(daysOld)
}

// Export the queue instance for direct access if needed
export { emailQueue as emailQueueInstance }