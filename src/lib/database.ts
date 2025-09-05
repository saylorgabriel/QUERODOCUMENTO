import { prisma } from './prisma'
import type { User, ResetToken, AuditLog, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

// User Management
export interface CreateUserData {
  name: string
  email: string
  password: string
  phone?: string | null
  cpf?: string | null
  cnpj?: string | null
  role?: 'USER' | 'ADMIN' | 'SUPPORT'
}

export async function createUser(data: CreateUserData): Promise<User> {
  const hashedPassword = await bcrypt.hash(data.password, 12)
  
  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
      role: data.role || 'USER'
    }
  })
  
  // Log user creation
  await logAudit({
    userId: user.id,
    action: 'CREATE',
    resource: 'USER',
    resourceId: user.id,
    metadata: { email: user.email, name: user.name }
  })
  
  return user
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { email }
  })
}

export async function findUserById(id: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { id }
  })
}

export async function findUserByDocument(document: string): Promise<User | null> {
  return await prisma.user.findFirst({
    where: {
      OR: [
        { cpf: document },
        { cnpj: document }
      ]
    }
  })
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: updates
    })
    
    // Log user update
    await logAudit({
      userId: id,
      action: 'UPDATE',
      resource: 'USER',
      resourceId: id,
      metadata: updates
    })
    
    return user
  } catch (error) {
    return null
  }
}

export async function validateUserPassword(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email)
  if (!user || !user.password) return null
  
  const isValid = await bcrypt.compare(password, user.password)
  
  if (isValid) {
    // Log successful login
    await logAudit({
      userId: user.id,
      action: 'LOGIN',
      resource: 'AUTH',
      metadata: { email }
    })
    return user
  }
  
  return null
}

// Reset Token Management
export async function createResetToken(email: string, token: string, expiresInHours: number = 1): Promise<ResetToken> {
  const expires = new Date()
  expires.setHours(expires.getHours() + expiresInHours)
  
  // Delete any existing tokens for this email
  await prisma.resetToken.deleteMany({
    where: { email }
  })
  
  const resetToken = await prisma.resetToken.create({
    data: {
      email,
      token,
      expires
    }
  })
  
  // Log reset token creation
  await logAudit({
    action: 'CREATE',
    resource: 'RESET_TOKEN',
    resourceId: resetToken.id,
    metadata: { email }
  })
  
  return resetToken
}

export async function validateResetToken(email: string, token: string): Promise<boolean> {
  const resetToken = await prisma.resetToken.findFirst({
    where: {
      email,
      token,
      used: false,
      expires: {
        gt: new Date()
      }
    }
  })
  
  return !!resetToken
}

export async function useResetToken(email: string, token: string): Promise<boolean> {
  try {
    const resetToken = await prisma.resetToken.updateMany({
      where: {
        email,
        token,
        used: false,
        expires: {
          gt: new Date()
        }
      },
      data: {
        used: true
      }
    })
    
    if (resetToken.count > 0) {
      // Log reset token usage
      await logAudit({
        action: 'USE',
        resource: 'RESET_TOKEN',
        metadata: { email }
      })
      return true
    }
    
    return false
  } catch (error) {
    return false
  }
}

export async function clearExpiredResetTokens(): Promise<number> {
  const result = await prisma.resetToken.deleteMany({
    where: {
      expires: {
        lt: new Date()
      }
    }
  })
  
  return result.count
}

// Audit Log Management
export interface CreateAuditLogData {
  userId?: string
  action: string
  resource: string
  resourceId?: string
  metadata?: any
  ipAddress?: string
  userAgent?: string
}

export async function logAudit(data: CreateAuditLogData): Promise<AuditLog> {
  return await prisma.auditLog.create({
    data
  })
}

export async function getAuditLogs(options?: {
  userId?: string
  action?: string
  resource?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}): Promise<AuditLog[]> {
  const where: any = {}
  
  if (options?.userId) where.userId = options.userId
  if (options?.action) where.action = options.action
  if (options?.resource) where.resource = options.resource
  if (options?.startDate || options?.endDate) {
    where.createdAt = {}
    if (options.startDate) where.createdAt.gte = options.startDate
    if (options.endDate) where.createdAt.lte = options.endDate
  }
  
  return await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 100,
    skip: options?.offset || 0,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })
}

// Session Management (for simple auth)
export async function createSession(userId: string, expiresInDays: number = 30): Promise<string> {
  const sessionToken = generateToken(32)
  const expires = new Date()
  expires.setDate(expires.getDate() + expiresInDays)
  
  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires
    }
  })
  
  // Log session creation
  await logAudit({
    userId,
    action: 'CREATE',
    resource: 'SESSION',
    metadata: { sessionToken: sessionToken.substring(0, 8) + '...' }
  })
  
  return sessionToken
}

export async function validateSession(sessionToken: string): Promise<User | null> {
  const session = await prisma.session.findUnique({
    where: {
      sessionToken,
      expires: {
        gt: new Date()
      }
    },
    include: {
      user: true
    }
  })
  
  return session?.user || null
}

export async function deleteSession(sessionToken: string): Promise<boolean> {
  try {
    const session = await prisma.session.delete({
      where: { sessionToken }
    })
    
    // Log session deletion
    await logAudit({
      userId: session.userId,
      action: 'DELETE',
      resource: 'SESSION',
      metadata: { sessionToken: sessionToken.substring(0, 8) + '...' }
    })
    
    return true
  } catch (error) {
    return false
  }
}

export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expires: {
        lt: new Date()
      }
    }
  })
  
  return result.count
}

// Utility functions
function generateToken(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Database health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// LGPD Compliance: Data export for user
export async function exportUserData(userId: string): Promise<any> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      protestQueries: true,
      certificates: true,
      payments: {
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          method: true,
          paidAt: true,
          createdAt: true
        }
      },
      auditLogs: {
        select: {
          action: true,
          resource: true,
          createdAt: true
        }
      }
    }
  })
  
  if (user) {
    // Log data export request
    await logAudit({
      userId,
      action: 'EXPORT',
      resource: 'USER_DATA',
      metadata: { dataTypes: ['user', 'queries', 'certificates', 'payments', 'audit'] }
    })
  }
  
  return user
}

// LGPD Compliance: Data deletion for user
export async function deleteUserData(userId: string): Promise<boolean> {
  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Delete related data first
      await tx.auditLog.deleteMany({ where: { userId } })
      await tx.payment.deleteMany({ where: { userId } })
      await tx.certificate.deleteMany({ where: { userId } })
      await tx.protestQuery.deleteMany({ where: { userId } })
      await tx.session.deleteMany({ where: { userId } })
      await tx.account.deleteMany({ where: { userId } })
      
      // Finally delete the user
      await tx.user.delete({ where: { id: userId } })
    })
    
    // Log data deletion (this will be logged without userId since user is deleted)
    await logAudit({
      action: 'DELETE_ALL',
      resource: 'USER_DATA',
      metadata: { deletedUserId: userId }
    })
    
    return true
  } catch (error) {
    console.error('Error deleting user data:', error)
    return false
  }
}