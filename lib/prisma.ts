import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
declare global {
  var prisma: PrismaClient | undefined;
}

// In development, we want to reuse the same PrismaClient instance across requests
// Only create a new one if one doesn't exist yet
if (!global.prisma) {
  global.prisma = new PrismaClient();
}

export const prisma = global.prisma;

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
