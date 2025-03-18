import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// In-memory store for tracking request counts
// In production, you'd use Redis or another distributed store
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
const userRequestCounts = new Map<string, { count: number; resetTime: number }>();

// Rate limit settings
const WINDOW_SIZE_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW_ANONYMOUS = 50; // 50 requests per minute for anonymous users
const MAX_REQUESTS_PER_WINDOW_AUTHENTICATED = 200; // 200 requests per minute for authenticated users
const API_PATHS = ['/api/']; // Paths to rate limit

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply rate limiting to API routes
  const isApiRoute = API_PATHS.some(path => pathname.startsWith(path));
  if (!isApiRoute) {
    return NextResponse.next();
  }

  // Get client IP (would need adaptation in production depending on your hosting)
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  // Try to get the user token to distinguish between authenticated and anonymous users
  const token = await getToken({ req: request as any });
  const userId = token?.sub || null;

  // Different limits for anonymous and authenticated users
  if (userId) {
    // Authenticated user
    return handleRateLimit(request, userId, userRequestCounts, MAX_REQUESTS_PER_WINDOW_AUTHENTICATED);
  } else {
    // Anonymous user
    return handleRateLimit(request, ip, ipRequestCounts, MAX_REQUESTS_PER_WINDOW_ANONYMOUS);
  }
}

function handleRateLimit(
  request: NextRequest,
  key: string,
  rateStore: Map<string, { count: number; resetTime: number }>,
  limit: number
): NextResponse {
  const now = Date.now();
  let requestData = rateStore.get(key);

  // Reset count if window has expired
  if (!requestData || now > requestData.resetTime) {
    requestData = { count: 0, resetTime: now + WINDOW_SIZE_MS };
    rateStore.set(key, requestData);
  }

  // Increment count
  requestData.count++;
  
  // Check against limit
  if (requestData.count > limit) {
    // Add information about when the limit resets
    const resetInSeconds = Math.ceil((requestData.resetTime - now) / 1000);
    
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        resetIn: resetInSeconds
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(requestData.resetTime / 1000).toString(),
          'Retry-After': resetInSeconds.toString(),
        },
      }
    );
  }

  // Forward the request
  const response = NextResponse.next();
  
  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', (limit - requestData.count).toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(requestData.resetTime / 1000).toString());
  
  return response;
}

// Configure middleware to run for specific paths
export const config = {
  matcher: [
    // Apply to all API routes
    '/api/:path*',
  ],
};
