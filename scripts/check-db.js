const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking database connection...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if User table exists
    const userTableExists = await prisma.user.findFirst();
    console.log('User table exists:', userTableExists !== undefined);
    
    // Check if Persona table exists
    const personaTableExists = await prisma.persona.findFirst();
    console.log('Persona table exists:', personaTableExists !== undefined);
    
    // Log all tables
    console.log('\nTables in database:');
    const tables = [
      'User', 'Account', 'Session', 'Persona', 
      'Chat', 'Message', 'Payment', 'MessageUnlock', 'Tip'
    ];
    
    for (const table of tables) {
      try {
        const count = await prisma[table.toLowerCase()].count();
        console.log(`- ${table}: ${count} records`);
      } catch (e) {
        console.log(`- ${table}: Error accessing table`);
      }
    }
    
  } catch (error) {
    console.error('Database check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
