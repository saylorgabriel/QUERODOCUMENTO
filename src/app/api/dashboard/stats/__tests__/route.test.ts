/**
 * Unit tests for Dashboard Stats API Route
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { GET } from '../route'
import { mockPrisma, mockUser, mockOrder, mockProtestQuery, mockCertificate } from '@/__tests__/fixtures/mockData'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

// Mock Next.js cookies
const mockCookieGet = jest.fn()
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: mockCookieGet,
    set: jest.fn(),
    delete: jest.fn(),
  })),
}))

describe('/api/dashboard/stats', () => {
  const validSessionData = {
    user: mockUser,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }

  const expiredSessionData = {
    user: mockUser,
    expires: new Date(Date.now() - 1000).toISOString(), // Expired 1 second ago
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default successful mocks
    mockCookieGet.mockReturnValue({
      value: JSON.stringify(validSessionData)
    })
    
    mockPrisma.protestQuery.count.mockResolvedValue(5)
    mockPrisma.certificate.count.mockResolvedValue(2)
    mockPrisma.order.findMany.mockResolvedValue([
      { ...mockOrder, status: 'PENDING_PAYMENT' },
      { ...mockOrder, id: 'order-2', status: 'COMPLETED' },
      { ...mockOrder, id: 'order-3', status: 'PROCESSING' },
    ])
    mockPrisma.protestQuery.findMany.mockResolvedValue([
      {
        result: {
          protests: [
            { id: '1', status: 'ACTIVE' },
            { id: '2', status: 'ACTIVE' }
          ]
        }
      },
      {
        result: {
          protests: [
            { id: '3', status: 'ACTIVE' }
          ]
        }
      }
    ])
    mockPrisma.certificate.count.mockResolvedValueOnce(1) // For ready certificates
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    it('should return dashboard stats for authenticated user', async () => {
      const request = new NextRequest('http://localhost:3000/api/dashboard/stats')

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        consultasRealizadas: 5,
        certidoesSolicitadas: 2,
        protestosEncontrados: 3,
        documentosProntos: 2, // 1 ready certificate + 1 completed order
        pedidosTotal: 3,
        pedidosCompletos: 1,
      })

      // Verify database queries with correct user ID
      expect(mockPrisma.protestQuery.count).toHaveBeenCalledWith({
        where: { userId: mockUser.id }
      })
      expect(mockPrisma.certificate.count).toHaveBeenCalledWith({
        where: { userId: mockUser.id }
      })
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        select: {
          id: true,
          status: true,
          serviceType: true,
          amount: true,
          createdAt: true
        }
      })
    })

    it('should return 401 when session cookie is missing', async () => {
      mockCookieGet.mockReturnValue(null)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Não autorizado')
      expect(mockPrisma.protestQuery.count).not.toHaveBeenCalled()
    })

    it('should return 401 when session is expired', async () => {
      mockCookieGet.mockReturnValue({
        value: JSON.stringify(expiredSessionData)
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Sessão expirada')
      expect(mockPrisma.protestQuery.count).not.toHaveBeenCalled()
    })

    it('should handle malformed session cookie', async () => {
      mockCookieGet.mockReturnValue({
        value: 'invalid json'
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erro ao buscar estatísticas')
    })

    it('should handle database errors gracefully', async () => {
      mockPrisma.protestQuery.count.mockRejectedValue(new Error('Database connection failed'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erro ao buscar estatísticas')
    })

    it('should correctly count protests from query results', async () => {
      mockPrisma.protestQuery.findMany.mockResolvedValue([
        {
          result: {
            protests: [
              { id: '1', status: 'ACTIVE' },
              { id: '2', status: 'PAID' },
              { id: '3', status: 'CANCELLED' }
            ]
          }
        },
        {
          result: {
            protests: [
              { id: '4', status: 'ACTIVE' },
              { id: '5', status: 'ACTIVE' }
            ]
          }
        },
        {
          result: null // Query with no results
        },
        {
          result: {
            // Query with no protests array
          }
        }
      ])

      const response = await GET()
      const data = await response.json()

      expect(data.protestosEncontrados).toBe(5) // Should count all protests regardless of status
    })

    it('should handle empty database results', async () => {
      mockPrisma.protestQuery.count.mockResolvedValue(0)
      mockPrisma.certificate.count.mockResolvedValue(0)
      mockPrisma.order.findMany.mockResolvedValue([])
      mockPrisma.protestQuery.findMany.mockResolvedValue([])
      mockPrisma.certificate.count.mockResolvedValueOnce(0) // For ready certificates

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toMatchObject({
        consultasRealizadas: 0,
        certidoesSolicitadas: 0,
        protestosEncontrados: 0,
        documentosProntos: 0,
        pedidosTotal: 0,
        pedidosCompletos: 0,
      })
    })

    it('should correctly filter ready certificates', async () => {
      mockPrisma.certificate.count
        .mockResolvedValueOnce(5) // Total certificates
        .mockResolvedValueOnce(2) // Ready certificates

      const response = await GET()
      const data = await response.json()

      expect(mockPrisma.certificate.count).toHaveBeenNthCalledWith(1, {
        where: { userId: mockUser.id }
      })
      expect(mockPrisma.certificate.count).toHaveBeenNthCalledWith(2, {
        where: {
          userId: mockUser.id,
          status: 'READY'
        }
      })
    })

    it('should correctly count completed orders', async () => {
      mockPrisma.order.findMany.mockResolvedValue([
        { id: '1', status: 'PENDING_PAYMENT', serviceType: 'CONSULTATION', amount: 10, createdAt: new Date() },
        { id: '2', status: 'COMPLETED', serviceType: 'CERTIFICATE', amount: 25, createdAt: new Date() },
        { id: '3', status: 'PROCESSING', serviceType: 'CONSULTATION', amount: 10, createdAt: new Date() },
        { id: '4', status: 'COMPLETED', serviceType: 'CERTIFICATE', amount: 25, createdAt: new Date() },
        { id: '5', status: 'CANCELLED', serviceType: 'CONSULTATION', amount: 10, createdAt: new Date() },
      ])

      const response = await GET()
      const data = await response.json()

      expect(data.pedidosTotal).toBe(5)
      expect(data.pedidosCompletos).toBe(2) // Only COMPLETED orders
    })

    it('should handle protest queries with different result formats', async () => {
      mockPrisma.protestQuery.findMany.mockResolvedValue([
        {
          result: {
            protests: [{ id: '1' }, { id: '2' }]
          }
        },
        {
          result: {
            totalProtests: 3, // Some queries might store count instead of array
            protests: [{ id: '3' }]
          }
        },
        {
          result: 'string result' // Invalid format
        },
        {
          result: {
            protests: 'not an array' // Invalid protests field
          }
        }
      ])

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      // Should only count valid protest arrays
      expect(data.protestosEncontrados).toBe(3)
    })

    it('should perform all database queries in parallel', async () => {
      let queryStartTimes: number[] = []
      let queryEndTimes: number[] = []

      // Mock functions to track timing
      mockPrisma.protestQuery.count.mockImplementation(async () => {
        queryStartTimes.push(Date.now())
        await new Promise(resolve => setTimeout(resolve, 10))
        queryEndTimes.push(Date.now())
        return 5
      })

      mockPrisma.certificate.count.mockImplementation(async () => {
        queryStartTimes.push(Date.now())
        await new Promise(resolve => setTimeout(resolve, 10))
        queryEndTimes.push(Date.now())
        return 2
      })

      mockPrisma.order.findMany.mockImplementation(async () => {
        queryStartTimes.push(Date.now())
        await new Promise(resolve => setTimeout(resolve, 10))
        queryEndTimes.push(Date.now())
        return []
      })

      mockPrisma.protestQuery.findMany.mockImplementation(async () => {
        queryStartTimes.push(Date.now())
        await new Promise(resolve => setTimeout(resolve, 10))
        queryEndTimes.push(Date.now())
        return []
      })

      const response = await GET()

      expect(response.status).toBe(200)
      
      // Verify queries started around the same time (parallel execution)
      const maxStartTimeDiff = Math.max(...queryStartTimes) - Math.min(...queryStartTimes)
      expect(maxStartTimeDiff).toBeLessThan(5) // Should start within 5ms of each other
    })
  })
})