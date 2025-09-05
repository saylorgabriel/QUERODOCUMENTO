/**
 * Next.js mocks for testing
 */

import { jest } from '@jest/globals'

// Mock Next.js navigation
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isReady: true,
  isPreview: false,
}

// Mock useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => mockRouter),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
  notFound: jest.fn(),
  redirect: jest.fn(),
  permanentRedirect: jest.fn(),
}))

// Mock Next.js Image component
jest.mock('next/image', () => {
  return {
    __esModule: true,
    default: ({ src, alt, ...props }: any) => {
      return {
        type: 'img',
        props: { src, alt, ...props }
      }
    },
  }
})

// Mock Next.js Link component
jest.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({ children, href, ...props }: any) => {
      return {
        type: 'a',
        props: { href, ...props, children }
      }
    },
  }
})

// Mock Next.js cookies
export const mockCookies = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  has: jest.fn(),
  getAll: jest.fn(() => []),
}

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => mockCookies),
  headers: jest.fn(() => new Headers()),
}))

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => {
  return jest.fn((dynamicFunction: () => any) => {
    const Component = dynamicFunction()
    return Component
  })
})

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'

export { mockRouter as useRouter }