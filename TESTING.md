# Testing Infrastructure - QUERODOCUMENTO

This document provides a comprehensive guide to the testing infrastructure set up for the QUERODOCUMENTO project.

## Overview

The testing setup uses Jest with React Testing Library for unit and integration tests, optimized for the Bun runtime and Next.js 14 with TypeScript.

## Test Stack

- **Test Runner**: Jest 30+ (optimized for Bun)
- **Component Testing**: @testing-library/react
- **DOM Assertions**: @testing-library/jest-dom
- **User Interactions**: @testing-library/user-event
- **API Mocking**: Mock Service Worker (MSW)
- **Environment**: jsdom

## Project Structure

```
src/
├── __tests__/
│   ├── __mocks__/           # Mock implementations
│   │   ├── fileMock.js      # Static file mocks
│   │   ├── next.ts          # Next.js mocks
│   │   ├── prisma.ts        # Prisma client mocks
│   │   └── msw.ts           # API mocking setup
│   ├── fixtures/            # Test data and factories
│   │   └── mockData.ts      # Reusable mock data
│   ├── utils/               # Testing utilities
│   │   └── test-utils.tsx   # Custom render functions
│   ├── setup.ts             # Test environment setup
│   ├── globalSetup.ts       # Global test initialization
│   └── globalTeardown.ts    # Global test cleanup
├── lib/__tests__/           # Utility function tests
├── components/*/
│   └── __tests__/           # Component tests
└── app/api/*/
    └── __tests__/           # API route tests
```

## Available Test Scripts

```bash
# Run all tests
bun test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage report
bun run test:coverage

# Run tests for CI (no watch, full coverage)
bun run test:ci

# Debug tests (useful for investigating hanging tests)
bun run test:debug
```

## Test Categories

### 1. Utility Function Tests (`src/lib/__tests__/`)

Tests for utility functions including:
- **CPF/CNPJ validation** - Document format validation
- **Phone validation** - Brazilian phone number validation
- **Formatting functions** - Document and currency formatting
- **Type detection** - CPF vs CNPJ detection

Example:
```typescript
// src/lib/__tests__/validators.test.ts
describe('CPF Validation', () => {
  it('should validate correct CPF', () => {
    expect(validateCPF('11144477735')).toBe(true)
    expect(validateCPF('111.444.777-35')).toBe(true)
  })

  it('should reject invalid CPF', () => {
    expect(validateCPF('12345678900')).toBe(false)
  })
})
```

### 2. API Route Tests (`src/app/api/*/`)

Tests for API endpoints with comprehensive scenarios:
- **Input validation** - Required fields, format validation
- **Authentication** - Session management, authorization
- **Database interactions** - Mocked Prisma operations
- **Error handling** - Network errors, validation errors
- **Edge cases** - Malformed requests, race conditions

Example API routes tested:
- `/api/protest/query` - Document protest queries
- `/api/auth/simple-login` - User authentication
- `/api/dashboard/stats` - Dashboard statistics

### 3. Component Tests (`src/components/*/`)

React component tests using React Testing Library:
- **Rendering** - Component renders correctly
- **User interactions** - Form submissions, button clicks
- **State management** - Component state changes
- **Props handling** - Different prop scenarios
- **Error states** - Validation errors, loading states

Example:
```typescript
// src/components/forms/__tests__/ConsultaProtestoForm.test.tsx
describe('ConsultaProtestoForm', () => {
  it('should render step 1 by default', () => {
    render(<ConsultaProtestoForm />)
    
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
    expect(screen.getByText('Consulta de Protesto')).toBeInTheDocument()
  })
})
```

## Mock Implementations

### Prisma Database Mock
```typescript
// Automatic mocking of database operations
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    // ... other methods
  }
}
```

### Next.js Mocks
```typescript
// Router, navigation, and Next.js specific features
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  pathname: '/',
  // ... other router methods
}
```

