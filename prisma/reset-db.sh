#!/bin/bash

# This script completely resets the database for development

# Extract database name from DATABASE_URL
DB_URL=$(grep DATABASE_URL .env | cut -d "=" -f2- | tr -d '"' | tr -d "'")
DB_NAME=$(echo $DB_URL | sed -E 's/.*\/([^?]*).*/\1/')

echo "================================"
echo "Database Reset Script"
echo "================================"
echo "This will completely reset your database: $DB_NAME"
echo "All data will be lost!"
echo "--------------------------------"
echo "Proceeding in 3 seconds..."
sleep 3

# Drop the database
echo "Dropping database..."
npx prisma db push --force-reset

# Apply migrations
echo "Applying migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run seeds
echo "Seeding database with initial data..."
npx prisma db seed

echo "================================"
echo "Database reset complete!"
echo "================================"
