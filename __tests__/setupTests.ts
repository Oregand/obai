import '@testing-library/jest-dom';

// Add a simple test to prevent the "empty test suite" error
describe('Test environment', () => {
  it('should be properly set up', () => {
    expect(true).toBe(true);
  });
});
