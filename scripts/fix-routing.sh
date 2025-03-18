#!/bin/bash

echo "Fixing Next.js routing conflicts..."

# Remove the conflicting [id] directory
rm -rf "/Users/davidoregan/dev/github/obai/app/api/chat/[id]"

echo "Routing conflicts fixed. Please run 'npm run dev' to restart the server."
