#!/bin/bash

# Build the frontend
npm run check
vite build

# Create server/public directory and copy frontend files
mkdir -p server/public
cp -r dist/* server/public/

# Build the server
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --external:express --external:bcryptjs --external:drizzle-orm --external:@neondatabase/serverless

echo "Build completed successfully!"