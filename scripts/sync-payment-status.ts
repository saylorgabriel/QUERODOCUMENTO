#!/usr/bin/env bun
/**
 * Script to sync payment statuses from ASAAS for existing orders
 * This will update any orders that are PENDING in our database but
 * have been confirmed in ASAAS
 */

import { prisma } from '../src/lib/prisma'
import { asaasService } from '../src/lib/payment/asaas'

async function syncPaymentStatuses() {
  console.log('🔄 Starting payment status sync...\n')

  try {
    // Find all orders with ASAAS payment ID but PENDING status
    const pendingOrders = await prisma.order.findMany({
      where: {
        asaasPaymentId: {
          not: null
        },
        paymentStatus: 'PENDING'
      },
      include: {
        user: true
      }
    })

    console.log(`📊 Found ${pendingOrders.length} orders with PENDING status\n`)

    let updatedCount = 0
    let errorCount = 0

    for (const order of pendingOrders) {
      try {
        console.log(`\n🔍 Checking order #${order.orderNumber} (${order.id})`)
        console.log(`   ASAAS Payment ID: ${order.asaasPaymentId}`)

        // Get payment status from ASAAS
        const asaasPayment = await asaasService.getPayment(order.asaasPaymentId!)

        console.log(`   Current DB status: ${order.paymentStatus}`)
        console.log(`   ASAAS status: ${asaasPayment.status}`)

        // Check if status changed
        if (asaasPayment.status !== order.paymentStatus) {
          const isPaid = asaasPayment.status === 'CONFIRMED' || asaasPayment.status === 'RECEIVED'

          console.log(`   ✅ Updating status to: ${asaasPayment.status}`)

          // Update order
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: asaasPayment.status,
              paidAt: isPaid ? new Date() : null,
              status: isPaid ? 'PROCESSING' : order.status,
              metadata: {
                ...(order.metadata as any || {}),
                asaasPayment: {
                  ...(order.metadata as any)?.asaasPayment,
                  status: asaasPayment.status,
                  updatedAt: new Date().toISOString()
                }
              }
            }
          })

          // Create order history entry
          await prisma.orderHistory.create({
            data: {
              orderId: order.id,
              previousStatus: order.status,
              newStatus: isPaid ? 'PROCESSING' : order.status,
              changedById: order.userId,
              notes: `Status sincronizado do ASAAS: ${order.paymentStatus} → ${asaasPayment.status}`,
              metadata: {
                syncScript: true,
                oldPaymentStatus: order.paymentStatus,
                newPaymentStatus: asaasPayment.status,
                asaasPaymentId: order.asaasPaymentId
              }
            }
          })

          updatedCount++
          console.log(`   💚 Updated successfully`)
        } else {
          console.log(`   ⚪ No change needed`)
        }

      } catch (error) {
        errorCount++
        console.error(`   ❌ Error processing order #${order.orderNumber}:`, (error as Error).message)
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('\n\n📊 Summary:')
    console.log(`   Total orders checked: ${pendingOrders.length}`)
    console.log(`   ✅ Updated: ${updatedCount}`)
    console.log(`   ⚪ No change: ${pendingOrders.length - updatedCount - errorCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)

    console.log('\n✨ Sync completed!\n')

  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
syncPaymentStatuses()
  .then(() => {
    console.log('👋 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Unhandled error:', error)
    process.exit(1)
  })
