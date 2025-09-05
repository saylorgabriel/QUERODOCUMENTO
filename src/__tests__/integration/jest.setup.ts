/**
 * Integration Test Jest Setup
 * Configures Jest environment for integration testing with database
 */

import { setupTestDatabase, cleanDatabase, validateTestEnvironment } from './setup'
import { testServer } from './testServer'

// Validate test environment
validateTestEnvironment()

// Global test setup
beforeAll(async () => {
  // Start test server
  await testServer.start()
  
  // Setup test database
  await setupTestDatabase()
})

// Clean database before each test
beforeEach(async () => {
  await cleanDatabase()
})

// Global test teardown
afterAll(async () => {
  // Stop test server
  await testServer.stop()
})

// Extend timeout for integration tests
jest.setTimeout(30000)

// Mock environment variables for testing
process.env.NODE_ENV = 'test'
process.env.TEST_DATABASE_URL = 'postgresql://querodoc_test:test123@localhost:5433/querodocumento_test'
process.env.REDIS_URL = 'redis://localhost:6380'
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-integration-tests'
process.env.NEXTAUTH_URL = 'http://localhost:3001'
process.env.EMAIL_USE_MAILHOG = 'true'
process.env.MAILHOG_HOST = 'localhost'
process.env.MAILHOG_PORT = '1026'

// Mock Next.js runtime environment
Object.defineProperty(global, 'Request', {
  value: class MockRequest {
    constructor(input: string | URL, init?: RequestInit) {
      Object.assign(this, { url: input, ...init })
    }
  }
})

Object.defineProperty(global, 'Response', {
  value: class MockResponse {
    constructor(body?: any, init?: ResponseInit) {
      Object.assign(this, { body, status: 200, ...init })
    }
    static json(data: any, init?: ResponseInit) {
      return new MockResponse(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
        ...init
      })
    }
  }
})

// Suppress console logs during tests unless in verbose mode
if (!process.env.VERBOSE_TESTS) {
  console.log = jest.fn()
  console.info = jest.fn()
  console.warn = jest.fn()
}

// Keep console.error for debugging failures
const originalError = console.error
console.error = (...args: any[]) => {
  if (args[0]?.includes?.('Warning:')) {
    return // Suppress React warnings
  }
  originalError.apply(console, args)
}