/**
 * Global Jest Setup
 * Runs once before all tests
 */

export default async function globalSetup() {
  // Set up MSW server if needed
  console.log('🧪 Setting up global test environment...')
  
  // Initialize any global mocks or setup that needs to happen once
  process.env.NODE_ENV = 'test'
  
  // You can initialize database connections, MSW server, etc. here
  // Example: await startMockServer()
  
  console.log('✅ Global test environment ready')
}