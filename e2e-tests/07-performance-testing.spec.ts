import { test, expect, Page } from '@playwright/test'

/**
 * Performance E2E Tests
 * Tests application performance, load times, and resource usage
 */

test.describe('Performance Testing', () => {
  test('should load landing page within performance budget', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/', { waitUntil: 'networkidle' })
    
    const loadTime = Date.now() - startTime
    
    // Landing page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000)
    
    // Check Core Web Vitals
    const [lcp, fid, cls] = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lcpEntry = entries.find(entry => entry.entryType === 'largest-contentful-paint')
          
          resolve([
            lcpEntry?.startTime || 0, // LCP
            0, // FID (difficult to measure in automated tests)
            0  // CLS (would need more complex measurement)
          ])
        }).observe({ entryTypes: ['largest-contentful-paint'] })
        
        // Fallback timeout
        setTimeout(() => resolve([0, 0, 0]), 1000)
      })
    })
    
    // LCP should be under 2.5 seconds (2500ms)
    expect(lcp).toBeLessThan(2500)
    
    // Check if critical resources loaded
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('input[name="document"]')).toBeVisible()
  })

  test('should handle consultation form submission performance', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@querodocumento.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    
    await page.goto('/consulta')
    
    // Measure form submission performance
    const startTime = Date.now()
    
    await page.fill('input[name="document"]', '111.444.777-35')
    await page.click('button[text="Consultar"]')
    
    // Wait for results
    await expect(page.locator('[data-testid="consultation-result"]')).toBeVisible()
    
    const responseTime = Date.now() - startTime
    
    // Consultation should complete in under 5 seconds
    expect(responseTime).toBeLessThan(5000)
  })

  test('should load dashboard data efficiently', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@querodocumento.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    
    const startTime = Date.now()
    
    await page.goto('/dashboard')
    
    // Wait for all dashboard elements to load
    await expect(page.locator('[data-testid="dashboard-stats"]')).toBeVisible()
    await expect(page.locator('[data-testid="consultation-history"]')).toBeVisible()
    
    const loadTime = Date.now() - startTime
    
    // Dashboard should load in under 2 seconds
    expect(loadTime).toBeLessThan(2000)
  })

  test('should handle large data sets in dashboard pagination', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@querodocumento.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    
    await page.goto('/dashboard')
    
    // Measure pagination performance
    const startTime = Date.now()
    
    // Navigate through pages
    if (await page.locator('button[aria-label="Próxima página"]').isVisible()) {
      await page.click('button[aria-label="Próxima página"]')
      await expect(page.locator('[data-testid="consultation-history"]')).toBeVisible()
    }
    
    const paginationTime = Date.now() - startTime
    
    // Pagination should be fast (under 1 second)
    expect(paginationTime).toBeLessThan(1000)
  })

  test('should measure resource loading performance', async ({ page }) => {
    // Track network requests
    const requests: Array<{ url: string, size: number, time: number }> = []
    
    page.on('response', async (response) => {
      if (response.url().includes(page.url().split('/')[2])) {
        try {
          const headers = response.headers()
          const size = parseInt(headers['content-length'] || '0')
          const time = response.timing().responseEnd
          
          requests.push({
            url: response.url(),
            size,
            time
          })
        } catch (error) {
          // Ignore errors for measuring
        }
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check bundle sizes
    const jsFiles = requests.filter(req => req.url.endsWith('.js'))
    const cssFiles = requests.filter(req => req.url.endsWith('.css'))
    
    // Main JS bundle should be under 1MB
    const mainJsFile = jsFiles.find(file => file.url.includes('main') || file.url.includes('index'))
    if (mainJsFile) {
      expect(mainJsFile.size).toBeLessThan(1024 * 1024) // 1MB
    }
    
    // CSS should be under 200KB
    const totalCssSize = cssFiles.reduce((sum, file) => sum + file.size, 0)
    expect(totalCssSize).toBeLessThan(200 * 1024) // 200KB
  })

  test('should handle concurrent form submissions', async ({ browser }) => {
    // Create multiple pages to simulate concurrent users
    const pages = await Promise.all([
      browser.newPage(),
      browser.newPage(),
      browser.newPage()
    ])
    
    // Login on all pages
    for (const page of pages) {
      await page.goto('/login')
      await page.fill('input[name="email"]', 'test@querodocumento.com')
      await page.fill('input[name="password"]', 'test123')
      await page.click('button[type="submit"]')
      await page.goto('/consulta')
    }
    
    // Submit consultations concurrently
    const startTime = Date.now()
    
    const submissions = pages.map(async (page, index) => {
      await page.fill('input[name="document"]', `11144477${735 + index}`)
      await page.click('button[text="Consultar"]')
      return page.waitForSelector('[data-testid="consultation-result"]')
    })
    
    await Promise.all(submissions)
    
    const totalTime = Date.now() - startTime
    
    // All concurrent submissions should complete within reasonable time
    expect(totalTime).toBeLessThan(10000) // 10 seconds
    
    // Clean up
    await Promise.all(pages.map(page => page.close()))
  })

  test('should measure memory usage over time', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@querodocumento.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        }
      }
      return null
    })
    
    // Perform multiple operations
    for (let i = 0; i < 5; i++) {
      await page.goto('/dashboard')
      await page.goto('/consulta')
      await page.fill('input[name="document"]', `11144477${735 + i}`)
      await page.click('button[text="Consultar"]')
      await expect(page.locator('[data-testid="consultation-result"]')).toBeVisible()
    }
    
    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      if (performance.memory) {
        return {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        }
      }
      return null
    })
    
    if (initialMemory && finalMemory) {
      // Memory growth should be reasonable (less than 50MB)
      const memoryGrowth = finalMemory.used - initialMemory.used
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024) // 50MB
    }
  })

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow 3G network
    await page.context().addInitScript(() => {
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '3g',
          downlink: 0.7,
          rtt: 300
        }
      })
    })
    
    // Throttle network
    await page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100)) // Add 100ms delay
      route.continue()
    })
    
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForSelector('h1')
    
    const loadTime = Date.now() - startTime
    
    // Should still load within reasonable time even on slow network
    expect(loadTime).toBeLessThan(8000) // 8 seconds
  })

  test('should optimize image loading', async ({ page }) => {
    const imageRequests: Array<{ url: string, size: number }> = []
    
    page.on('response', async (response) => {
      if (response.headers()['content-type']?.includes('image')) {
        const size = parseInt(response.headers()['content-length'] || '0')
        imageRequests.push({ url: response.url(), size })
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check that images are optimized
    for (const image of imageRequests) {
      // Individual images should be under 500KB
      expect(image.size).toBeLessThan(500 * 1024)
    }
    
    // Total image size should be reasonable
    const totalImageSize = imageRequests.reduce((sum, img) => sum + img.size, 0)
    expect(totalImageSize).toBeLessThan(2 * 1024 * 1024) // 2MB total
  })

  test('should measure API response times', async ({ page }) => {
    const apiTimes: Array<{ endpoint: string, time: number }> = []
    
    page.on('response', (response) => {
      if (response.url().includes('/api/')) {
        const timing = response.timing()
        apiTimes.push({
          endpoint: response.url(),
          time: timing.responseEnd
        })
      }
    })
    
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@querodocumento.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    
    await page.goto('/dashboard')
    
    // Check API response times
    const dashboardApiCall = apiTimes.find(api => api.endpoint.includes('/api/dashboard'))
    if (dashboardApiCall) {
      // Dashboard API should respond within 1 second
      expect(dashboardApiCall.time).toBeLessThan(1000)
    }
  })
})