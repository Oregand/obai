// Run this script to check if a user exists in your database
// This can help diagnose foreign key constraint violations
// Save as check-user-existence.js and run with: node check-user-existence.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserExistence(userId) {
  try {
    // Try to find user by ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true }
    });
    
    if (user) {
      console.log('✅ User found:', user);
      
      // Check if this user has any associated payments
      const payments = await prisma.payment.count({
        where: { userId }
      });
      
      console.log(`User has ${payments} payment records`);
      
      return true;
    } else {
      console.log('❌ User not found with ID:', userId);
      
      // Try to find the user by email if provided
      if (process.argv[3]) {
        const userByEmail = await prisma.user.findUnique({
          where: { email: process.argv[3] },
          select: { id: true, email: true, name: true }
        });
        
        if (userByEmail) {
          console.log('Found user with matching email:', userByEmail);
          console.log('⚠️ ID mismatch: The session ID does not match the database ID');
        } else {
          console.log('No user found with email:', process.argv[3]);
        }
      }
      
      return false;
    }
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Check if user ID was provided as command line argument
if (process.argv.length < 3) {
  console.log('Usage: node check-user-existence.js <userId> [email]');
  process.exit(1);
}

const userId = process.argv[2];
checkUserExistence(userId)
  .then(() => {
    console.log('Done checking user existence');
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
