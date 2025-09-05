import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

interface CleanupResult {
  success: boolean
  filesProcessed: number
  filesDeleted: number
  errors: string[]
  summary: string
}

/**
 * Cleanup expired files from the file system and database
 * This should be run as a scheduled job (e.g., daily cron)
 */
export async function cleanupExpiredFiles(): Promise<CleanupResult> {
  const result: CleanupResult = {
    success: true,
    filesProcessed: 0,
    filesDeleted: 0,
    errors: [],
    summary: ''
  }

  try {
    // Find all expired documents
    const expiredDocuments = await prisma.orderDocument.findMany({
      where: {
        AND: [
          {
            expiresAt: {
              lte: new Date()
            }
          },
          {
            isActive: true
          }
        ]
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true
          }
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    console.log(`Found ${expiredDocuments.length} expired documents to clean up`)

    for (const document of expiredDocuments) {
      result.filesProcessed++

      try {
        // Build file path
        const filePath = join(process.cwd(), 'public', document.filePath)
        
        // Delete physical file if it exists
        if (existsSync(filePath)) {
          await unlink(filePath)
          console.log(`Deleted file: ${filePath}`)
        }

        // Mark document as inactive in database (soft delete)
        await prisma.orderDocument.update({
          where: { id: document.id },
          data: {
            isActive: false
          }
        })

        // Create audit log for file deletion
        await prisma.auditLog.create({
          data: {
            userId: null, // System action
            action: 'FILE_CLEANUP',
            resource: 'ORDER_DOCUMENT',
            resourceId: document.id,
            metadata: {
              orderId: document.order.id,
              orderNumber: document.order.orderNumber,
              filename: document.filename,
              filePath: document.filePath,
              expiredAt: document.expiresAt,
              uploadedById: document.uploadedById,
              uploadedByName: document.uploadedBy.name,
              reason: 'Expired file cleanup'
            },
            ipAddress: 'system',
            userAgent: 'file-cleanup-service'
          }
        })

        result.filesDeleted++

      } catch (fileError) {
        const error = `Failed to cleanup file ${document.filename} (ID: ${document.id}): ${fileError.message}`
        console.error(error)
        result.errors.push(error)
        result.success = false
      }
    }

    // Generate summary
    result.summary = `Processed ${result.filesProcessed} expired files, deleted ${result.filesDeleted} successfully`
    
    if (result.errors.length > 0) {
      result.summary += `, encountered ${result.errors.length} errors`
    }

    console.log(`File cleanup completed: ${result.summary}`)

    return result

  } catch (error) {
    console.error('File cleanup failed:', error)
    result.success = false
    result.errors.push(`Cleanup job failed: ${error.message}`)
    result.summary = 'File cleanup job failed'
    return result
  }
}

/**
 * Cleanup orphaned files (files on disk without database records)
 * This should be run less frequently (e.g., weekly)
 */
export async function cleanupOrphanedFiles(): Promise<CleanupResult> {
  const result: CleanupResult = {
    success: true,
    filesProcessed: 0,
    filesDeleted: 0,
    errors: [],
    summary: ''
  }

  try {
    const fs = require('fs').promises
    const path = require('path')
    
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'orders')
    
    // Check if uploads directory exists
    if (!existsSync(uploadsDir)) {
      result.summary = 'No uploads directory found'
      return result
    }

    // Get all order directories
    const orderDirs = await fs.readdir(uploadsDir, { withFileTypes: true })
    
    for (const orderDir of orderDirs) {
      if (!orderDir.isDirectory()) continue
      
      const orderId = orderDir.name
      const orderDirPath = join(uploadsDir, orderId)
      
      // Check if order exists in database
      const orderExists = await prisma.order.findUnique({
        where: { id: orderId }
      })
      
      if (!orderExists) {
        // Order doesn't exist, mark all files in this directory as orphaned
        try {
          const files = await fs.readdir(orderDirPath)
          
          for (const file of files) {
            const filePath = join(orderDirPath, file)
            await fs.unlink(filePath)
            result.filesDeleted++
            console.log(`Deleted orphaned file: ${filePath}`)
          }
          
          // Remove empty directory
          await fs.rmdir(orderDirPath)
          console.log(`Removed orphaned directory: ${orderDirPath}`)
          
        } catch (dirError) {
          result.errors.push(`Failed to cleanup orphaned directory ${orderDirPath}: ${dirError.message}`)
        }
        
        continue
      }
      
      // Check individual files in the directory
      const files = await fs.readdir(orderDirPath)
      
      for (const file of files) {
        result.filesProcessed++
        const filePath = join(orderDirPath, file)
        const relativeFilePath = join('uploads', 'orders', orderId, file)
        
        // Check if file has a database record
        const documentExists = await prisma.orderDocument.findFirst({
          where: {
            filePath: relativeFilePath,
            isActive: true
          }
        })
        
        if (!documentExists) {
          // File is orphaned
          try {
            await fs.unlink(filePath)
            result.filesDeleted++
            console.log(`Deleted orphaned file: ${filePath}`)
          } catch (fileError) {
            result.errors.push(`Failed to delete orphaned file ${filePath}: ${fileError.message}`)
          }
        }
      }
    }

    result.summary = `Processed ${result.filesProcessed} files, deleted ${result.filesDeleted} orphaned files`
    
    if (result.errors.length > 0) {
      result.summary += `, encountered ${result.errors.length} errors`
      result.success = false
    }

    console.log(`Orphaned files cleanup completed: ${result.summary}`)
    return result

  } catch (error) {
    console.error('Orphaned files cleanup failed:', error)
    result.success = false
    result.errors.push(`Orphaned cleanup job failed: ${error.message}`)
    result.summary = 'Orphaned files cleanup job failed'
    return result
  }
}

/**
 * Get cleanup statistics
 */
export async function getCleanupStats() {
  try {
    const stats = await prisma.orderDocument.groupBy({
      by: ['isActive'],
      _count: {
        id: true
      },
      _sum: {
        fileSize: true
      }
    })

    const expiredCount = await prisma.orderDocument.count({
      where: {
        AND: [
          { expiresAt: { lte: new Date() } },
          { isActive: true }
        ]
      }
    })

    const totalSize = await prisma.orderDocument.aggregate({
      _sum: {
        fileSize: true
      },
      where: {
        isActive: true
      }
    })

    const expiredSize = await prisma.orderDocument.aggregate({
      _sum: {
        fileSize: true
      },
      where: {
        AND: [
          { expiresAt: { lte: new Date() } },
          { isActive: true }
        ]
      }
    })

    return {
      activeFiles: stats.find(s => s.isActive)?.['_count']?.id || 0,
      inactiveFiles: stats.find(s => !s.isActive)?.['_count']?.id || 0,
      expiredFiles: expiredCount,
      totalSize: totalSize._sum.fileSize || 0,
      expiredSize: expiredSize._sum.fileSize || 0
    }

  } catch (error) {
    console.error('Failed to get cleanup stats:', error)
    return null
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}