// This file needs to be copied and run on your local machine
// Save it as fix-layout-error.js and run with: node fix-layout-error.js
const fs = require('fs');
const path = require('path');

// Function to find all layout.js files
function findLayoutJsFiles(dir) {
  const results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively search directories, but skip node_modules
      if (file !== 'node_modules') {
        results.push(...findLayoutJsFiles(filePath));
      }
    } else if (file.includes('layout.js')) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Function to check a specific line in a file for invalid characters
function checkFileForInvalidChars(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    if (lines.length >= 72) {
      console.log(`\nChecking file: ${filePath}`);
      const line72 = lines[71]; // 0-indexed
      
      // Print the line
      console.log(`Line 72: ${line72}`);
      
      // Check for invalid characters around position 29
      if (line72.length >= 29) {
        const charAtPos = line72.charAt(29);
        const charCode = line72.charCodeAt(29);
        console.log(`Character at position 29: '${charAtPos}' (char code: ${charCode})`);
        
        // If the character code is outside of normal ASCII range, it might be the issue
        if (charCode < 32 || (charCode > 126 && charCode < 160)) {
          console.log(`POTENTIAL ISSUE: Non-printable character found at position 29`);
        }
        
        // Display a few characters before and after position 29
        const start = Math.max(0, 29 - 10);
        const end = Math.min(line72.length, 29 + 10);
        console.log(`Context: "${line72.substring(start, end)}"`);
        
        // Generate character codes for better debugging
        console.log("Character codes:");
        for (let i = start; i < end; i++) {
          const char = line72.charAt(i);
          console.log(`Position ${i}: '${char}' (${line72.charCodeAt(i)})`);
        }
      }
    }
  } catch (err) {
    console.error(`Error checking file ${filePath}:`, err);
  }
}

// Main function
function main() {
  const rootDir = process.cwd();
  console.log(`Searching for layout.js files in: ${rootDir}`);
  
  const layoutFiles = findLayoutJsFiles(rootDir);
  console.log(`Found ${layoutFiles.length} layout.js files`);
  
  layoutFiles.forEach(file => {
    checkFileForInvalidChars(file);
  });
}

main();
