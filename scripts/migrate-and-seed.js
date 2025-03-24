#!/usr/bin/env node

/**
 * This script handles database migrations and seeding for production deployments.
 * It should be run after deployment, not during the build process.
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting database migration and seeding...');

try {
  // Run Prisma migrations
  console.log('Running Prisma migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  // Run Prisma DB seed if needed
  console.log('Seeding database...');
  execSync('npx prisma db seed', { stdio: 'inherit' });
  
  console.log('✅ Database migration and seeding completed successfully!');
} catch (error) {
  console.error('❌ Error during database setup:', error);
  process.exit(1);
}
