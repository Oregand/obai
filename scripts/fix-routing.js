// Script to fix routing conflicts
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Fixing Next.js routing conflicts...');

// Define the path to remove
const conflictingPath = path.join(__dirname, 'app', 'api', 'chat', '[id]');

// Check if the directory exists before attempting to remove it
if (fs.existsSync(conflictingPath)) {
  try {
    execSync(`rm -rf "${conflictingPath}"`, { stdio: 'inherit' });
    console.log('Successfully removed conflicting routes.');
  } catch (error) {
    console.error('Error removing directory:', error.message);
    process.exit(1);
  }
} else {
  console.log('No conflicting route directory found.');
}

console.log('Routing conflicts fixed. Please run "npm run dev" to restart the server.');
