#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Next.js Error Fix Script${NC}"
echo -e "-------------------------------"

# Step 1: Clear Next.js cache
echo -e "${YELLOW}Step 1/4: Clearing Next.js cache...${NC}"
if [ -d ".next" ]; then
    rm -rf .next
    echo -e "✓ .next directory removed"
else
    echo -e "✓ .next directory not found (already clean)"
fi

# Step 2: Remove node_modules/.cache
echo -e "\n${YELLOW}Step 2/4: Cleaning other caches...${NC}"
if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo -e "✓ node_modules/.cache removed"
else
    echo -e "✓ node_modules/.cache not found (already clean)"
fi

# Step 3: Reinstall next-auth
echo -e "\n${YELLOW}Step 3/4: Reinstalling next-auth and related packages...${NC}"
npm uninstall next-auth @next-auth/prisma-adapter
npm install next-auth@latest @next-auth/prisma-adapter@latest

# Step 4: Rebuild the application
echo -e "\n${YELLOW}Step 4/4: Rebuilding the application...${NC}"
npm run build

echo -e "\n${GREEN}Fix complete!${NC}"
echo -e "-------------------------------"
echo -e "You can now run ${YELLOW}npm run dev${NC} to start your application."
echo -e "If you still encounter issues, try running ${YELLOW}npm ci${NC} to perform a clean reinstall of all dependencies."
