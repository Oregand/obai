#!/bin/bash
# Script to fix the layout.js:72:29 syntax error

# Step 1: Check for BOM marks and special characters
echo "Checking for BOM and special characters..."
node check-bom.js

# Step 2: Update config files with clean versions
echo "Updating Next.js config..."
mv next.config.js.new next.config.js

echo "Updating CSS with Tailwind directives at the top..."
mv styles/globals.css.new styles/globals.css

echo "Updating layout.tsx with clean version..."
mv app/layout.tsx.new app/layout.tsx

# Step 3: Clean Next.js cache
echo "Cleaning Next.js cache..."
rm -rf .next

# Step 4: Clean node_modules and reinstall (sometimes needed)
read -p "Do you want to clean node_modules and reinstall? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "Removing node_modules..."
  rm -rf node_modules
  
  echo "Reinstalling dependencies..."
  npm install
fi

# Step 5: Rebuild the project
echo "Starting Next.js build..."
npm run build

echo "Fix complete! Try starting the dev server with: npm run dev"
