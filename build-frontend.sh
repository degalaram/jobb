#!/bin/bash
set -e

echo "Building frontend..."

# Build the frontend using the vite configuration
npx vite build

echo "Frontend build completed!"
echo "Files built to dist/"