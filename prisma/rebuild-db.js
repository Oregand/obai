// Script to completely rebuild the database from scratch
const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Extract database info from .env file
function getDatabaseInfo() {
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const dbUrlMatch = envContent.match(/DATABASE_URL=["']postgresql:\/\/([^:]+)(:([^@]+))?@([^:]+):(\d+)\/([^?]+)/);
    
    if (!dbUrlMatch) {
      return { user: 'davidoregan', host: 'localhost', port: '5432', dbName: 'obai' };
    }
    
    return {
      user: dbUrlMatch[1],
      password: dbUrlMatch[3],
      host: dbUrlMatch[4],
      port: dbUrlMatch[5],
      dbName: dbUrlMatch[6]
    };
  } catch (error) {
    console.error('Could not parse DATABASE_URL from .env file', error.message);
    return { user: 'davidoregan', host: 'localhost', port: '5432', dbName: 'obai' };
  }
}

console.log("================================");
console.log("Complete Database Rebuild");
console.log("================================");
console.log("This will:");
console.log("1. Drop the existing database (if it exists)");
console.log("2. Create a new empty database");
console.log("3. Push the schema without migrations");
console.log("4. Seed the database with initial data");
console.log("--------------------------------");
console.log("ALL DATA WILL BE PERMANENTLY LOST!");
console.log("--------------------------------");

rl.question('Type "REBUILD" to continue: ', (answer) => {
  if (answer.toUpperCase() !== 'REBUILD') {
    console.log('Database rebuild aborted.');
    rl.close();
    return;
  }
  
  const dbInfo = getDatabaseInfo();
  
  try {
    console.log(`\nDropping database ${dbInfo.dbName} if it exists...`);
    try {
      // Force disconnect all clients and drop the database
      execSync(`psql -U ${dbInfo.user} -h ${dbInfo.host} -p ${dbInfo.port} -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '${dbInfo.dbName}' AND pid <> pg_backend_pid();" postgres`);
      execSync(`dropdb -U ${dbInfo.user} -h ${dbInfo.host} -p ${dbInfo.port} ${dbInfo.dbName} --if-exists`);
    } catch (error) {
      console.log("Could not drop database. It might not exist yet.");
    }
    
    console.log(`Creating new database ${dbInfo.dbName}...`);
    execSync(`createdb -U ${dbInfo.user} -h ${dbInfo.host} -p ${dbInfo.port} ${dbInfo.dbName}`);
    
    console.log("Pushing Prisma schema to database (skipping migrations)...");
    execSync('npx prisma db push --skip-generate');
    
    console.log("Generating Prisma client...");
    execSync('npx prisma generate');
    
    console.log("Seeding database with initial data...");
    execSync('node prisma/seed.js');
    
    console.log("\n================================");
    console.log("Database rebuilt successfully!");
    console.log("================================");
  } catch (error) {
    console.error("Error during database rebuild:");
    console.error(error.message);
    if (error.stdout) console.log(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
    
    console.log("\n================================");
    console.log("Database rebuild failed!");
    console.log("================================");
  }
  
  rl.close();
});
