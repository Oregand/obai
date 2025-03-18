# OBAI Project - Fresh Setup Guide

This guide will help you set up a fresh instance of the OBAI project with a clean database.

## Project Overview

OBAI is a Next.js application that lets users chat with AI personas powered by Grok 3. It includes features like:
- Chat interfaces with various AI personas
- Token-based economy
- User subscriptions
- Credit system

## Initial Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd obai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Copy the `.env.example` file to `.env` and `.env.local` and fill in the required values:
   ```bash
   cp .env.example .env
   cp .env.example .env.local
   ```

## Database Setup

### Option 1: Using the Reset Script (Recommended for Development)

The easiest way to set up a fresh database is using the reset script:

```bash
# Make the script executable
chmod +x prisma/reset-db.sh

# Run the reset script
npm run db:reset
```

This will:
1. Drop all tables in the database
2. Apply all migrations
3. Generate the Prisma client
4. Seed the database with initial data

### Option 2: Manual Setup

If you prefer to set up the database manually:

1. **Create the database**:
   ```bash
   createdb obai
   ```

2. **Apply migrations**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Generate the Prisma client**:
   ```bash
   npx prisma generate
   ```

4. **Seed the database** (optional):
   ```bash
   npx prisma db seed
   ```

## Running the Application

```bash
# Start the development server
npm run dev
```

The application will be available at http://localhost:3000.

## Troubleshooting

### Missing Tables or Fields

If you encounter errors about missing tables or fields:

```bash
# Run migrations
npx prisma migrate deploy
```

### TokenService Issues

The TokenService implementation has been fixed to include all necessary methods. If you encounter issues:

1. Check if all required methods are implemented in `lib/services/TokenService.ts`
2. Ensure the TokenService singleton is exported correctly
3. Verify that methods called in API routes exist in the TokenService class

### AI Service Configuration

The AI service is currently configured to work in mock mode by default. To use a real AI provider:

1. Set `USE_MOCK_API=false` in your `.env` file
2. Configure the appropriate API keys for your chosen provider
3. Update the `callAiProvider` function in `lib/services/ai-service.ts` if needed

## Project Structure

- `app/`: Next.js app router components and pages
- `components/`: Reusable React components
- `lib/`: Utility functions, services, and helpers
- `models/`: Data models and types
- `prisma/`: Database schema and migrations
- `public/`: Static assets
- `styles/`: CSS and styling files
- `types/`: TypeScript type definitions
