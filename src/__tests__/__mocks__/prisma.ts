/**
 * Mock Prisma Client for testing
 */

import { jest } from '@jest/globals'
import { mockPrisma } from '../fixtures/mockData'

// Create a mock Prisma client
const prismaMock = {
  ...mockPrisma,
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn(),
}

// Mock the Prisma module
jest.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

export { prismaMock }