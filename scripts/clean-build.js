// Script to clean and rebuild the Next.js application
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Cleaning build artifacts...');
try {
  if (fs.existsSync(path.join(__dirname, '.next'))) {
    execSync('rm -rf .next', { stdio: 'inherit' });
  }
} catch (error) {
  console.error('Error removing .next directory:', error.message);
}

console.log('Cleaning node_modules cache...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
} catch (error) {
  console.error('Error cleaning npm cache:', error.message);
}

console.log('Reinstalling dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  process.exit(1);
}

console.log('Building the application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('Error building the application:', error.message);
  process.exit(1);
}

console.log('Clean build complete. You can now run "npm run dev" to start the development server.');
