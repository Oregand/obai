import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function adminAuth(req: NextRequest) {
  const session = await getServerSession();
  
  // Check if user is logged in
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // Check if user is an admin
  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email
    },
    select: {
      isAdmin: true
    }
  });
  
  if (!user?.isAdmin) {
    // Redirect non-admin users to home page
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  // Admin user, continue to the requested page
  return NextResponse.next();
}
