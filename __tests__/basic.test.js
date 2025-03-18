// A basic test to verify Jest is configured correctly

describe('Basic test suite', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle boolean assertions', () => {
    expect(true).toBe(true);
    expect(false).not.toBe(true);
  });

  it('should handle string comparisons', () => {
    expect('hello').toEqual('hello');
    expect('hello').toContain('ell');
  });
});
