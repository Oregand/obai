#!/bin/bash

# Force Prisma to regenerate client
echo "Generating Prisma client..."
npx prisma generate --force

# Create a new instance of Prisma client
echo "Creating new Prisma instance..."
cat > /Users/davidoregan/dev/github/obai/lib/prisma.ts << 'EOF'
import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
declare global {
  var prisma: PrismaClient | undefined;
}

// Ensure we use a clean instance of PrismaClient
if (global.prisma) {
  console.log("Closing existing Prisma client...");
  global.prisma.$disconnect();
  global.prisma = undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
EOF

echo "Done!"
