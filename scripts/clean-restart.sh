#!/bin/bash
# Script to clean Next.js cache and restart the development server

echo "Cleaning Next.js cache..."
rm -rf .next

echo "Reinstalling dependencies..."
npm install

echo "Starting development server..."
npm run dev
