import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';

// Create a fresh Prisma client instance for this request
const prisma = new PrismaClient();
import { authOptions } from '@/lib/auth';

// GET /api/user/payment-methods - Get all payment methods for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    const paymentMethods = await prisma.userPaymentMethod.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json({ paymentMethods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    // More detailed error information for debugging
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown error type',
      prismaAvailable: !!prisma,
      prismaUserPaymentMethod: !!prisma.userPaymentMethod
    };
    
    console.error('Error details:', errorDetails);
    
    return NextResponse.json(
      { error: 'Failed to fetch payment methods', details: errorDetails },
      { status: 500 }
    );
  }
}

// POST /api/user/payment-methods - Create a new payment method
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { type, name, address, isDefault } = await req.json();
    
    // Validate input
    if (!type || !name || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check for maximum number of payment methods per user (optional)
    const userPaymentMethodCount = await prisma.userPaymentMethod.count({
      where: {
        userId: userId,
      },
    });
    
    if (userPaymentMethodCount >= 10) {
      return NextResponse.json(
        { error: 'Maximum number of payment methods reached (10)' },
        { status: 400 }
      );
    }
    
    // Check if the address is already added by this user
    const existingPaymentMethod = await prisma.userPaymentMethod.findFirst({
      where: {
        userId: userId,
        address: address,
      },
    });
    
    if (existingPaymentMethod) {
      return NextResponse.json(
        { error: 'This wallet address is already added to your account' },
        { status: 400 }
      );
    }
    
    // If this is the default payment method, unset all other default methods
    if (isDefault) {
      await prisma.userPaymentMethod.updateMany({
        where: {
          userId: userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }
    
    // If this is the first payment method, make it default regardless of input
    const shouldMakeDefault = isDefault || userPaymentMethodCount === 0;
    
    // Create the new payment method
    const newPaymentMethod = await prisma.userPaymentMethod.create({
      data: {
        userId: userId,
        type: type,
        name: name,
        address: address,
        isDefault: shouldMakeDefault,
      },
    });
    
    return NextResponse.json({ paymentMethod: newPaymentMethod }, { status: 201 });
  } catch (error) {
    console.error('Error creating payment method:', error);
    // More detailed error information for debugging
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown error type',
      prismaAvailable: !!prisma,
      prismaUserPaymentMethod: !!prisma.userPaymentMethod
    };
    
    console.error('Error details:', errorDetails);
    
    return NextResponse.json(
      { error: 'Failed to create payment method', details: errorDetails },
      { status: 500 }
    );
  }
}
