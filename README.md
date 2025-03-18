# OBAI

## Database Setup

This project uses Prisma with PostgreSQL.

### PostgreSQL Setup

The app is configured to use PostgreSQL. Make sure your `.env.local` file has the correct database connection string:

```
DATABASE_URL="postgresql://davidoregan:postgres@localhost:5432/obai"
```

Run the following commands to set up your development database:

```bash
# Make the setup script executable
chmod +x setup-postgres.sh

# Run the setup script
./setup-postgres.sh
```

This will create all the required tables in your PostgreSQL database.

### Running the application

```bash
# Start the development server
npm run dev
```

## Troubleshooting

If you encounter database connection issues, check:
1. PostgreSQL is running on your machine
2. Your database connection string has the correct username and password
3. The database specified in your connection string exists
