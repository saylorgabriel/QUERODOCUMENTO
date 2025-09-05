import { FullConfig } from '@playwright/test'
import { execSync } from 'child_process'

/**
 * Global teardown for E2E tests
 * Cleans up test environment
 */

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Tearing down E2E test environment...')

  try {
    // Stop test infrastructure if in CI
    if (process.env.CI) {
      console.log('Stopping test containers...')
      execSync('docker-compose -f docker-compose.test.yml down -v', { 
        stdio: 'inherit',
        timeout: 30000 
      })
    }

    // Generate test summary
    generateTestSummary()

    console.log('✅ E2E test environment cleaned up')
  } catch (error) {
    console.error('❌ Failed to teardown E2E test environment:', error)
    // Don't throw error as it might mask test results
  }
}

function generateTestSummary() {
  try {
    const fs = require('fs')
    const path = require('path')
    
    const resultsPath = path.join(process.cwd(), 'test-results/results.json')
    
    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'))
      
      const summary = {
        timestamp: new Date().toISOString(),
        totalTests: results.stats?.total || 0,
        passed: results.stats?.passed || 0,
        failed: results.stats?.failed || 0,
        skipped: results.stats?.skipped || 0,
        duration: results.stats?.duration || 0,
        projects: results.suites?.map((suite: any) => suite.title) || []
      }
      
      const summaryPath = path.join(process.cwd(), 'test-results/summary.json')
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2))
      
      console.log(`Test Summary:`)
      console.log(`  Total: ${summary.totalTests}`)
      console.log(`  Passed: ${summary.passed}`)
      console.log(`  Failed: ${summary.failed}`)
      console.log(`  Skipped: ${summary.skipped}`)
      console.log(`  Duration: ${Math.round(summary.duration / 1000)}s`)
    }
  } catch (error) {
    console.log('Could not generate test summary:', error.message)
  }
}

export default globalTeardown