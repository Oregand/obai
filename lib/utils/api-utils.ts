import { NextResponse } from 'next/server';

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
}

/**
 * Standard success response structure
 */
export interface SuccessResponse {
  success: true;
  [key: string]: any;
}

/**
 * Create a standardized success response
 * @param data Additional data to include in the response
 * @param status HTTP status code (default: 200)
 * @returns NextResponse with standardized success format
 */
export function successResponse(data: any = {}, status: number = 200): NextResponse {
  return NextResponse.json(
    { success: true, ...data },
    { status }
  );
}

/**
 * Create a standardized error response
 * @param message Error message
 * @param code Optional error code
 * @param status HTTP status code (default: 400)
 * @param details Optional additional error details
 * @returns NextResponse with standardized error format
 */
export function errorResponse(
  message: string, 
  code?: string, 
  status: number = 400, 
  details?: any
): NextResponse {
  const response: ErrorResponse = { error: message };
  
  if (code) {
    response.code = code;
  }
  
  if (details) {
    response.details = details;
  }
  
  return NextResponse.json(response, { status });
}

/**
 * Common error responses
 */
export const commonErrors = {
  unauthorized: () => errorResponse('Unauthorized', 'UNAUTHORIZED', 401),
  notFound: (resource: string = 'Resource') => errorResponse(`${resource} not found`, 'NOT_FOUND', 404),
  badRequest: (message: string = 'Invalid request') => errorResponse(message, 'BAD_REQUEST', 400),
  forbidden: (message: string = 'Access denied') => errorResponse(message, 'FORBIDDEN', 403),
  serverError: (message: string = 'Internal server error') => errorResponse(message, 'SERVER_ERROR', 500),
  validation: (details: any) => errorResponse('Validation error', 'VALIDATION_ERROR', 400, details),
  insufficientTokens: () => errorResponse('Insufficient tokens', 'INSUFFICIENT_TOKENS', 402),
  paymentFailed: (message: string = 'Payment failed') => errorResponse(message, 'PAYMENT_FAILED', 400)
};

/**
 * Parse and validate request body with error handling
 * @param request NextRequest object
 * @returns Parsed body or null if invalid
 */
export async function parseRequestBody<T>(request: Request): Promise<T | null> {
  try {
    return await request.json() as T;
  } catch (e) {
    console.error('Failed to parse request body:', e);
    return null;
  }
}
