// Simple database reset script using db push
const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("================================");
console.log("Simple Database Reset Script");
console.log("================================");
console.log("This will completely reset your database using prisma db push.");
console.log("All data will be lost!");
console.log("--------------------------------");

rl.question('Type "RESET" to continue: ', (answer) => {
  if (answer.toUpperCase() !== 'RESET') {
    console.log('Database reset aborted.');
    rl.close();
    return;
  }
  
  console.log("\nResetting database...");
  
  // Force reset the database with db push
  exec('npx prisma db push --force-reset --accept-data-loss', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error resetting database: ${error.message}`);
      if (stderr) console.error(stderr);
      rl.close();
      return;
    }
    
    console.log(stdout);
    console.log("Database schema pushed successfully");
    
    // Generate Prisma client
    exec('npx prisma generate', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error generating Prisma client: ${error.message}`);
        rl.close();
        return;
      }
      
      console.log("Prisma client generated successfully");
      
      // Run seeds
      exec('node prisma/seed.js', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error seeding database: ${error.message}`);
          console.error(stderr);
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
