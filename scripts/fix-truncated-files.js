// This script will check for and fix truncated JavaScript files in the Next.js build
const fs = require('fs');
const path = require('path');

// Clean the .next directory which contains cached webpack output
console.log('Cleaning Next.js cache...');
try {
  // Only attempt to delete if the directory exists
  if (fs.existsSync(path.join(__dirname, '.next'))) {
    const rimraf = require('rimraf');
    rimraf.sync(path.join(__dirname, '.next'));
    console.log('.next directory removed');
  }
} catch (error) {
  console.error('Error while cleaning .next directory:', error);
}

// Check if the node_modules/next-auth exists and is properly installed
const nextAuthPath = path.join(__dirname, 'node_modules', 'next-auth');
if (!fs.existsSync(nextAuthPath)) {
  console.log('next-auth module is missing. Please run "npm install next-auth"');
} else {
  console.log('next-auth module is installed');
  
  // Check the logger.js file
  const loggerPath = path.join(nextAuthPath, 'utils', 'logger.js');
  if (fs.existsSync(loggerPath)) {
    const content = fs.readFileSync(loggerPath, 'utf8');
    
    if (content.length < 100 || !content.includes('exports.default = _logger;')) {
      console.log('Detected corrupted logger.js file. Reinstallation of next-auth is recommended.');
      console.log('Run: npm uninstall next-auth && npm install next-auth@latest');
    } else {
      console.log('logger.js file appears to be intact');
    }
  } else {
    console.log('logger.js file is missing. Reinstallation of next-auth is recommended.');
  }
}

console.log('\nTo fix this issue:');
console.log('1. Run: npm uninstall next-auth @next-auth/prisma-adapter');
console.log('2. Run: npm install next-auth@latest @next-auth/prisma-adapter@latest');
console.log('3. Run: npm run build');
console.log('4. Run: npm run dev');
