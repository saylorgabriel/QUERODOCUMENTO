/**
 * Global Teardown for Integration Tests
 * Cleans up test environment after running integration tests
 */

import { testServer } from './testServer'

export default async function globalTeardown() {
  console.log('🧹 Tearing down integration test environment...')
  
  try {
    // Stop test server and cleanup
    await testServer.stop()
    
    console.log('✅ Integration test environment cleaned up')
  } catch (error) {
    console.error('❌ Failed to teardown integration test environment:', error)
    // Don't throw here to avoid masking test results
  }
}