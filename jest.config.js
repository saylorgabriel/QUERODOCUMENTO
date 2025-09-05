const nextJest = require('next/jest')

// Create Jest config with Next.js defaults
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Custom Jest configuration
const customJestConfig = {
  // Test environment setup with Web APIs
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  
  // Module paths for import resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '^@/data/(.*)$': '<rootDir>/src/data/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 
      '<rootDir>/src/__tests__/__mocks__/fileMock.js',
  },
  
  // Test patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(test|spec).{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}',
    '<rootDir>/__tests__/**/*.(test|spec).{js,jsx,ts,tsx}',
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/src/__tests__/__mocks__/',
    '<rootDir>/src/__tests__/fixtures/',
    '<rootDir>/src/__tests__/utils/',
    '<rootDir>/src/__tests__/setup.ts',
    '<rootDir>/src/__tests__/globalSetup.ts',
    '<rootDir>/src/__tests__/globalTeardown.ts',
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/app/**/layout.tsx',
    '!src/app/**/loading.tsx',
    '!src/app/**/error.tsx',
    '!src/app/**/not-found.tsx',
    '!src/components/ui/**', // Exclude shadcn components from coverage
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Coverage reporting
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Transform configuration for Bun compatibility
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    '/node_modules/(?!(msw|@bundled-es-modules)/)',
  ],
  
  // Test timeout
  testTimeout: 10000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Reset modules between tests
  resetMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true,
  
  
  // Global setup for MSW
  globalSetup: '<rootDir>/src/__tests__/globalSetup.ts',
  globalTeardown: '<rootDir>/src/__tests__/globalTeardown.ts',
  
  // Verbose output for debugging
  verbose: false,
  
  // Handle ES modules correctly
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // Additional Jest options for better Bun compatibility
  preset: undefined, // Don't use ts-jest preset, configure manually
  
  // Handle dynamic imports
  resolver: undefined,
  
  // Custom test result processor for better output
  testResultsProcessor: undefined,
}

// Export the Jest configuration created with Next.js defaults
module.exports = createJestConfig(customJestConfig)