import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/user/auto-topup - Get user's auto top-up settings
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
    
    // Fetch the user's auto top-up settings
    const settings = await prisma.autoTopupSettings.findUnique({
      where: {
        userId: userId,
      },
    });
    
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching auto top-up settings:', error);
    
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown error type'
    };
    
    return NextResponse.json(
      { error: 'Failed to fetch auto top-up settings', details: errorDetails },
      { status: 500 }
    );
  }
}

// POST /api/user/auto-topup - Create or update auto top-up settings
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
    const { enabled, thresholdAmount, packageId, paymentMethodId } = await req.json();
    
    // Validate the payment method if one is provided
    if (paymentMethodId) {
      const paymentMethod = await prisma.userPaymentMethod.findUnique({
        where: {
          id: paymentMethodId,
        },
      });
      
      if (!paymentMethod || paymentMethod.userId !== userId) {
        return NextResponse.json(
          { error: 'Invalid payment method' },
          { status: 400 }
        );
      }
    }
    
    // Create or update the auto top-up settings
    const settings = await prisma.autoTopupSettings.upsert({
      where: {
        userId: userId,
      },
      update: {
        enabled,
        thresholdAmount,
        packageId,
        paymentMethodId,
      },
      create: {
        userId,
        enabled,
        thresholdAmount,
        packageId,
        paymentMethodId,
      },
    });
    
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error saving auto top-up settings:', error);
    
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown error type'
    };
    
    return NextResponse.json(
      { error: 'Failed to save auto top-up settings', details: errorDetails },
      { status: 500 }
    );
  }
}
