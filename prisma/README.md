# Database Seed Information

This directory contains the seed scripts to populate your database with test data for development and testing purposes.

## Available Users

The seed script creates the following test users:

| User Type | Email | Password | Subscription | Credits |
|-----------|-------|----------|-------------|---------|
| Admin | admin@example.com | password123 | VIP | 10,000 |
| Premium | premium@example.com | password123 | Premium | 5,000 |
| Basic | basic@example.com | password123 | Basic | 1,000 |
| Free | free@example.com | password123 | Free | 100 |
| Test | test@example.com | password123 | Free | 500 |

## Available Personas

The seed script creates the following test personas:

1. **Basic Assistant** - General-purpose assistant, available to all users
2. **Expert Consultant** - Business and career advice, available to all users
3. **Creative Writer** - Writing and creative content help, available to all users
4. **Premium Advisor** - Premium content, available only to Premium and VIP subscribers
5. **VIP Mentor** - Exclusive high-tier content, available only to VIP subscribers

## Seed Data Includes

- User accounts with different subscription levels
- Multiple AI personas with varying access levels
- Example chats and messages
- Payment history records
- Subscription records
- Sample analytics data
- Payment methods
- Auto-topup settings
- Example of a locked message

## How to Run the Seed Script

1. Make sure your database is set up and the connection string is in your `.env` file
2. Run the following command:

```bash
npm run prisma:seed
```

Or directly:

```bash
npx ts-node prisma/seed.ts
```

## Reset Database

If you need to reset your database completely:

```bash
npx prisma migrate reset
```

This will drop all tables and run migrations and seed script.

## Note on Development

The seed script is designed for development and testing purposes only. It contains sample data that should not be used in production environments.
