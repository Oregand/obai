// This file needs to be run on your local machine with Node.js
// It checks for UTF-8 BOM marks or special characters in your files
const fs = require('fs');
const path = require('path');

// Files to check based on what's imported in layout.tsx
const filesToCheck = [
  'components/providers.tsx',
  'styles/globals.css',
  'styles/fixes.css',
  'app/layout.tsx',
  'app/admin/layout.tsx',
];

function checkForBOM(filePath) {
  try {
    // Read the file as a buffer to check for BOM
    const buffer = fs.readFileSync(filePath);
    
    // Check for UTF-8 BOM (EF BB BF)
    const hasBOM = buffer.length >= 3 && 
                  buffer[0] === 0xEF && 
                  buffer[1] === 0xBB && 
                  buffer[2] === 0xBF;
    
    console.log(`${filePath}: ${hasBOM ? 'Has BOM' : 'No BOM'}`);
    
    // If it has BOM, remove it
    if (hasBOM) {
      console.log(`Removing BOM from ${filePath}`);
      fs.writeFileSync(filePath, buffer.slice(3));
    }
    
    // Check for other special characters
    const content = buffer.toString('utf8');
    const specialChars = content.match(/[\u0000-\u001F\u007F-\u009F\u00A0-\u00FF\u2000-\u206F\u2190-\u2BFF]/g);
    
    if (specialChars && specialChars.length > 0) {
      console.log(`Special characters found in ${filePath}:`);
      for (const char of new Set(specialChars)) {
        console.log(`- '${char}' (${char.charCodeAt(0)})`);
      }
      
      // Replace special quotes with regular ones
      const cleanContent = content
        .replace(/[\u2018\u2019]/g, "'") // Replace smart single quotes
        .replace(/[\u201C\u201D]/g, '"'); // Replace smart double quotes
      
      if (cleanContent !== content) {
        console.log(`Replacing smart quotes in ${filePath}`);
        fs.writeFileSync(filePath, cleanContent);
      }
    }
  } catch (err) {
    console.error(`Error checking ${filePath}:`, err);
  }
}

// Check all files
filesToCheck.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  checkForBOM(fullPath);
});

console.log('\nChecking complete. Try rebuilding your app now.');
