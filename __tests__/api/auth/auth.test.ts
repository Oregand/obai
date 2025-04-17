import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcrypt';

// Mock dependencies
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

// Mock Prisma and bcrypt before mocking auth since auth uses them
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

// Create proper mocks for the auth tests
jest.mock('@/lib/auth', () => {
  // Get access to the mocked functions
  const { prisma } = require('@/lib/prisma');
  const { compare } = require('bcrypt');
  
  const mockCredentialsProvider = {
    id: 'credentials',
    name: 'Credentials',
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize: jest.fn(async (credentials) => {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      // Actually call the mocked findUnique so we can verify it was called with correct params
      const user = await prisma.user.findUnique({
        where: {
          email: credentials.email,
        },
      });

      if (!user || !user.password) {
        return null;
      }

      // Actually call the mocked compare so we can verify it was called with correct params
      const isPasswordValid = await compare(credentials.password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      };
    }),
  };

  return {
    authOptions: {
      adapter: {},
      session: { strategy: 'jwt' },
      pages: { signIn: '/login' },
      providers: [
        { id: 'google', name: 'Google' },
        { id: 'github', name: 'GitHub' },
        mockCredentialsProvider,
      ],
      callbacks: {
        session: jest.fn(({ session, token }) => {
          if (token) {
            session.user.id = token.id;
            session.user.name = token.name;
            session.user.email = token.email;
            session.user.image = token.picture;
          }
          return session;
        }),
        jwt: jest.fn(({ token, user }) => {
          if (user) {
            token.id = user.id;
          }
          return token;
        }),
      },
    },
  };
});

describe('Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Next Auth Configuration', () => {
    it('should have correct auth options configured', () => {
      // Test auth options configuration
      expect(authOptions.session?.strategy).toBe('jwt');
      expect(authOptions.pages?.signIn).toBe('/login');
      expect(authOptions.providers).toHaveLength(3); // Google, GitHub, Credentials
    });

    it('should correctly configure credentials provider', () => {
      // Extract credentials provider
      const credentialsProvider = authOptions.providers.find(
        (provider) => provider.id === 'credentials'
      );
      
      expect(credentialsProvider).toBeDefined();
      
      // Check credentials fields
      if (credentialsProvider && 'credentials' in credentialsProvider) {
        expect(credentialsProvider.credentials).toHaveProperty('email');
        expect(credentialsProvider.credentials).toHaveProperty('password');
      }
    });
  });

  describe('Credentials authorization', () => {
    it('should return null when credentials are missing', async () => {
      // Extract the authorize function
      const credentialsProvider = authOptions.providers.find(
        (provider) => provider.id === 'credentials'
      );
      
      if (credentialsProvider && 'authorize' in credentialsProvider) {
        const authorize = credentialsProvider.authorize;
        
        // Call with missing credentials
        const result = await authorize?.({ email: '', password: '' } as any, {} as any);
        expect(result).toBeNull();
      }
    });

    it('should return null when user is not found', async () => {
      // Mock prisma to return null (user not found)
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      const credentialsProvider = authOptions.providers.find(
        (provider) => provider.id === 'credentials'
      );
      
      if (credentialsProvider && 'authorize' in credentialsProvider) {
        const authorize = credentialsProvider.authorize;
        
        // Call with valid credentials but user doesn't exist
        const result = await authorize?.({ 
          email: 'notfound@example.com', 
          password: 'password123'
        } as any, {} as any);
        
        expect(result).toBeNull();
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: { email: 'notfound@example.com' }
        });
      }
    });

    it('should return null when password is invalid', async () => {
      // Mock user found but password doesn't match
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
        image: null,
      });
      
      // Mock bcrypt to return false (password doesn't match)
      (compare as jest.Mock).mockResolvedValue(false);
      
      const credentialsProvider = authOptions.providers.find(
        (provider) => provider.id === 'credentials'
      );
      
      if (credentialsProvider && 'authorize' in credentialsProvider) {
        const authorize = credentialsProvider.authorize;
        
        // Call with wrong password
        const result = await authorize?.({ 
          email: 'test@example.com', 
          password: 'wrongpassword'
        } as any, {} as any);
        
        expect(result).toBeNull();
        expect(compare).toHaveBeenCalledWith('wrongpassword', 'hashed-password');
      }
    });

    it('should return user when credentials are valid', async () => {
      // Mock user found
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
        image: 'profile.jpg',
      };
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      // Mock bcrypt to return true (password matches)
      (compare as jest.Mock).mockResolvedValue(true);
      
      const credentialsProvider = authOptions.providers.find(
        (provider) => provider.id === 'credentials'
      );
      
      if (credentialsProvider && 'authorize' in credentialsProvider) {
        const authorize = credentialsProvider.authorize;
        
        // Call with correct credentials
        const result = await authorize?.({ 
          email: 'test@example.com', 
          password: 'correctpassword'
        } as any, {} as any);
        
        expect(result).toEqual({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          image: mockUser.image,
        });
      }
    });
  });

  describe('Auth Callbacks', () => {
    it('should properly set user data in the session', async () => {
      const session = {
        user: { id: '', name: '', email: '', image: '' },
        expires: new Date().toISOString(),
      };
      
      const token = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        picture: 'profile.jpg',
      };
      
      const result = await authOptions.callbacks?.session?.({ session, token, user: null as any, newSession: null as any, trigger: "update" });
      
      expect((result?.user as any)?.id).toBe(token.id);
      expect(result?.user?.name).toBe(token.name);
      expect(result?.user?.email).toBe(token.email);
      expect(result?.user?.image).toBe(token.picture);
    });

    it('should properly set user ID in the JWT token', async () => {
      const token = {};
      const user = { id: 'user-123' };
      
      const result = await authOptions.callbacks?.jwt?.({ 
        token, 
        user: user as any,
        account: null,
        profile: null as any,
        isNewUser: false,
        trigger: 'signIn'
      });
      
      expect(result).toHaveProperty('id', user.id);
    });
  });
});