### API Mocking with MSW
```typescript
// Mock API responses for different scenarios
http.post('/api/protest/query', ({ request }) => {
  // Return different responses based on input
  return HttpResponse.json(mockResponse)
})
```

## Test Data and Fixtures

Centralized test data in `src/__tests__/fixtures/mockData.ts`:

```typescript
export const mockUser = {
  id: 'test-user-123',
  email: 'test@querodocumento.com',
  name: 'João Silva',
  cpf: '11144477735',
  // ... other properties
}

export const mockProtestQuery = {
  // Complete protest query result structure
}
```

## Testing Best Practices

### 1. Test Isolation
- Each test runs independently
- Mocks are reset between tests
- No shared state between tests

### 2. Realistic Test Data
- Use valid CPF/CNPJ numbers for testing
- Mock realistic API responses
- Test with actual Brazilian date/currency formats

### 3. Comprehensive Coverage
- Test happy paths and error scenarios
- Include edge cases and boundary conditions
- Test accessibility features

### 4. Maintainable Tests
- Use descriptive test names
- Group related tests in describe blocks
- Extract common setup to beforeEach hooks

## Configuration

### Jest Configuration (`jest.config.js`)
- **Environment**: jsdom for DOM testing
- **Module mapping**: TypeScript path aliases
- **Coverage thresholds**: 70% minimum across all metrics
- **Setup files**: Automatic test environment setup

### Coverage Targets
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Excluded from Coverage
- UI component libraries (shadcn/ui)
- Next.js generated files (layout, loading, error pages)
- Type definitions
- Storybook files

## Running Tests

### Local Development
```bash
# Run tests once
bun test

# Run tests in watch mode (recommended for development)
bun run test:watch

# Run specific test file
bun test src/lib/__tests__/validators.test.ts

# Run tests matching pattern
bun test -- --testNamePattern="CPF"
```

### CI/CD
```bash
# Run all tests with coverage (for CI pipelines)
bun run test:ci
```

### Coverage Reports
```bash
# Generate coverage report
bun run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

## Debugging Tests

### Common Issues and Solutions

1. **Module Resolution Errors**
   - Check path aliases in `jest.config.js`
   - Ensure all imports use correct paths

2. **Async Operation Timeouts**
   - Use `waitFor` for async operations
   - Increase test timeout if needed

3. **Mock Not Working**
   - Verify mock is set up in correct location
   - Check mock implementation matches expected interface

4. **Component Not Rendering**
   - Check if all required props are provided
   - Verify component dependencies are mocked

### Debug Tools
```typescript
// Debug rendered output
screen.debug()

// Debug specific element
screen.debug(screen.getByTestId('element'))

// Log all available queries
screen.logTestingPlaygroundURL()
```

## Continuous Integration

The testing infrastructure is designed to work seamlessly in CI/CD pipelines:

- **Fast execution** with parallelization
- **Deterministic results** with proper mocking
- **Comprehensive reporting** with coverage metrics
- **Container compatibility** for Docker-based CI

## Performance Considerations

- Tests run in parallel by default
- Mock implementations are optimized for speed
- Database operations are mocked to avoid I/O
- File system operations use in-memory implementations

## Future Enhancements

Planned improvements to the testing infrastructure:

1. **Visual regression testing** with Storybook
2. **E2E test integration** with existing Playwright setup
3. **Performance testing** for critical user flows
4. **Accessibility testing automation**

## Troubleshooting

### Common Test Failures

1. **Import/Module Errors**
   - Verify `moduleNameMapper` configuration
   - Check file extensions in imports

2. **Async Test Issues**
   - Use `async/await` properly in tests
   - Mock all external dependencies

3. **React Testing Library Errors**
   - Use semantic queries (getByRole, getByLabelText)
   - Wrap async operations in `act()` when needed

### Getting Help

- Check Jest documentation: https://jestjs.io/
- React Testing Library docs: https://testing-library.com/
- MSW documentation: https://mswjs.io/

For project-specific testing questions, refer to the test examples in this codebase or create new tests following the established patterns.