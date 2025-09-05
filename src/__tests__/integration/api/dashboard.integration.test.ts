/**
 * Dashboard API Integration Tests
 * Tests dashboard data aggregation and statistics with real database
 */

import { NextRequest } from 'next/server'
import { 
  setupTestDatabase, 
  cleanDatabase, 
  createTestUser,
  createTestSession,
  createTestProtestQuery,
  createTestOrder,
  getTestPrisma
} from '../setup'
import { GET as dashboardStatsHandler } from '@/app/api/dashboard/stats/route'
import { GET as dashboardDataHandler } from '@/app/api/dashboard/data/route'

describe('Dashboard API Integration', () => {
  let prisma: any
  let testUser: any
  let testSession: any

  beforeAll(async () => {
    prisma = await setupTestDatabase()
  })

  beforeEach(async () => {
    await cleanDatabase()
    testUser = await createTestUser()
    testSession = await createTestSession(testUser.id)
  })

  describe('GET /api/dashboard/stats', () => {
    it('should return user statistics for authenticated user', async () => {
      // Create test data
      await createTestProtestQuery(testUser.id, { status: 'COMPLETED' })
      await createTestProtestQuery(testUser.id, { status: 'COMPLETED' })
      await createTestOrder(testUser.id, { status: 'COMPLETED' })

      const request = new NextRequest('http://localhost/api/dashboard/stats', {
        method: 'GET',
        headers: {
          'Cookie': `next-auth.session-token=${testSession.sessionToken}`
        }
      })

      const response = await dashboardStatsHandler(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.totalQueries).toBe(2)
      expect(result.totalOrders).toBe(1)
      expect(result.completedOrders).toBe(1)
      expect(result.pendingOrders).toBe(0)
    })

    it('should return zero stats for new user', async () => {
      const request = new NextRequest('http://localhost/api/dashboard/stats', {
        method: 'GET',
        headers: {
          'Cookie': `next-auth.session-token=${testSession.sessionToken}`
        }
      })

      const response = await dashboardStatsHandler(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.totalQueries).toBe(0)
      expect(result.totalOrders).toBe(0)
      expect(result.completedOrders).toBe(0)
      expect(result.pendingOrders).toBe(0)
    })

    it('should reject unauthenticated requests', async () => {
      const request = new NextRequest('http://localhost/api/dashboard/stats', {
        method: 'GET'
      })

      const response = await dashboardStatsHandler(request)
      const result = await response.json()

      expect(response.status).toBe(401)
      expect(result.error).toContain('authenticated')
    })

    it('should calculate statistics correctly with mixed statuses', async () => {
      // Create queries with different statuses
      await createTestProtestQuery(testUser.id, { status: 'COMPLETED' })
      await createTestProtestQuery(testUser.id, { status: 'PENDING' })
      await createTestProtestQuery(testUser.id, { status: 'FAILED' })

      // Create orders with different statuses
      await createTestOrder(testUser.id, { status: 'COMPLETED' })
      await createTestOrder(testUser.id, { status: 'PROCESSING' })
      await createTestOrder(testUser.id, { status: 'AWAITING_PAYMENT' })

      const request = new NextRequest('http://localhost/api/dashboard/stats', {
        method: 'GET',
        headers: {
          'Cookie': `next-auth.session-token=${testSession.sessionToken}`
        }
      })

      const response = await dashboardStatsHandler(request)
      const result = await response.json()

      expect(result.totalQueries).toBe(3)
      expect(result.totalOrders).toBe(3)
      expect(result.completedOrders).toBe(1)
      expect(result.pendingOrders).toBe(2) // PROCESSING + AWAITING_PAYMENT
    })

    it('should include recent activity', async () => {
      // Create recent query
      await createTestProtestQuery(testUser.id, { 
        status: 'COMPLETED',
        document: '11144477735',
        documentType: 'CPF'
      })

      // Create recent order
      await createTestOrder(testUser.id, { 
        status: 'COMPLETED',
        serviceType: 'CERTIFICATE_REQUEST',
        orderNumber: 'ORD-123'
      })

      const request = new NextRequest('http://localhost/api/dashboard/stats', {
        method: 'GET',
        headers: {
          'Cookie': `next-auth.session-token=${testSession.sessionToken}`
        }
      })

      const response = await dashboardStatsHandler(request)
      const result = await response.json()

      expect(result.recentActivity).toBeDefined()
      expect(Array.isArray(result.recentActivity)).toBe(true)
      expect(result.recentActivity.length).toBeGreaterThan(0)
    })
  })

  describe('GET /api/dashboard/data', () => {
    it('should return paginated user queries and orders', async () => {
      // Create test queries
      const query1 = await createTestProtestQuery(testUser.id, {
        document: '11144477735',
        documentType: 'CPF',
        status: 'COMPLETED'
      })

      const query2 = await createTestProtestQuery(testUser.id, {
        document: '22255588844',
        documentType: 'CPF',
        status: 'COMPLETED'
      })

      // Create test order
      const order1 = await createTestOrder(testUser.id, {
        serviceType: 'CERTIFICATE_REQUEST',
        status: 'COMPLETED'
      })

      const request = new NextRequest('http://localhost/api/dashboard/data', {
        method: 'GET',
        headers: {
          'Cookie': `next-auth.session-token=${testSession.sessionToken}`
        }
      })

      const response = await dashboardDataHandler(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.queries).toBeDefined()
      expect(result.orders).toBeDefined()
      expect(result.queries.length).toBe(2)
      expect(result.orders.length).toBe(1)

      // Verify query data structure
      const query = result.queries[0]
      expect(query.id).toBeTruthy()
      expect(query.document).toBeTruthy()
      expect(query.status).toBeTruthy()
      expect(query.createdAt).toBeTruthy()

      // Verify order data structure
      const order = result.orders[0]
      expect(order.id).toBeTruthy()
      expect(order.orderNumber).toBeTruthy()
      expect(order.status).toBeTruthy()
      expect(order.serviceType).toBeTruthy()
    })

    it('should support pagination for queries', async () => {
      // Create multiple queries
      for (let i = 0; i < 15; i++) {
        await createTestProtestQuery(testUser.id, {
          document: `${11144477735 + i}`,
          documentType: 'CPF'
        })
      }

      // Request first page
      const request1 = new NextRequest('http://localhost/api/dashboard/data?page=1&limit=10', {
        method: 'GET',
        headers: {
          'Cookie': `next-auth.session-token=${testSession.sessionToken}`
        }
      })

      const response1 = await dashboardDataHandler(request1)
      const result1 = await response1.json()

      expect(result1.queries.length).toBe(10)
      expect(result1.pagination.totalQueries).toBe(15)
      expect(result1.pagination.totalPages).toBe(2)
      expect(result1.pagination.currentPage).toBe(1)

      // Request second page
      const request2 = new NextRequest('http://localhost/api/dashboard/data?page=2&limit=10', {
        method: 'GET',
        headers: {
          'Cookie': `next-auth.session-token=${testSession.sessionToken}`
        }
      })

      const response2 = await dashboardDataHandler(request2)
      const result2 = await response2.json()

      expect(result2.queries.length).toBe(5)
      expect(result2.pagination.currentPage).toBe(2)
    })

    it('should filter queries by status', async () => {
      await createTestProtestQuery(testUser.id, { status: 'COMPLETED' })
      await createTestProtestQuery(testUser.id, { status: 'PENDING' })
      await createTestProtestQuery(testUser.id, { status: 'FAILED' })

      const request = new NextRequest('http://localhost/api/dashboard/data?status=COMPLETED', {
        method: 'GET',
        headers: {
          'Cookie': `next-auth.session-token=${testSession.sessionToken}`
        }
      })

      const response = await dashboardDataHandler(request)
      const result = await response.json()

      expect(result.queries.length).toBe(1)
      expect(result.queries[0].status).toBe('COMPLETED')
    })

    it('should sort queries by date', async () => {
      const now = new Date()
      
      // Create queries at different times
      await createTestProtestQuery(testUser.id, { 
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      })
      
      await createTestProtestQuery(testUser.id, {
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      })
      
      await createTestProtestQuery(testUser.id, {
        createdAt: now // Now
      })

      const request = new NextRequest('http://localhost/api/dashboard/data?sort=desc', {
        method: 'GET',
        headers: {
          'Cookie': `next-auth.session-token=${testSession.sessionToken}`
        }
      })

      const response = await dashboardDataHandler(request)
      const result = await response.json()

      // Should be sorted by newest first
      const dates = result.queries.map((q: any) => new Date(q.createdAt).getTime())
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1])
      }
    })

    it('should only return data for authenticated user', async () => {
      // Create another user with data
      const otherUser = await createTestUser({
        email: 'other@test.com',
        cpf: '99988877766'
      })
      await createTestProtestQuery(otherUser.id)
      await createTestOrder(otherUser.id)

      // Create data for current user
      await createTestProtestQuery(testUser.id)

      const request = new NextRequest('http://localhost/api/dashboard/data', {
        method: 'GET',
        headers: {
          'Cookie': `next-auth.session-token=${testSession.sessionToken}`
        }
      })

      const response = await dashboardDataHandler(request)
      const result = await response.json()

      // Should only return current user's data
      expect(result.queries.length).toBe(1)
      expect(result.orders.length).toBe(0)
      expect(result.queries[0].userId).toBe(testUser.id)
    })
  })

  describe('Dashboard Performance', () => {
    it('should handle large datasets efficiently', async () => {
      // Create large amount of test data
      const queries = []
      for (let i = 0; i < 100; i++) {
        queries.push(createTestProtestQuery(testUser.id, {
          document: `${11144477700 + i}`,
          documentType: 'CPF'
        }))
      }
      await Promise.all(queries)

      const startTime = Date.now()

      const request = new NextRequest('http://localhost/api/dashboard/stats', {
        method: 'GET',
        headers: {
          'Cookie': `next-auth.session-token=${testSession.sessionToken}`
        }
      })

      const response = await dashboardStatsHandler(request)
      const result = await response.json()

      const endTime = Date.now()
      const responseTime = endTime - startTime

      expect(response.status).toBe(200)
      expect(result.totalQueries).toBe(100)
      expect(responseTime).toBeLessThan(1000) // Should respond in less than 1 second
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Temporarily break database connection
      await prisma.$disconnect()

      const request = new NextRequest('http://localhost/api/dashboard/stats', {
        method: 'GET',
        headers: {
          'Cookie': `next-auth.session-token=${testSession.sessionToken}`
        }
      })

      const response = await dashboardStatsHandler(request)
      const result = await response.json()

      // Should handle error gracefully
      expect(response.status).toBe(500)
      expect(result.error).toBeDefined()

      // Reconnect for other tests
      prisma = await setupTestDatabase()
    })

    it('should validate pagination parameters', async () => {
      const request = new NextRequest('http://localhost/api/dashboard/data?page=-1&limit=0', {
        method: 'GET',
        headers: {
          'Cookie': `next-auth.session-token=${testSession.sessionToken}`
        }
      })

      const response = await dashboardDataHandler(request)
      const result = await response.json()

      // Should handle invalid parameters gracefully
      expect(response.status).toBe(400)
      expect(result.error).toContain('Invalid')
    })
  })
})