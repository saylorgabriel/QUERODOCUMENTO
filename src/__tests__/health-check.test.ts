/**
 * Health check test to verify testing infrastructure
 */

import { describe, it, expect, jest } from '@jest/globals'

describe('Testing Infrastructure Health Check', () => {
  it('should have Jest globals available', () => {
    expect(describe).toBeDefined()
    expect(it).toBeDefined()
    expect(expect).toBeDefined()
    expect(jest).toBeDefined()
  })

  it('should have DOM testing setup', () => {
    expect(document).toBeDefined()
    expect(window).toBeDefined()
    expect(global.requestAnimationFrame).toBeDefined()
  })

  it('should have mocked browser APIs', () => {
    expect(window.matchMedia).toBeDefined()
    expect(global.ResizeObserver).toBeDefined()
    expect(global.IntersectionObserver).toBeDefined()
  })

  it('should have localStorage mock', () => {
    expect(window.localStorage).toBeDefined()
    expect(window.localStorage.getItem).toBeDefined()
    expect(window.localStorage.setItem).toBeDefined()
  })

  it('should have fetch mock', () => {
    expect(global.fetch).toBeDefined()
    expect(typeof global.fetch).toBe('function')
  })

  it('should support custom matchers', () => {
    expect(5).toBeWithinRange(1, 10)
    expect(() => expect(15).toBeWithinRange(1, 10)).toThrow()
  })

  it('should clear mocks between tests', () => {
    const mockFn = jest.fn()
    mockFn('test')
    expect(mockFn).toHaveBeenCalledTimes(1)
    
    jest.clearAllMocks()
    expect(mockFn).toHaveBeenCalledTimes(0)
  })

  it('should handle async operations', async () => {
    const promise = Promise.resolve('test-value')
    const result = await promise
    expect(result).toBe('test-value')
  })

  it('should support timeouts', async () => {
    const delayedPromise = new Promise(resolve => 
      setTimeout(() => resolve('delayed'), 10)
    )
    
    const result = await delayedPromise
    expect(result).toBe('delayed')
  }, 1000) // 1 second timeout

  it('should mock file imports', () => {
    // This would normally fail if file mocks weren't working
    expect(() => require('./non-existent-image.png')).not.toThrow()
  })
})