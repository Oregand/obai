// JavaScript alternative to reset the database
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("================================");
console.log("Database Reset Script");
console.log("================================");
console.log("This will completely reset your database.");
console.log("All data will be lost!");
console.log("--------------------------------");

rl.question('Type "RESET" to continue: ', (answer) => {
  if (answer.toUpperCase() !== 'RESET') {
    console.log('Database reset aborted.');
    rl.close();
    return;
  }
  
  console.log("\nResetting database...");
  
  // Force reset the database
  exec('npx prisma db push --force-reset', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error dropping database: ${error.message}`);
      rl.close();
      return;
    }
    
    console.log("Database reset successfully");
    
    // Apply migrations
    exec('npx prisma migrate deploy', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error applying migrations: ${error.message}`);
        rl.close();
        return;
      }
      
      console.log("Migrations applied successfully");
      
      // Generate Prisma client
      exec('npx prisma generate', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error generating Prisma client: ${error.message}`);
          rl.close();
          return;
        }
        
        console.log("Prisma client generated successfully");
        
        // Run seeds
        exec('npx prisma db seed', (error, stdout, stderr) => {
          if (error) {
            console.error(`Error seeding database: ${error.message}`);
            rl.close();
            return;
          }
          
          console.log("Database seeded successfully");
          console.log("\n================================");
          console.log("Database reset complete!");
          console.log("================================");
          rl.close();
        });
      });
    });
  });
});
