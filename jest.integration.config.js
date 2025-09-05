const nextJest = require('next/jest')

// Create Jest config for integration tests
const createJestConfig = nextJest({
  dir: './',
})

// Integration test specific configuration
const integrationConfig = {
  displayName: 'Integration Tests',
  testEnvironment: 'node', // Use Node.js environment for API testing
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/integration/jest.setup.ts'
  ],
  
  // Test patterns - only integration tests
  testMatch: [
    '<rootDir>/src/__tests__/integration/**/*.test.{js,ts}',
    '<rootDir>/src/app/api/**/__integration__/**/*.test.{js,ts}',
  ],
  
  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
  
  // Coverage for integration tests
  collectCoverageFrom: [
    'src/app/api/**/*.ts',
    'src/lib/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],
  
  // Higher timeout for database operations
  testTimeout: 30000,
  
  // Run tests sequentially to avoid database conflicts
  maxWorkers: 1,
  
  // Clear mocks and database between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Global setup and teardown for database
  globalSetup: '<rootDir>/src/__tests__/integration/globalSetup.ts',
  globalTeardown: '<rootDir>/src/__tests__/integration/globalTeardown.ts',
  
  // Handle ES modules
  extensionsToTreatAsEsm: ['.ts'],
  transformIgnorePatterns: [
    '/node_modules/(?!(msw|@bundled-es-modules)/)',
  ],
  
  // Verbose output for debugging
  verbose: true,
  
  // Test result formatting
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './test-results/integration',
      filename: 'integration-test-report.html',
      expand: true,
    }]
  ],
}

module.exports = createJestConfig(integrationConfig)