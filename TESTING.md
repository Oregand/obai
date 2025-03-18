# Testing Guide for OBAI Project

This guide explains how to work with the testing setup for the OBAI project.

## Running Tests

You can run tests using the following npm commands:

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Generate a test coverage report
npm run test:coverage
```

## Test Structure

The project uses Jest and React Testing Library for testing. Tests are organized as follows:

- `__tests__/` - Root directory for tests
  - `components/` - Tests for React components
  - `lib/` - Tests for utility functions and services
  - `basic.test.js` - Basic tests to verify Jest configuration

## Writing Tests

### Component Tests

For React components, create test files with the `.test.tsx` extension in the `__tests__/components/` directory, mirroring the structure of the actual components. For example:

```typescript
// __tests__/components/ui/Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '@/components/ui/Button';

describe('Button', () => {
  it('renders with the correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Utility Tests

For utility functions, create test files with the `.test.ts` extension in the `__tests__/lib/` directory:

```typescript
// __tests__/lib/utils/format.test.ts
import { formatDate, truncateText } from '@/lib/utils/format';

describe('Format Utilities', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2023-01-15');
      expect(formatDate(date)).toBe('Jan 15, 2023');
    });
  });

  describe('truncateText', () => {
    it('truncates text when too long', () => {
      expect(truncateText('This is a long text', 10)).toBe('This is a...');
    });
  });
});
```

## Mocking

Jest mocks are set up in `jest.setup.js` for common dependencies like:

- `next/router`
- `next/navigation`
- `next-auth/react`
- `react-hot-toast`

You can add additional mocks as needed in your test files or in the setup file.

## Coverage Reports

When you run `npm run test:coverage`, Jest will generate a coverage report in the `coverage/` directory. You can open `coverage/lcov-report/index.html` in a browser to view a detailed report.

The project aims for 70% coverage for critical code paths.

## Best Practices

1. Test behavior, not implementation details
2. Keep tests focused and isolated
3. Use descriptive test names that explain the expected behavior
4. Use setup and teardown functions to avoid repetition
5. Group related tests with `describe` blocks
