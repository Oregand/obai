#!/bin/bash

# Generate Prisma migrations for PostgreSQL
echo "Generating Prisma migrations..."
npx prisma migrate dev --name init

# Apply migrations to the database
echo "Applying migrations to the database..."
npx prisma migrate deploy

# Generate the Prisma client
echo "Generating Prisma client..."
npx prisma generate

echo "PostgreSQL setup complete! You can now restart your Next.js server."
