/**
 * Global Setup for Integration Tests
 * Initializes test environment before running integration tests
 */

import { testServer } from './testServer'

export default async function globalSetup() {
  console.log('🚀 Setting up integration test environment...')
  
  try {
    // Start test server and database
    await testServer.start()
    
    console.log('✅ Integration test environment ready')
  } catch (error) {
    console.error('❌ Failed to setup integration test environment:', error)
    throw error
  }
}