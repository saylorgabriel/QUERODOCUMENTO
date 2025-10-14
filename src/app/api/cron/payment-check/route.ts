import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { asaasService } from '@/lib/payment/asaas'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Payment status check cron started')

    // Find pending orders with ASAAS payment ID from last 7 days
    const pendingOrders = await prisma.order.findMany({
      where: {
        asaasPaymentId: {
          not: null
        },
        paymentStatus: {
          in: ['PENDING', 'PROCESSING']
        },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      select: {
        id: true,
        orderNumber: true,
        asaasPaymentId: true,
        paymentStatus: true,
        status: true,
        amount: true,
        createdAt: true
      }
    })

    console.log(`📊 Found ${pendingOrders.length} pending orders to check`)

    const results = {
      checked: 0,
      updated: 0,
      errors: 0,
      details: [] as any[]
    }

    for (const order of pendingOrders) {
      try {
        results.checked++

        console.log(`🔍 Checking payment status for order ${order.orderNumber} (${order.asaasPaymentId})`)

        // Get current payment status from ASAAS
        const payment = await asaasService.getPayment(order.asaasPaymentId!)

        console.log(`💳 ASAAS payment status: ${payment.status}`)

        // Map ASAAS status to our system
        let newPaymentStatus = order.paymentStatus
        let newOrderStatus = order.status

        switch (payment.status) {
          case 'RECEIVED':
          case 'CONFIRMED':
            newPaymentStatus = 'COMPLETED'
            newOrderStatus = 'PAYMENT_CONFIRMED'
            break

          case 'PENDING':
            newPaymentStatus = 'PENDING'
            newOrderStatus = 'AWAITING_PAYMENT'
            break

          case 'OVERDUE':
            newPaymentStatus = 'FAILED'
            newOrderStatus = 'PAYMENT_REFUSED'
            break

          case 'REFUNDED':
            newPaymentStatus = 'REFUNDED'
            newOrderStatus = 'CANCELLED'
            break

          default:
            console.log(`⚠️ Unknown payment status: ${payment.status}`)
            continue
        }

        // Update if status changed
        if (newPaymentStatus !== order.paymentStatus || newOrderStatus !== order.status) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: newPaymentStatus,
              status: newOrderStatus,
              paidAt: (payment.status === 'RECEIVED' || payment.status === 'CONFIRMED')
                ? new Date()
                : undefined,
              metadata: {
                ...((order as any).metadata || {}),
                lastCronCheck: {
                  checkedAt: new Date().toISOString(),
                  previousStatus: order.paymentStatus,
                  newStatus: newPaymentStatus,
                  asaasStatus: payment.status
                }
              }
            }
          })

          // Create order history entry (only if we have a valid system user)
          try {
            await prisma.orderHistory.create({
              data: {
                orderId: order.id,
                previousStatus: order.status,
                newStatus: newOrderStatus,
                changedById: null, // System change, no user ID
                notes: `Cron job update: Payment status changed from ${order.paymentStatus} to ${newPaymentStatus}`,
                metadata: {
                  cron: {
                    asaasPaymentId: payment.id,
                    asaasStatus: payment.status,
                    value: payment.value,
                    checkedAt: new Date().toISOString()
                  }
                }
              }
            })
          } catch (historyError) {
            console.warn(`⚠️ Could not create order history for ${order.orderNumber}:`, historyError)
            // Continue processing even if history creation fails
          }

          results.updated++
          results.details.push({
            orderNumber: order.orderNumber,
            paymentId: order.asaasPaymentId,
            oldStatus: order.paymentStatus,
            newStatus: newPaymentStatus,
            asaasStatus: payment.status
          })

          console.log(`✅ Updated order ${order.orderNumber}: ${order.paymentStatus} → ${newPaymentStatus}`)
        } else {
          console.log(`ℹ️ No status change for order ${order.orderNumber}`)
        }

      } catch (error) {
        results.errors++
        console.error(`❌ Error checking order ${order.orderNumber}:`, error)
        results.details.push({
          orderNumber: order.orderNumber,
          paymentId: order.asaasPaymentId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log(`🎯 Cron job completed:`, results)

    return NextResponse.json({
      success: true,
      message: 'Payment status check completed',
      summary: {
        totalOrders: pendingOrders.length,
        checked: results.checked,
        updated: results.updated,
        errors: results.errors
      },
      details: results.details
    })

  } catch (error) {
    console.error('💥 Cron job error:', error)
    return NextResponse.json(
      {
        error: 'Cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Handle GET requests for cron job status/info
export async function GET(request: NextRequest) {
  try {
    // Get count of pending orders
    const pendingCount = await prisma.order.count({
      where: {
        asaasPaymentId: {
          not: null
        },
        paymentStatus: {
          in: ['PENDING', 'PROCESSING']
        },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    return NextResponse.json({
      message: 'Payment status check cron endpoint',
      pendingOrders: pendingCount,
      nextRun: 'Every 5 minutes',
      endpoint: '/api/cron/payment-check',
      method: 'POST'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get cron status' },
      { status: 500 }
    )
  }
}