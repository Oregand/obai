import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper function to check if the current user is an admin
export async function isUserAdmin(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) return false;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });
    
    if (!user) return false;
    
    // For demo purposes, we'll consider the first few users in the database as admins
    // In a real app, you'd have a proper roles system
    const usersCount = await prisma.user.count();
    
    if (usersCount <= 5) return true;
    
    const firstUser = await prisma.user.findFirst({
      orderBy: {
        createdAt: 'asc',
      },
    });
    
    return firstUser?.id === user.id;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}
