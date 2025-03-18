// Migration script to apply Prisma migrations

const { execSync } = require('child_process');
const path = require('path');

console.log('Applying Prisma migrations...');

try {
  // Run migration
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit',
    cwd: path.join(__dirname)
  });
  
  // Generate Prisma client
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: path.join(__dirname)
  });
  
  console.log('Migration complete!');
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}
