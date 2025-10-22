import Redis from 'ioredis'

/**
 * Rate Limiter with Redis backend and in-memory fallback
 *
 * Uses sliding window algorithm for accurate rate limiting.
 * Automatically falls back to in-memory storage if Redis is unavailable.
 */

// Redis connection (singleton)
let redis: Redis | null = null
let redisAvailable = false

// In-memory fallback storage
const memoryStore = new Map<string, { count: number; resetAt: number }>()

// Initialize Redis connection
function getRedis(): Redis | null {
  if (redis) return redis

  try {
    const redisUrl = process.env.REDIS_URL
    if (!redisUrl) {
      console.warn('[RateLimiter] REDIS_URL not configured, using in-memory fallback')
      return null
    }

    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // Don't retry, fail fast
      enableOfflineQueue: false,
    })

    redis.on('error', (error) => {
      console.error('[RateLimiter] Redis error:', error.message)
      redisAvailable = false
    })

    redis.on('connect', () => {
      console.log('[RateLimiter] Redis connected')
      redisAvailable = true
    })

    return redis
  } catch (error) {
    console.error('[RateLimiter] Failed to initialize Redis:', error)
    return null
  }
}

// Initialize Redis on module load
getRedis()

/**
 * Rate limit result
 */
export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetAt: Date
  retryAfter?: number
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  identifier: string // IP address or user ID
  limit: number // Maximum requests
  windowMs: number // Time window in milliseconds
}

/**
 * Clean up expired entries from in-memory store (called periodically)
 */
function cleanupMemoryStore() {
  const now = Date.now()
  for (const [key, value] of memoryStore.entries()) {
    if (value.resetAt < now) {
      memoryStore.delete(key)
    }
  }
}

// Run cleanup every 60 seconds
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupMemoryStore, 60000)
}

/**
 * Rate limit using Redis (with sliding window)
 */
async function rateLimitRedis(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const redis = getRedis()
  if (!redis || !redisAvailable) {
    throw new Error('Redis not available')
  }

  const key = `ratelimit:${identifier}`
  const now = Date.now()
  const windowStart = now - windowMs

  try {
    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline()

    // Remove old entries outside the window
    pipeline.zremrangebyscore(key, 0, windowStart)

    // Count current entries in window
    pipeline.zcard(key)

    // Add current request timestamp
    pipeline.zadd(key, now, `${now}:${Math.random()}`)

    // Set expiration on the key
    pipeline.expire(key, Math.ceil(windowMs / 1000))

    const results = await pipeline.exec()

    if (!results) {
      throw new Error('Pipeline execution failed')
    }

    // Get count after removing old entries
    const count = results[1][1] as number

    const remaining = Math.max(0, limit - count - 1)
    const success = count < limit
    const resetAt = new Date(now + windowMs)

    return {
      success,
      limit,
      remaining,
      resetAt,
      retryAfter: success ? undefined : Math.ceil(windowMs / 1000)
    }
  } catch (error) {
    console.error('[RateLimiter] Redis operation failed:', error)
    // Fall back to memory
    throw error
  }
}

/**
 * Rate limit using in-memory store (fallback)
 */
function rateLimitMemory(
  identifier: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const key = `ratelimit:${identifier}`
  const now = Date.now()

  const record = memoryStore.get(key)

  if (!record || record.resetAt < now) {
    // Create new window
    const resetAt = now + windowMs
    memoryStore.set(key, { count: 1, resetAt })

    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetAt: new Date(resetAt)
    }
  }

  // Increment count
  record.count++
  const success = record.count <= limit
  const remaining = Math.max(0, limit - record.count)
  const resetAt = new Date(record.resetAt)

  return {
    success,
    limit,
    remaining,
    resetAt,
    retryAfter: success ? undefined : Math.ceil((record.resetAt - now) / 1000)
  }
}

/**
 * Main rate limit function
 *
 * @param identifier - Unique identifier (IP address or user ID)
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns Rate limit result
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  try {
    // Try Redis first
    return await rateLimitRedis(identifier, limit, windowMs)
  } catch (error) {
    // Fall back to in-memory store
    console.warn('[RateLimiter] Using in-memory fallback')
    return rateLimitMemory(identifier, limit, windowMs)
  }
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(request: Request): string {
  // Check common proxy headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  return 'unknown'
}

/**
 * Create rate limit response with headers
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  errorMessage: string = 'Too many requests. Please try again later.'
) {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': result.resetAt.toISOString(),
  }

  if (result.retryAfter) {
    headers['Retry-After'] = String(result.retryAfter)
  }

  return new Response(
    JSON.stringify({
      error: errorMessage,
      retryAfter: result.retryAfter,
      resetAt: result.resetAt.toISOString()
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }
  )
}

/**
 * Predefined rate limit configurations
 */
export const RateLimits = {
  // Authentication endpoints
  LOGIN: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 minutes
  REGISTER: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  FORGOT_PASSWORD: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  RESET_PASSWORD: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour

  // Business endpoints (per user)
  PROTEST_QUERY: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  ORDER_CREATE: { limit: 20, windowMs: 60 * 60 * 1000 }, // 20 per hour
  PAYMENT_CREATE: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour

  // Webhook endpoints
  WEBHOOK: { limit: 100, windowMs: 60 * 1000 }, // 100 per minute

  // Admin endpoints
  ADMIN_SEED: { limit: 1, windowMs: 60 * 60 * 1000 }, // 1 per hour (global)
} as const

/**
 * Check if rate limiting is enabled
 */
export function isRateLimitEnabled(): boolean {
  return process.env.RATE_LIMIT_ENABLED !== 'false'
}
