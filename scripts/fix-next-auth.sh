#!/bin/bash

echo "Fixing Next-Auth issue..."

# Stop any running Next.js instances
# Assuming these might be running in another terminal

# Step 1: Clear Next.js cache
echo "Clearing Next.js cache..."
rm -rf .next

# Step 2: Reinstall next-auth
echo "Reinstalling next-auth..."
npm uninstall next-auth @next-auth/prisma-adapter
npm install next-auth@latest @next-auth/prisma-adapter@latest

# Step 3: Rebuild the application
echo "Rebuilding the application..."
npm run build

echo "Fix complete. Run 'npm run dev' to start your application."
