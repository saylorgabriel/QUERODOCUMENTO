#!/usr/bin/env node

/**
 * File Cleanup Cron Job
 * 
 * This script should be run periodically to clean up expired and orphaned files.
 * 
 * Usage:
 * - Daily: node scripts/file-cleanup-cron.js --type expired
 * - Weekly: node scripts/file-cleanup-cron.js --type all
 * 
 * Crontab examples:
 * # Daily expired file cleanup at 2 AM
 * 0 2 * * * cd /path/to/project && node scripts/file-cleanup-cron.js --type expired
 * 
 * # Weekly full cleanup on Sundays at 3 AM  
 * 0 3 * * 0 cd /path/to/project && node scripts/file-cleanup-cron.js --type all
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs').promises
const path = require('path')

// Parse command line arguments
const args = process.argv.slice(2)
const typeArg = args.find(arg => arg.startsWith('--type='))
const cleanupType = typeArg ? typeArg.split('=')[1] : 'expired'

const prisma = new PrismaClient()

// Cleanup functions (duplicated from lib/file-cleanup.ts for standalone execution)
async function cleanupExpiredFiles() {
  console.log('🧹 Starting expired files cleanup...')
  
  try {
    const expiredDocuments = await prisma.orderDocument.findMany({
      where: {
        AND: [
          { expiresAt: { lte: new Date() } },
          { isActive: true }
        ]
      },
      include: {
        order: { select: { id: true, orderNumber: true } },
        uploadedBy: { select: { id: true, name: true, email: true } }
      }
    })

    console.log(`📁 Found ${expiredDocuments.length} expired documents`)

    let deletedCount = 0
    const errors = []

    for (const document of expiredDocuments) {
      try {
        const filePath = path.join(process.cwd(), 'public', document.filePath)
        
        // Delete physical file if exists
        try {
          await fs.unlink(filePath)
          console.log(`✅ Deleted: ${document.filename}`)
        } catch (unlinkError) {
          if (unlinkError.code !== 'ENOENT') {
            console.log(`⚠️  File not found (already deleted?): ${document.filename}`)
          }
        }

        // Mark as inactive in database
        await prisma.orderDocument.update({
          where: { id: document.id },
          data: { isActive: false }
        })

        // Create audit log
        await prisma.auditLog.create({
          data: {
            userId: null,
            action: 'FILE_CLEANUP_CRON',
            resource: 'ORDER_DOCUMENT',
            resourceId: document.id,
            metadata: {
              filename: document.filename,
              expiredAt: document.expiresAt,
              orderId: document.order.id,
              reason: 'Automatic cleanup - expired file'
            },
            ipAddress: 'cron-job',
            userAgent: 'file-cleanup-cron'
          }
        })

        deletedCount++

      } catch (error) {
        const errorMsg = `Failed to cleanup ${document.filename}: ${error.message}`
        console.error(`❌ ${errorMsg}`)
        errors.push(errorMsg)
      }
    }

    console.log(`✅ Expired cleanup completed: ${deletedCount}/${expiredDocuments.length} files processed`)
    
    if (errors.length > 0) {
      console.log(`❌ Errors encountered: ${errors.length}`)
      errors.forEach(error => console.log(`   - ${error}`))
    }

    return { processed: expiredDocuments.length, deleted: deletedCount, errors }

  } catch (error) {
    console.error('💥 Expired files cleanup failed:', error)
    throw error
  }
}

async function cleanupOrphanedFiles() {
  console.log('🧹 Starting orphaned files cleanup...')
  
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'orders')
    
    if (!await fs.access(uploadsDir).then(() => true).catch(() => false)) {
      console.log('📁 No uploads directory found')
      return { processed: 0, deleted: 0, errors: [] }
    }

    const orderDirs = await fs.readdir(uploadsDir, { withFileTypes: true })
    let processedFiles = 0
    let deletedFiles = 0
    const errors = []

    for (const orderDir of orderDirs) {
      if (!orderDir.isDirectory()) continue
      
      const orderId = orderDir.name
      const orderDirPath = path.join(uploadsDir, orderId)
      
      try {
        // Check if order exists
        const orderExists = await prisma.order.findUnique({
          where: { id: orderId }
        })
        
        if (!orderExists) {
          // Delete entire orphaned order directory
          const files = await fs.readdir(orderDirPath)
          
          for (const file of files) {
            const filePath = path.join(orderDirPath, file)
            await fs.unlink(filePath)
            deletedFiles++
            console.log(`🗑️  Deleted orphaned file: ${file} (order not found)`)
          }
          
          await fs.rmdir(orderDirPath)
          console.log(`🗑️  Removed orphaned directory: ${orderId}`)
          continue
        }
        
        // Check individual files
        const files = await fs.readdir(orderDirPath)
        
        for (const file of files) {
          processedFiles++
          const relativeFilePath = path.join('uploads', 'orders', orderId, file)
          
          const documentExists = await prisma.orderDocument.findFirst({
            where: {
              filePath: relativeFilePath,
              isActive: true
            }
          })
          
          if (!documentExists) {
            const filePath = path.join(orderDirPath, file)
            await fs.unlink(filePath)
            deletedFiles++
            console.log(`🗑️  Deleted orphaned file: ${file} (no database record)`)
          }
        }

      } catch (error) {
        const errorMsg = `Failed to process directory ${orderId}: ${error.message}`
        console.error(`❌ ${errorMsg}`)
        errors.push(errorMsg)
      }
    }

    console.log(`✅ Orphaned cleanup completed: ${deletedFiles}/${processedFiles} files deleted`)
    
    if (errors.length > 0) {
      console.log(`❌ Errors encountered: ${errors.length}`)
      errors.forEach(error => console.log(`   - ${error}`))
    }

    return { processed: processedFiles, deleted: deletedFiles, errors }

  } catch (error) {
    console.error('💥 Orphaned files cleanup failed:', error)
    throw error
  }
}

async function getStats() {
  try {
    const stats = await prisma.orderDocument.groupBy({
      by: ['isActive'],
      _count: { id: true },
      _sum: { fileSize: true }
    })

    const expiredCount = await prisma.orderDocument.count({
      where: {
        AND: [
          { expiresAt: { lte: new Date() } },
          { isActive: true }
        ]
      }
    })

    const totalSize = stats.reduce((acc, stat) => acc + (stat._sum.fileSize || 0), 0)
    const activeFiles = stats.find(s => s.isActive)?._count?.id || 0
    const inactiveFiles = stats.find(s => !s.isActive)?._count?.id || 0

    return {
      activeFiles,
      inactiveFiles, 
      expiredFiles: expiredCount,
      totalSize
    }
  } catch (error) {
    console.error('Failed to get stats:', error)
    return null
  }
}

function formatSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function main() {
  console.log('🚀 File Cleanup Cron Job Started')
  console.log(`📅 Date: ${new Date().toISOString()}`)
  console.log(`🔧 Cleanup Type: ${cleanupType}`)
  console.log('=' .repeat(50))

  try {
    // Show stats before cleanup
    const statsBefore = await getStats()
    if (statsBefore) {
      console.log('📊 Before cleanup:')
      console.log(`   Active files: ${statsBefore.activeFiles}`)
      console.log(`   Inactive files: ${statsBefore.inactiveFiles}`)
      console.log(`   Expired files: ${statsBefore.expiredFiles}`)
      console.log(`   Total size: ${formatSize(statsBefore.totalSize)}`)
      console.log('')
    }

    let results = []

    // Run cleanup based on type
    if (cleanupType === 'expired' || cleanupType === 'all') {
      const expiredResult = await cleanupExpiredFiles()
      results.push({ type: 'expired', ...expiredResult })
    }

    if (cleanupType === 'orphaned' || cleanupType === 'all') {
      const orphanedResult = await cleanupOrphanedFiles()
      results.push({ type: 'orphaned', ...orphanedResult })
    }

    // Show stats after cleanup
    const statsAfter = await getStats()
    if (statsAfter) {
      console.log('')
      console.log('📊 After cleanup:')
      console.log(`   Active files: ${statsAfter.activeFiles}`)
      console.log(`   Inactive files: ${statsAfter.inactiveFiles}`)
      console.log(`   Expired files: ${statsAfter.expiredFiles}`)
      console.log(`   Total size: ${formatSize(statsAfter.totalSize)}`)
    }

    // Summary
    console.log('')
    console.log('📋 Summary:')
    results.forEach(result => {
      console.log(`   ${result.type}: ${result.deleted}/${result.processed} files cleaned`)
      if (result.errors.length > 0) {
        console.log(`   ${result.type} errors: ${result.errors.length}`)
      }
    })

    const totalErrors = results.reduce((acc, r) => acc + r.errors.length, 0)
    const totalProcessed = results.reduce((acc, r) => acc + r.processed, 0)
    const totalDeleted = results.reduce((acc, r) => acc + r.deleted, 0)

    console.log('')
    console.log(`✅ Cleanup completed successfully!`)
    console.log(`📁 Total processed: ${totalProcessed}`)
    console.log(`🗑️  Total deleted: ${totalDeleted}`)
    
    if (totalErrors > 0) {
      console.log(`❌ Total errors: ${totalErrors}`)
      process.exit(1)
    }

  } catch (error) {
    console.error('💥 Cleanup job failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Validate cleanup type
if (!['expired', 'orphaned', 'all'].includes(cleanupType)) {
  console.error('❌ Invalid cleanup type. Use: expired, orphaned, or all')
  process.exit(1)
}

// Run the cleanup
main().catch(error => {
  console.error('💥 Unhandled error:', error)
  process.exit(1)
})