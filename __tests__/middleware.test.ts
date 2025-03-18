import { middleware } from '@/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Mock dependencies
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      next: jest.fn().mockReturnValue({
        headers: {
          set: jest.fn(),
        },
      }),
      json: jest.fn().mockImplementation((body, options) => ({
        body,
        options,
        headers: {
          set: jest.fn(),
        },
      })),
    },
  };
});

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

describe('Rate Limiting Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.next as jest.Mock).mockReturnValue({
      headers: {
        set: jest.fn(),
      },
    });
  });

  it('should skip rate limiting for non-API routes', async () => {
    // Create mock request for a non-API route
    const request = {
      nextUrl: {
        pathname: '/about',
      },
      ip: '127.0.0.1',
      headers: {
        get: jest.fn(),
      },
    } as unknown as NextRequest;

    await middleware(request);

    // Should return NextResponse.next()
    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('should apply rate limiting for API routes', async () => {
    // Mock an anonymous user (no token)
    (getToken as jest.Mock).mockResolvedValue(null);

    // Create mock request for an API route
    const request = {
      nextUrl: {
        pathname: '/api/user/profile',
      },
      ip: '127.0.0.1',
      headers: {
        get: jest.fn(),
      },
    } as unknown as NextRequest;

    await middleware(request);

    // Should return NextResponse.next() with rate limit headers
    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.next().headers.set).toHaveBeenCalledWith('X-RateLimit-Limit', expect.any(String));
    expect(NextResponse.next().headers.set).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(String));
    expect(NextResponse.next().headers.set).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(String));
  });

  it('should use different limits for authenticated users', async () => {
    // Mock an authenticated user
    (getToken as jest.Mock).mockResolvedValue({ sub: 'user-123' });

    // Create mock request for an API route
    const request = {
      nextUrl: {
        pathname: '/api/user/profile',
      },
      ip: '127.0.0.1',
      headers: {
        get: jest.fn(),
      },
    } as unknown as NextRequest;

    await middleware(request);

    // Should return NextResponse.next() with higher rate limit
    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.next().headers.set).toHaveBeenCalledWith('X-RateLimit-Limit', '200');
  });

  it('should return 429 response when rate limit is exceeded', async () => {
    // Mock an anonymous user
    (getToken as jest.Mock).mockResolvedValue(null);

    // Create mock request for an API route
    const request = {
      nextUrl: {
        pathname: '/api/user/profile',
      },
      ip: '127.0.0.1',
      headers: {
        get: jest.fn(),
      },
    } as unknown as NextRequest;

    // Call middleware multiple times to exceed the limit
    const mockNextResponse = NextResponse.next();
    for (let i = 0; i < 51; i++) {
      await middleware(request);
    }

    // On the 51st request, it should return a 429 response
    (NextResponse.json as jest.Mock).mockReturnValueOnce({
      headers: {
        set: jest.fn(),
      },
      status: 429,
    });

    // The 51st request should trigger rate limit
    const finalResponse = await middleware(request);
    
    // Should have called NextResponse.json with error message
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Too many requests',
        message: expect.any(String),
        resetIn: expect.any(Number),
      }),
      expect.objectContaining({
        status: 429,
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': expect.any(String),
          'X-RateLimit-Remaining': '0',
          'Retry-After': expect.any(String),
        }),
      })
    );
  });
});
