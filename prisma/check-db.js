// Script to check database connection and migration status
const { exec } = require('child_process');
const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  console.log("================================");
  console.log("Database Connection Check");
  console.log("================================");
  
  // Check if PostgreSQL is running
  console.log("Checking if PostgreSQL is running...");
  exec('pg_isready -h localhost', (error, stdout, stderr) => {
    if (error) {
      console.error("PostgreSQL may not be running:", error.message);
      console.log("Please start PostgreSQL and try again.");
      return;
    }
    
    console.log("PostgreSQL is running.");
    console.log("--------------------------------");
    
    // Check for the database
    const dbUrlMatch = process.env.DATABASE_URL.match(/postgresql:\/\/.+:.+@.+:(\d+)\/(.+)\?/);
    const dbName = dbUrlMatch ? dbUrlMatch[2] : 'unknown';
    
    console.log(`Checking for database: ${dbName}`);
    
    // Try connecting with Prisma
    console.log("Trying to connect with Prisma...");
    const prisma = new PrismaClient();
    
    prisma.$connect()
      .then(() => {
        console.log("Successfully connected to the database!");
        
        // Check migration status
        console.log("--------------------------------");
        console.log("Checking migration status...");
        
        exec('npx prisma migrate status', (error, stdout, stderr) => {
          if (error) {
            console.error("Error checking migration status:", error.message);
            if (stderr) console.error(stderr);
          } else {
            console.log("\nMigration Status:");
            console.log(stdout);
          }
          
          // Close Prisma connection
          prisma.$disconnect()
            .then(() => {
              console.log("================================");
              console.log("Database check complete");
              console.log("================================");
            });
        });
      })
      .catch(err => {
        console.error("Failed to connect to the database:", err);
        console.log("\nSuggested actions:");
        console.log("1. Check if the database exists");
        console.log("2. Verify your DATABASE_URL in .env file");
        console.log("3. Try creating the database manually:");
        console.log(`   createdb ${dbName}`);
        
        console.log("\n================================");
        console.log("Database check failed");
        console.log("================================");
      });
  });
}

checkDatabase();
