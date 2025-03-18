#!/bin/bash
# Run this script to apply Prisma migrations

echo "Running Prisma migrations..."
npx prisma migrate dev --name fix_missing_tables

echo "Generating Prisma client..."
npx prisma generate
