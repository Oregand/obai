import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// DELETE /api/user/payment-methods/[id] - Delete a payment method
export async function DELETE(
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
    
    // If we're deleting the default payment method, we need to set a new default
    let newDefaultNeeded = paymentMethod.isDefault;
    
    // Delete the payment method
    await prisma.userPaymentMethod.delete({
      where: {
        id: paymentMethodId,
      },
    });
    
    // If we deleted the default payment method, set a new one (if any exist)
    if (newDefaultNeeded) {
      const firstPaymentMethod = await prisma.userPaymentMethod.findFirst({
        where: {
          userId: userId,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      
      if (firstPaymentMethod) {
        await prisma.userPaymentMethod.update({
          where: {
            id: firstPaymentMethod.id,
          },
          data: {
            isDefault: true,
          },
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment method' },
      { status: 500 }
    );
  }
}
