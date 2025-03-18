// Run this script to check the state of key tables in your database
// Save as check-database.js and run with: node check-database.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('==== Database Integrity Check ====');
    
    // Check User table
    const userCount = await prisma.user.count();
    console.log(`Users: ${userCount} records`);
    if (userCount > 0) {
      const someUsers = await prisma.user.findMany({ take: 3 });
      console.log('Sample users:', someUsers.map(u => ({ id: u.id, email: u.email })));
    }
    
    // Check Persona table
    const personaCount = await prisma.persona.count();
    console.log(`Personas: ${personaCount} records`);
    if (personaCount > 0) {
      const publicPersonas = await prisma.persona.count({ where: { isPublic: true } });
      console.log(`Public personas: ${publicPersonas} records`);
      
      const somePersonas = await prisma.persona.findMany({ take: 3 });
      console.log('Sample personas:', somePersonas.map(p => ({ id: p.id, name: p.name, isPublic: p.isPublic })));
    }
    
    // Check Chat table
    const chatCount = await prisma.chat.count();
    console.log(`Chats: ${chatCount} records`);
    
    // Check Payment table
    const paymentCount = await prisma.payment.count();
    console.log(`Payments: ${paymentCount} records`);
    
    // Check Subscription table
    const subscriptionCount = await prisma.subscription.count();
    console.log(`Subscriptions: ${subscriptionCount} records`);
    
    console.log('==== Database Tables Check ====');
    // List all tables from PostgreSQL (this is PostgreSQL specific)
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log('Tables in database:', tables);
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase()
  .then(() => {
    console.log('Database check complete');
  })
  .catch(error => {
    console.error('Error:', error);
  });
