/**
 * Testing utilities and custom render functions
 */

import React, { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  events: {
    on: jest.fn(),
    off: jest.fn(),
  },
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Wrapper component for providers
interface AllTheProvidersProps {
  children: ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <div data-testid="test-wrapper">
      {children}
    </div>
  )
}

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const user = userEvent.setup()
  
  return {
    user,
    ...render(ui, { wrapper: AllTheProviders, ...options })
  }
}

// Utility functions for common test patterns
export const createMockFormData = (data: Record<string, any>) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, String(value))
  })
  return formData
}

export const mockFetch = (response: any, options: { status?: number, ok?: boolean } = {}) => {
  const mockResponse = {
    ok: options.ok !== undefined ? options.ok : true,
    status: options.status || 200,
    json: jest.fn().mockResolvedValue(response),
    text: jest.fn().mockResolvedValue(JSON.stringify(response)),
    headers: new Headers(),
  }
  
  global.fetch = jest.fn().mockResolvedValue(mockResponse)
  return mockResponse
}

export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    store
  }
}

// Utility to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock cookie functions
export const mockCookies = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
}

// Mock session data
export const createMockSession = (overrides = {}) => ({
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    cpf: '12345678901',
    phone: '11999999999',
    ...overrides,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
})

// Helper to create mock API responses
export const createApiResponse = (data: any, success = true, error?: string) => ({
  success,
  data: success ? data : undefined,
  error: error || undefined,
})

// Test data generators
export const generateTestCPF = (valid = true) => {
  if (valid) {
    return '11144477735' // Valid test CPF
  }
  return '12345678900' // Invalid test CPF
}

export const generateTestCNPJ = (valid = true) => {
  if (valid) {
    return '11222333000181' // Valid test CNPJ
  }
  return '12345678000100' // Invalid test CNPJ
}

// Custom matchers type declarations
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R
    }
  }
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render, mockRouter }