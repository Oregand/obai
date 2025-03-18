#!/bin/bash

echo "Cleaning build artifacts..."
rm -rf .next

echo "Cleaning node_modules cache..."
npm cache clean --force

echo "Reinstalling dependencies..."
npm install

echo "Building the application..."
npm run build

echo "Clean build complete. You can now run 'npm run dev' to start the development server."
