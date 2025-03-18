import { 
  successResponse, 
  errorResponse, 
  commonErrors, 
  parseRequestBody 
} from '@/lib/utils/api-utils';
import { NextResponse } from 'next/server';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((body, options) => ({
      body,
      options,
    })),
  },
}));

describe('API Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successResponse', () => {
    it('should create a success response with default status code', () => {
      const data = { result: 'test-data' };
      const response = successResponse(data);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: true, result: 'test-data' },
        { status: 200 }
      );
    });

    it('should create a success response with custom status code', () => {
      const data = { result: 'created' };
      const response = successResponse(data, 201);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: true, result: 'created' },
        { status: 201 }
      );
    });

    it('should create a success response with empty data', () => {
      const response = successResponse();
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: true },
        { status: 200 }
      );
    });
  });

  describe('errorResponse', () => {
    it('should create an error response with only message', () => {
      const response = errorResponse('Something went wrong');
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Something went wrong' },
        { status: 400 }
      );
    });

    it('should create an error response with message and code', () => {
      const response = errorResponse('Resource not found', 'NOT_FOUND');
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Resource not found', code: 'NOT_FOUND' },
        { status: 400 }
      );
    });

    it('should create an error response with custom status', () => {
      const response = errorResponse('Unauthorized', 'AUTH_ERROR', 401);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized', code: 'AUTH_ERROR' },
        { status: 401 }
      );
    });

    it('should include details when provided', () => {
      const details = { field: 'username', message: 'Must be at least 3 characters' };
      const response = errorResponse('Validation error', 'VALIDATION', 400, details);
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { 
          error: 'Validation error', 
          code: 'VALIDATION', 
          details: { field: 'username', message: 'Must be at least 3 characters' } 
        },
        { status: 400 }
      );
    });
  });

  describe('commonErrors', () => {
    it('should create unauthorized error', () => {
      const response = commonErrors.unauthorized();
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    });

    it('should create notFound error with default resource', () => {
      const response = commonErrors.notFound();
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'Resource not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    });

    it('should create notFound error with custom resource', () => {
      const response = commonErrors.notFound('User');
      
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    });
  });

  describe('parseRequestBody', () => {
    it('should parse valid JSON request body', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ name: 'test user' })
      } as unknown as Request;
      
      const result = await parseRequestBody(mockRequest);
      
      expect(result).toEqual({ name: 'test user' });
      expect(mockRequest.json).toHaveBeenCalledTimes(1);
    });

    it('should return null for invalid JSON request body', async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      } as unknown as Request;
      
      // Mock console.error to avoid polluting test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const result = await parseRequestBody(mockRequest);
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});
