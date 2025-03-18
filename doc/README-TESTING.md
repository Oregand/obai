# Test Coverage Setup

This project now has Jest test coverage set up! Follow these steps to get started:

## Initial Setup

1. Install the testing dependencies:

```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest ts-jest
```

2. Run the tests:

```bash
npm test
```

## What's Been Added

- Jest configuration in `jest.config.js`
- Test setup in `jest.setup.js`
- Basic test examples in `__tests__/` directory
- Component test for LoadingSpinner
- Utility test for API utilities
- Test scripts in package.json

## Next Steps

- Continue adding tests for more components and utilities
- Set up Cypress for E2E testing (optional)
- Configure CI/CD pipeline to run tests automatically

For more details, see the complete [Testing Guide](./TESTING.md).
