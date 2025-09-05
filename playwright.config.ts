import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e-tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Test timeout and expect timeout
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  
  // Enhanced reporting
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit-results.xml' }],
    ['list'],
    ...(process.env.CI ? [['github']] : [])
  ],
  
  // Global test configuration
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://app-dev.querodocumento.orb.local',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Browser context options
    ignoreHTTPSErrors: true,
    colorScheme: 'light',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    
    // Viewport for consistent testing
    viewport: { width: 1280, height: 720 },
    
    // Action timeout
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  
  // Cross-browser testing projects
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile browsers
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // Tablet
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
    },
    
    // High DPI displays
    {
      name: 'chromium-high-dpi',
      use: { 
        ...devices['Desktop Chrome'],
        deviceScaleFactor: 2,
      },
    },
    
    // Different viewport sizes
    {
      name: 'small-screen',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 }
      },
    },
    {
      name: 'large-screen',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    
    // Dark mode testing
    {
      name: 'dark-mode',
      use: { 
        ...devices['Desktop Chrome'],
        colorScheme: 'dark',
      },
    },
    
    // Accessibility testing with specific settings
    {
      name: 'accessibility',
      use: { 
        ...devices['Desktop Chrome'],
        reducedMotion: 'reduce',
        forcedColors: 'active',
      },
    },
    
    // Performance testing (throttled network)
    {
      name: 'slow-3g',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--force-device-scale-factor=1']
        }
      },
    }
  ],
  
  // Web server configuration
  webServer: {
    command: process.env.CI 
      ? 'docker-compose -f docker-compose.test.yml up -d && sleep 10'
      : 'echo "Assuming app is already running"',
    url: process.env.PLAYWRIGHT_BASE_URL || 'http://app-dev.querodocumento.orb.local',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes
  },
  
  // Output directories
  outputDir: 'test-results/',
  
  // Global setup and teardown
  globalSetup: require.resolve('./e2e-tests/global-setup.ts'),
  globalTeardown: require.resolve('./e2e-tests/global-teardown.ts'),
});