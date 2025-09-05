import { chromium, FullConfig } from '@playwright/test'
import { execSync } from 'child_process'

/**
 * Global setup for E2E tests
 * Prepares test environment and seed data
 */

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up E2E test environment...')

  try {
    // Start test infrastructure if in CI
    if (process.env.CI) {
      console.log('Starting test containers...')
      execSync('docker-compose -f docker-compose.test.yml up -d', { 
        stdio: 'inherit',
        timeout: 60000 
      })
      
      // Wait for services to be ready
      await new Promise(resolve => setTimeout(resolve, 30000))
    }

    // Create test users and seed data
    await seedTestData()

    // Warm up the application
    await warmupApplication(config.projects[0].use.baseURL || 'http://localhost:3009')

    console.log('✅ E2E test environment ready')
  } catch (error) {
    console.error('❌ Failed to setup E2E test environment:', error)
    throw error
  }
}

async function seedTestData() {
  console.log('Seeding test data...')
  
  try {
    // Use API to create test users
    const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://app-dev.querodocumento.orb.local'
    
    const browser = await chromium.launch()
    const context = await browser.newContext()
    const page = await context.newPage()

    // Create admin user
    try {
      await page.goto(`${baseURL}/register`)
      await page.fill('input[name="name"]', 'Admin Test User')
      await page.fill('input[name="email"]', 'admin@querodocumento.com')
      await page.fill('input[name="cpf"]', '000.111.222-33')
      await page.fill('input[name="phone"]', '(11) 90000-0000')
      await page.fill('input[name="password"]', 'admin123')
      await page.fill('input[name="confirmPassword"]', 'admin123')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(2000)
    } catch (error) {
      console.log('Admin user might already exist')
    }

    // Create regular test user
    try {
      await page.goto(`${baseURL}/register`)
      await page.fill('input[name="name"]', 'Test User')
      await page.fill('input[name="email"]', 'test@querodocumento.com')
      await page.fill('input[name="cpf"]', '111.444.777-35')
      await page.fill('input[name="phone"]', '(11) 99999-9999')
      await page.fill('input[name="password"]', 'test123')
      await page.fill('input[name="confirmPassword"]', 'test123')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(2000)
    } catch (error) {
      console.log('Test user might already exist')
    }

    await browser.close()
    console.log('Test data seeded successfully')
  } catch (error) {
    console.log('Failed to seed test data:', error.message)
    // Don't fail setup if seeding fails - tests will handle user creation
  }
}

async function warmupApplication(baseURL: string) {
  console.log('Warming up application...')
  
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Visit main pages to warm up the application
    await page.goto(baseURL, { waitUntil: 'networkidle' })
    await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle' })
    await page.goto(`${baseURL}/register`, { waitUntil: 'networkidle' })
    
    console.log('Application warmed up')
  } catch (error) {
    console.log('Failed to warm up application:', error.message)
  } finally {
    await browser.close()
  }
}

export default globalSetup