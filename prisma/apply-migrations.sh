#!/bin/bash

# Apply Prisma migrations
echo "Applying Prisma migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

echo "Migration complete!"
