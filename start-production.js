#!/usr/bin/env node

// Production start script for Render deployment
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set production environment
process.env.NODE_ENV = 'production';

console.log('🚀 Starting Job Portal in production mode...');

// Verify server build exists
const serverPath = join(__dirname, 'server', 'dist', 'index.js');
if (!fs.existsSync(serverPath)) {
  console.error('❌ Production server not found at:', serverPath);
  console.error('Make sure the build completed successfully');
  process.exit(1);
}

// Verify client build exists  
const clientPath = join(__dirname, 'dist', 'client', 'index.html');
if (!fs.existsSync(clientPath)) {
  console.error('❌ Production client not found at:', clientPath);
  console.error('Make sure the build completed successfully');
  process.exit(1);
}

console.log('✅ Production builds verified');
console.log('🌐 Starting server...');

// Import and start the server
try {
  await import(serverPath);
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}