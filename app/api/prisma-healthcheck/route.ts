import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/prisma-healthcheck - Check Prisma models and connection status
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Only allow admins or in development
  if (process.env.NODE_ENV !== 'development' && 
      (!session?.user?.id || session.user.email !== process.env.ADMIN_EMAIL)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const prisma = new PrismaClient();
  
  try {
    // Check available models
    const models = Object.keys(prisma);
    
    // Test connection by checking count on User model
    const userCount = await prisma.user.count();
    
    // Check if UserPaymentMethod model exists
    const hasUserPaymentMethod = !!prisma.userPaymentMethod;
    
    // Test all models
    const modelTests = {};
    
    // Test UserPaymentMethod specifically
    let userPaymentMethodsCount: number | null = null;
    let userPaymentMethodError: string | null = null;
    
    try {
      userPaymentMethodsCount = await prisma.userPaymentMethod.count();
    } catch (e) {
      userPaymentMethodError = e instanceof Error ? e.message : 'Unknown error';
    }
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      status: 'ok',
      prismaConnection: true,
      models,
      userCount,
      hasUserPaymentMethod,
      userPaymentMethodsCount,
      userPaymentMethodError,
    });
  } catch (error) {
    console.error('Prisma healthcheck error:', error);
    
    try {
      await prisma.$disconnect();
    } catch {}
    
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      prismaConnection: false,
      prismaAvailable: !!prisma,
      modelKeys: Object.keys(prisma),
    }, { status: 500 });
  }
}
