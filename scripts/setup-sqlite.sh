#!/bin/bash

# Delete old Prisma migrations and SQLite DB if they exist
rm -rf prisma/migrations
rm -f prisma/dev.db

# Generate a fresh migration
echo "Generating a fresh migration..."
npx prisma migrate dev --name init

# Update Prisma client
echo "Updating Prisma client..."
npx prisma generate

echo "SQLite setup complete! You can now restart your Next.js server."
