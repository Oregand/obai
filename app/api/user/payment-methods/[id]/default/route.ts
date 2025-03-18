import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// PUT /api/user/payment-methods/[id]/default - Set a payment method as default
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const paymentMethodId = params.id;
    
    // Check if the payment method exists and belongs to the user
    const paymentMethod = await prisma.userPaymentMethod.findUnique({
      where: {
        id: paymentMethodId,
      },
    });
    
    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }
    
    if (paymentMethod.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // If the payment method is already default, nothing to do
    if (paymentMethod.isDefault) {
      return NextResponse.json({ success: true });
    }
    
    // Start a transaction to ensure data consistency
    await prisma.$transaction([
      // Unset any existing default payment methods
      prisma.userPaymentMethod.updateMany({
        where: {
          userId: userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      }),
      
      // Set the new default payment method
      prisma.userPaymentMethod.update({
        where: {
          id: paymentMethodId,
        },
        data: {
          isDefault: true,
        },
      }),
    ]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting default payment method:', error);
    return NextResponse.json(
      { error: 'Failed to set default payment method' },
      { status: 500 }
    );
  }
}
