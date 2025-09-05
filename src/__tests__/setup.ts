/**
 * Jest Test Setup File
 * This file runs before each test suite
 */

// Extend Jest matchers with @testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
import { jest } from '@jest/globals'

// Mock Next.js environment variables
process.env.NODE_ENV = 'test'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb'

// Mock window.matchMedia for components that use media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock window.ResizeObserver for components that use it
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 0))
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id))

// Mock console methods to reduce noise in test output
const originalError = console.error
console.error = (...args: any[]) => {
  if (
    args[0]?.includes?.('Warning: ReactDOM.render is no longer supported') ||
    args[0]?.includes?.('Warning: An invalid form control') ||
    args[0]?.includes?.('"act" is not defined')
  ) {
    return
  }
  originalError(...args)
}

// Setup performance mock for timing tests
global.performance = global.performance || {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
} as any

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Mock URL for components that create URLs
global.URL.createObjectURL = jest.fn(() => 'mocked-url')
global.URL.revokeObjectURL = jest.fn()

// Mock Blob for file operations
global.Blob = jest.fn().mockImplementation((content, options) => ({
  content,
  options,
  size: content ? content.length : 0,
  type: options?.type || '',
}))

// Mock File for file upload operations
global.File = jest.fn().mockImplementation((content, name, options) => ({
  content,
  name,
  options,
  size: content ? content.length : 0,
  type: options?.type || '',
  lastModified: Date.now(),
}))

// Mock fetch globally (will be overridden by MSW when needed)
global.fetch = jest.fn()

// Simple Request/Response mocks that work with NextJS
class MockRequest {
  url: string | URL
  method: string
  headers: Map<string, string>
  body?: any
  
  constructor(input: string | URL, init: RequestInit = {}) {
    this.url = input
    this.method = init.method || 'GET'
    this.headers = new Map()
    if (init.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => this.headers.set(key, value))
      } else if (Array.isArray(init.headers)) {
        init.headers.forEach(([key, value]) => this.headers.set(key, value))
      } else {
        Object.entries(init.headers).forEach(([key, value]) => {
          if (typeof value === 'string') {
            this.headers.set(key, value)
          }
        })
      }
    }
    this.body = init.body
  }
  
  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
  }
}

class MockResponse {
  status: number
  headers: Map<string, string>
  body?: any
  
  constructor(body?: any, init: ResponseInit = {}) {
    this.body = body
    this.status = init.status || 200
    this.headers = new Map()
    if (init.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((value, key) => this.headers.set(key, value))
      } else if (Array.isArray(init.headers)) {
        init.headers.forEach(([key, value]) => this.headers.set(key, value))
      } else {
        Object.entries(init.headers).forEach(([key, value]) => {
          if (typeof value === 'string') {
            this.headers.set(key, value)
          }
        })
      }
    }
  }
  
  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
  }
  
  static json(data: any, init?: ResponseInit) {
    return new MockResponse(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      ...init
    })
  }
}

// Only set globals if they don't exist (avoid conflicts with NextJS)
if (typeof global.Request === 'undefined') {
  global.Request = MockRequest as any
}
if (typeof global.Response === 'undefined') {
  global.Response = MockResponse as any
}
if (typeof global.Headers === 'undefined') {
  global.Headers = class MockHeaders extends Map {} as any
}

// Custom Jest matchers for improved testing
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      }
    }
  },
})