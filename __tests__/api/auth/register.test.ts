import { NextRequest, NextResponse } from 'next/server';
import { POST } from '@/app/api/register/route';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      json: jest.fn().mockImplementation((body, options) => ({
        body,
        options,
      })),
    },
  };
});

describe('Registration API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 for invalid input data', async () => {
    // Create a mock request with invalid data
    const request = {
      json: jest.fn().mockResolvedValue({
        name: 'te', // Too short
        email: 'invalid-email', // Invalid email
        password: 'short', // Too short
      }),
    } as unknown as Request;

    const response = await POST(request);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid input data',
        errors: expect.any(Array),
      }),
      { status: 400 }
    );
  });

  it('should return 409 if user already exists', async () => {
    // Mock a user that already exists
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'existing-user',
      email: 'existing@example.com',
    });

    // Create a mock request with valid data but email exists
    const request = {
      json: jest.fn().mockResolvedValue({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
      }),
    } as unknown as Request;

    const response = await POST(request);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'existing@example.com' },
    });
    
    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: 'User with this email already exists' },
      { status: 409 }
    );
  });

  it('should create a new user with valid data', async () => {
    // Mock user doesn't exist
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    
    // Mock hash password
    (hash as jest.Mock).mockResolvedValue('hashed-password-123');
    
    // Mock user creation
    const mockCreatedUser = {
      id: 'new-user-123',
      name: 'New User',
      email: 'newuser@example.com',
      createdAt: new Date(),
      password: 'hashed-password-123',
    };
    
    (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);

    // Create a mock request with valid data
    const request = {
      json: jest.fn().mockResolvedValue({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
      }),
    } as unknown as Request;

    const response = await POST(request);

    // Should check for existing user
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'newuser@example.com' },
    });
    
    // Should hash the password
    expect(hash).toHaveBeenCalledWith('password123', 10);
    
    // Should create the user
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'hashed-password-123',
      },
    });
    
    // Should return the user data without password
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        id: mockCreatedUser.id,
        name: mockCreatedUser.name,
        email: mockCreatedUser.email,
        createdAt: mockCreatedUser.createdAt,
      },
      { status: 201 }
    );
  });

  it('should handle database connection error', async () => {
    // Mock user doesn't exist
    (prisma.user.findUnique as jest.Mock).mockRejectedValue({
      name: 'PrismaClientInitializationError',
      message: 'Cannot connect to database',
    });

    // Create a mock request with valid data
    const request = {
      json: jest.fn().mockResolvedValue({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
      }),
    } as unknown as Request;

    const response = await POST(request);

    // Should handle database error
    expect(NextResponse.json).toHaveBeenCalledWith(
      { 
        message: 'Database connection error',
        details: expect.any(String),
      },
      { status: 500 }
    );
  });

  it('should handle general errors', async () => {
    // Mock a general error
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

    // Create a mock request with valid data
    const request = {
      json: jest.fn().mockResolvedValue({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
      }),
    } as unknown as Request;

    const response = await POST(request);

    // Should handle general error
    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  });
});
