import { describe, it, expect, beforeEach } from 'bun:test'
import { rateLimit, getClientIp, RateLimits } from '../rate-limiter'

describe('Rate Limiter', () => {
  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new Request('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1'
        }
      })

      const ip = getClientIp(request)
      expect(ip).toBe('192.168.1.1')
    })

    it('should extract IP from x-real-ip header', () => {
      const request = new Request('http://localhost:3000', {
        headers: {
          'x-real-ip': '192.168.1.2'
        }
      })

      const ip = getClientIp(request)
      expect(ip).toBe('192.168.1.2')
    })

    it('should extract IP from cf-connecting-ip header', () => {
      const request = new Request('http://localhost:3000', {
        headers: {
          'cf-connecting-ip': '192.168.1.3'
        }
      })

      const ip = getClientIp(request)
      expect(ip).toBe('192.168.1.3')
    })

    it('should return unknown if no IP headers present', () => {
      const request = new Request('http://localhost:3000')

      const ip = getClientIp(request)
      expect(ip).toBe('unknown')
    })
  })

  describe('rateLimit', () => {
    it('should allow requests within limit', async () => {
      const identifier = `test-${Date.now()}-${Math.random()}`
      const limit = 5
      const windowMs = 60000

      const result = await rateLimit(identifier, limit, windowMs)

      expect(result.success).toBe(true)
      expect(result.limit).toBe(limit)
      expect(result.remaining).toBeGreaterThanOrEqual(0)
      expect(result.resetAt).toBeInstanceOf(Date)
    })

    it('should block requests exceeding limit', async () => {
      const identifier = `test-block-${Date.now()}-${Math.random()}`
      const limit = 2
      const windowMs = 60000

      // Make requests up to the limit
      await rateLimit(identifier, limit, windowMs)
      await rateLimit(identifier, limit, windowMs)

      // This should exceed the limit
      const result = await rateLimit(identifier, limit, windowMs)

      expect(result.success).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('should use different counters for different identifiers', async () => {
      const identifier1 = `test-id1-${Date.now()}-${Math.random()}`
      const identifier2 = `test-id2-${Date.now()}-${Math.random()}`
      const limit = 2
      const windowMs = 60000

      // Exhaust limit for identifier1
      await rateLimit(identifier1, limit, windowMs)
      await rateLimit(identifier1, limit, windowMs)
      const result1 = await rateLimit(identifier1, limit, windowMs)

      // identifier2 should still work
      const result2 = await rateLimit(identifier2, limit, windowMs)

      expect(result1.success).toBe(false)
      expect(result2.success).toBe(true)
    })

    it('should have correct rate limit configurations', () => {
      expect(RateLimits.LOGIN.limit).toBe(5)
      expect(RateLimits.LOGIN.windowMs).toBe(15 * 60 * 1000)

      expect(RateLimits.REGISTER.limit).toBe(3)
      expect(RateLimits.REGISTER.windowMs).toBe(60 * 60 * 1000)

      expect(RateLimits.PROTEST_QUERY.limit).toBe(10)
      expect(RateLimits.PROTEST_QUERY.windowMs).toBe(60 * 60 * 1000)

      expect(RateLimits.WEBHOOK.limit).toBe(100)
      expect(RateLimits.WEBHOOK.windowMs).toBe(60 * 1000)

      expect(RateLimits.ADMIN_SEED.limit).toBe(1)
      expect(RateLimits.ADMIN_SEED.windowMs).toBe(60 * 60 * 1000)
    })
  })
})
