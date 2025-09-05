/**
 * Integration Test Setup
 * Sets up test database, authentication, and cleanup utilities for integration tests
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Test database connection
let prisma: PrismaClient

export const setupTestDatabase = async () => {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || 'postgresql://querodoc_test:test123@localhost:5433/querodocumento_test'
        }
      }
    })
  }

  // Clean the database before each test suite
  await cleanDatabase()
  return prisma
}

export const cleanDatabase = async () => {
  if (!prisma) return

  // Delete in correct order to respect foreign key constraints
  await prisma.downloadLog.deleteMany()
  await prisma.orderDocument.deleteMany()
  await prisma.orderHistory.deleteMany()
  await prisma.emailLog.deleteMany()
  await prisma.emailBounce.deleteMany()
  await prisma.emailUnsubscribe.deleteMany()
  await prisma.emailQueue.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.order.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.protestQuery.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.resetToken.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.user.deleteMany()
}

export const teardownTestDatabase = async () => {
  if (prisma) {
    await cleanDatabase()
    await prisma.$disconnect()
  }
}

// Test data factories
export const createTestUser = async (overrides: Partial<any> = {}) => {
  const hashedPassword = await bcrypt.hash('test123', 12)
  
  return prisma.user.create({
    data: {
      email: 'test@querodocumento.com',
      name: 'Test User',
      password: hashedPassword,
      cpf: '11144477735',
      phone: '(11) 99999-9999',
      role: 'USER',
      ...overrides,
    },
  })
}

export const createTestAdmin = async (overrides: Partial<any> = {}) => {
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  return prisma.user.create({
    data: {
      email: 'admin@querodocumento.com',
      name: 'Test Admin',
      password: hashedPassword,
      cpf: '22255588844',
      phone: '(11) 88888-8888',
      role: 'ADMIN',
      ...overrides,
    },
  })
}

export const createTestSession = async (userId: string) => {
  return prisma.session.create({
    data: {
      userId,
      sessionToken: `test-session-${Date.now()}`,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  })
}

export const createTestProtestQuery = async (userId: string, overrides: Partial<any> = {}) => {
  return prisma.protestQuery.create({
    data: {
      userId,
      document: '11144477735',
      documentType: 'CPF',
      status: 'COMPLETED',
      result: {
        found: false,
        message: 'Nenhum protesto encontrado',
        searchedAt: new Date().toISOString(),
      },
      ...overrides,
    },
  })
}

export const createTestOrder = async (userId: string, overrides: Partial<any> = {}) => {
  return prisma.order.create({
    data: {
      userId,
      orderNumber: `ORD-${Date.now()}`,
      serviceType: 'PROTEST_QUERY',
      documentNumber: '11144477735',
      documentType: 'CPF',
      invoiceName: 'João Silva',
      invoiceDocument: '11144477735',
      amount: 9.90,
      paymentMethod: 'PIX',
      status: 'AWAITING_PAYMENT',
      ...overrides,
    },
  })
}

export const createTestLead = async (overrides: Partial<any> = {}) => {
  return prisma.lead.create({
    data: {
      documentNumber: '33366699977',
      name: 'Maria Silva',
      email: 'maria@example.com',
      phone: '(11) 77777-7777',
      source: 'landing_page',
      status: 'NEW',
      stage: 'FORM_FILLED',
      ...overrides,
    },
  })
}

// Mock session for API testing
export const mockSession = (user: any) => ({
  user: {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
})

// Helper to get test database instance
export const getTestPrisma = () => prisma

// Mock NextAuth session
export const mockNextAuthSession = (user: any) => {
  const originalSession = require('next-auth/next').getServerSession
  
  return jest.fn().mockResolvedValue({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  })
}

// Helper to create authenticated API request headers
export const createAuthHeaders = (sessionToken: string) => ({
  'Content-Type': 'application/json',
  'Cookie': `next-auth.session-token=${sessionToken}`,
})

// Test environment validation
export const validateTestEnvironment = () => {
  if (!process.env.TEST_DATABASE_URL) {
    console.warn('TEST_DATABASE_URL not set, using default test database')
  }
  
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Integration tests must run with NODE_ENV=test')
  }
}

export { prisma as testPrisma }