# Testing Guide - QUERODOCUMENTO

This comprehensive guide covers all aspects of testing in the QUERODOCUMENTO project, including unit tests, integration tests, and end-to-end (E2E) tests.

## Table of Contents

- [Overview](#overview)
- [Test Architecture](#test-architecture)
- [Setup & Installation](#setup--installation)
- [Running Tests](#running-tests)
- [Test Types](#test-types)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Overview

The QUERODOCUMENTO project uses a multi-layered testing approach:

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test API routes with real database interactions
- **E2E Tests**: Test complete user workflows across browsers
- **Performance Tests**: Measure application performance and resource usage
- **Accessibility Tests**: Ensure WCAG 2.1 compliance

### Testing Stack

- **Unit/Integration**: Jest with React Testing Library
- **E2E**: Playwright with cross-browser support
- **Database**: PostgreSQL with Prisma (isolated test database)
- **API Mocking**: MSW (Mock Service Worker)
- **Performance**: Lighthouse CI
- **Accessibility**: axe-playwright

## Test Architecture

```
testing-infrastructure/
├── unit-tests/                 # Component and utility tests
│   ├── src/__tests__/         # Test setup and utilities
│   └── src/*/tests/          # Co-located component tests
├── integration-tests/         # API + Database tests
│   ├── setup.ts              # Test database configuration
│   └── api/                  # API route integration tests
├── e2e-tests/                # End-to-end browser tests
│   ├── helpers/              # Test data and utilities
│   ├── global-setup.ts       # E2E environment setup
│   └── *.spec.ts            # Test specifications
├── docker-compose.test.yml   # Test infrastructure
└── scripts/                  # Test data seeding
```

## Setup & Installation

### Prerequisites

- Docker and Docker Compose
- Bun runtime
- Node.js 18+ (for Playwright)

### Initial Setup

```bash
# Install dependencies
bun install

# Setup test infrastructure
bun run test:setup

# Generate Prisma client
bun run db:generate

# Seed test data
bun run test:seed
```

### Environment Variables

Create `.env.test` file:

```env
NODE_ENV=test
DATABASE_URL=postgresql://querodoc_test:test123@localhost:5433/querodocumento_test
REDIS_URL=redis://localhost:6380
NEXTAUTH_SECRET=test-secret-key
NEXTAUTH_URL=http://localhost:3001
EMAIL_USE_MAILHOG=true
MAILHOG_HOST=localhost
MAILHOG_PORT=1026
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
bun test

# Run with coverage
bun run test:coverage

# Watch mode for development
bun run test:watch

# Debug specific test
bun run test:debug -- --testNamePattern="CPF validation"
```

### Integration Tests

```bash
# Run integration tests
bun run test:integration

# Watch mode
bun run test:integration:watch

# Start test database first
bun run test:setup
```

### E2E Tests

```bash
# Run all E2E tests
bun run test:e2e

# Run specific browser
bun run test:e2e:chrome
bun run test:e2e:firefox
bun run test:e2e:safari

# Run mobile tests
bun run test:e2e:mobile

# Debug mode
bun run test:e2e:debug

# UI mode for development
bun run test:e2e:ui
```

### All Tests

```bash
# Run complete test suite
bun run test:all

# Clean up after tests
bun run test:teardown
```

## Test Types

### 1. Unit Tests

**Location**: `src/**/__tests__/*.test.ts`
**Purpose**: Test individual functions and components

```typescript
// Example: src/lib/__tests__/validators.test.ts
describe('CPF Validation', () => {
  it('should validate correct CPF', () => {
    expect(validateCPF('11144477735')).toBe(true)
  })

  it('should reject invalid CPF', () => {
    expect(validateCPF('12345678900')).toBe(false)
  })
})
```

### 2. Integration Tests

**Location**: `src/__tests__/integration/*.test.ts`
**Purpose**: Test API routes with database operations

```typescript
// Example: Authentication integration test
describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const user = await createTestUser()
    const response = await loginHandler(mockRequest)
    expect(response.status).toBe(200)
  })
})
```

### 3. E2E Tests

**Location**: `e2e-tests/*.spec.ts`
**Purpose**: Test complete user workflows

```typescript
// Example: User journey test
test('should complete registration and consultation flow', async ({ page }) => {
  await page.goto('/')
  await page.fill('input[name="document"]', '111.444.777-35')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=Consulta realizada')).toBeVisible()
})
```

### 4. Performance Tests

**Location**: `e2e-tests/07-performance-testing.spec.ts`
**Purpose**: Measure load times and resource usage

```typescript
test('should load landing page within performance budget', async ({ page }) => {
  const startTime = Date.now()
  await page.goto('/')
  const loadTime = Date.now() - startTime
  expect(loadTime).toBeLessThan(3000)
})
```

### 5. Accessibility Tests

**Location**: `e2e-tests/08-accessibility-testing.spec.ts`
**Purpose**: Ensure WCAG compliance

```typescript
test('should pass accessibility audit', async ({ page }) => {
  await page.goto('/')
  await injectAxe(page)
  await checkA11y(page)
})
```

## Writing Tests

### Test Data Management

Use the provided test helpers:

```typescript
import { createTestHelpers, TEST_USERS, TEST_DOCUMENTS } from '@/e2e-tests/helpers/test-data'

// In your test
const helpers = createTestHelpers(page)
await helpers.auth.loginAs('user')
await helpers.consultation.performConsultation(TEST_DOCUMENTS.cpf.valid[0])
```

### Database Integration Tests

```typescript
import { setupTestDatabase, createTestUser } from '@/src/__tests__/integration/setup'

describe('API Integration', () => {
  let prisma: any

  beforeAll(async () => {
    prisma = await setupTestDatabase()
  })

  beforeEach(async () => {
    await cleanDatabase()
  })

  it('should create user', async () => {
    const user = await createTestUser()
    expect(user.email).toBeDefined()
  })
})
```

### Mock External Services

```typescript
// Mock external protest API
jest.mock('@/lib/protest-api', () => ({
  consultProtesto: jest.fn().mockResolvedValue({
    success: true,
    found: false,
    message: 'Nenhum protesto encontrado'
  })
}))
```

### Cross-Browser Testing

Tests automatically run across:
- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Chrome Mobile, Safari Mobile  
- **Tablet**: iPad Pro
- **Different Viewports**: Small, large, high-DPI
- **Accessibility Settings**: Reduced motion, dark mode

## CI/CD Integration

### GitHub Actions Workflow

The project includes a comprehensive CI/CD pipeline:

```yaml
# .github/workflows/test.yml
- Unit Tests (runs on every push)
- Integration Tests (with test database)
- E2E Tests (cross-browser)
- Performance Tests (on PRs)
- Security Tests (vulnerability scanning)
- Accessibility Tests (WCAG compliance)
```

### Test Reports

- **Coverage**: Uploaded to Codecov
- **E2E Results**: HTML reports in artifacts
- **Performance**: Lighthouse CI integration
- **Security**: GitHub Security tab integration

### Quality Gates

Tests must pass before merging:
- Minimum 70% code coverage
- All E2E tests pass
- No high-severity security vulnerabilities
- Accessibility standards met

## Test Data

### Seeding Test Data

```bash
# Seed with default data
bun run test:seed

# Custom data amounts
bun run test:seed --users 20 --queries 100 --orders 50

# Clean all test data
bun run test:clean
```

### Test Users

Predefined test accounts:

```typescript
TEST_USERS = {
  admin: { email: 'admin@test.com', password: 'test123' },
  user: { email: 'test@querodocumento.com', password: 'test123' }
}
```

### Test Documents

Valid test CPF/CNPJ numbers:

```typescript
TEST_DOCUMENTS = {
  cpf: {
    valid: ['111.444.777-35', '222.555.888-44'],
    withProtests: ['333.666.999-77'],
    withoutProtests: ['111.444.777-35']
  }
}
```

## Performance Benchmarks

### Target Metrics

- **Landing Page Load**: < 3 seconds
- **API Response Time**: < 1 second
- **Consultation Flow**: < 5 seconds
- **Dashboard Load**: < 2 seconds
- **Bundle Size**: < 1MB JavaScript

### Monitoring

Tests automatically check:
- Core Web Vitals (LCP, FID, CLS)
- Resource loading times
- Memory usage patterns
- Network request efficiency

## Accessibility Standards

### WCAG 2.1 Level AA Compliance

- Keyboard navigation support
- Screen reader compatibility
- Color contrast requirements
- Focus management
- Alternative text for images
- Semantic HTML structure

### Testing Tools

- **axe-playwright**: Automated accessibility testing
- **Manual Testing**: Keyboard navigation, screen reader simulation
- **High Contrast**: Support for different color schemes

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Restart test database
bun run test:teardown
bun run test:setup
```

#### E2E Test Failures
```bash
# Run in headed mode to see browser
bun run test:e2e:headed

# Debug specific test
bun run test:e2e:debug --grep "login flow"
```

#### Integration Test Timeouts
```bash
# Check database status
docker-compose -f docker-compose.test.yml ps

# View logs
docker-compose -f docker-compose.test.yml logs
```

### Performance Issues

#### Slow Test Execution
- Run tests in parallel: `--workers=4`
- Use specific test patterns: `--grep "critical"`
- Skip non-essential tests: `--ignore-pattern="slow"`

#### Memory Leaks
- Check for open handles: `--detectOpenHandles`
- Review mock cleanup: `afterEach(() => jest.clearAllMocks())`
- Monitor test database connections

### Browser-Specific Issues

#### WebKit/Safari Tests
- Install webkit dependencies: `playwright install webkit`
- Check for Safari-specific CSS issues
- Verify touch event handling

#### Mobile Tests
- Ensure proper viewport settings
- Test touch interactions
- Verify responsive design

## Best Practices

### Test Structure

```typescript
describe('Feature Name', () => {
  beforeAll(async () => {
    // Setup that runs once
  })

  beforeEach(async () => {
    // Setup that runs before each test
  })

  afterEach(async () => {
    // Cleanup after each test
  })

  describe('Happy Path', () => {
    it('should handle valid input', async () => {
      // Test implementation
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid input', async () => {
      // Error test implementation
    })
  })
})
```

### Test Naming

- Use descriptive test names
- Follow "should do X when Y" pattern
- Group related tests in describe blocks
- Use consistent terminology

### Assertions

```typescript
// Good: Specific assertions
expect(result.status).toBe(200)
expect(result.data.user.email).toBe('test@example.com')

// Avoid: Generic assertions
expect(result).toBeTruthy()
```

### Test Data

- Use realistic but safe test data
- Clean up after each test
- Use factories for consistent data creation
- Avoid hard-coded test data in tests

## Contributing

When adding new features:

1. Write unit tests for new utilities/components
2. Add integration tests for new API endpoints
3. Include E2E tests for new user workflows
4. Update test documentation
5. Ensure all tests pass in CI/CD

### Test Review Checklist

- [ ] Tests cover happy path and error cases
- [ ] Integration tests use real database operations
- [ ] E2E tests verify complete user workflows
- [ ] Performance tests verify load times
- [ ] Accessibility tests ensure compliance
- [ ] Test data is properly managed and cleaned up
- [ ] CI/CD pipeline passes all checks

For questions or issues with testing, please check the existing test examples or create an issue in the project repository.