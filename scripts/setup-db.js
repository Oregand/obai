// This script helps set up the PostgreSQL database with proper permissions
console.log("PostgreSQL Database Setup Instructions");
console.log("======================================");
console.log("\nFollow these steps to set up your PostgreSQL database correctly:");
console.log("\n1. Connect to PostgreSQL:");
console.log("   psql postgres");
console.log("\n2. Create your user with superuser privileges (if it doesn't exist):");
console.log("   CREATE ROLE davidoregan WITH LOGIN PASSWORD '' SUPERUSER;");
console.log("\n3. Drop and recreate the 'obai' database:");
console.log("   DROP DATABASE IF EXISTS obai;");
console.log("   CREATE DATABASE obai OWNER davidoregan;");
console.log("\n4. Connect to the 'obai' database:");
console.log("   \\c obai");
console.log("\n5. Verify permissions:");
console.log("   \\dn");
console.log("   \\du");
console.log("\n6. Exit PostgreSQL:");
console.log("   \\q");
console.log("\n7. Run Prisma migrate and seed:");
console.log("   npx prisma migrate dev");
console.log("   npx prisma db seed");
console.log("\n8. Restart your Next.js server:");
console.log("   npm run dev");
