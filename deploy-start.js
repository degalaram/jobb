#!/usr/bin/env node

// Bulletproof start script for Render deployment
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Render Deploy Debug Info:');
console.log('Current working directory:', process.cwd());
console.log('Script directory:', __dirname);
console.log('Process arguments:', process.argv);

// Set production environment
process.env.NODE_ENV = 'production';

// Multiple possible server locations to handle any path confusion
const possiblePaths = [
  // Standard path
  join(__dirname, 'server', 'dist', 'index.js'),
  // If running from project root
  join(process.cwd(), 'server', 'dist', 'index.js'),
  // If in src directory somehow
  join(__dirname, '..', 'server', 'dist', 'index.js'),
  // Absolute path construction
  resolve(__dirname, 'server', 'dist', 'index.js'),
  // Alternative locations
  join(__dirname, 'dist', 'server', 'index.js'),
  join(process.cwd(), 'dist', 'server', 'index.js')
];

console.log('🔍 Searching for server in these locations:');
possiblePaths.forEach((path, index) => {
  console.log(`${index + 1}. ${path}`);
});

let serverPath = null;
for (const path of possiblePaths) {
  if (fs.existsSync(path)) {
    serverPath = path;
    console.log(`✅ Found server at: ${path}`);
    break;
  }
}

if (!serverPath) {
  console.error('❌ Could not find server file at any location');
  console.error('📁 Directory listing of current location:');
  try {
    console.error('Current dir contents:', fs.readdirSync(process.cwd()));
  } catch (e) {
    console.error('Cannot read current directory:', e.message);
  }
  
  try {
    console.error('Script dir contents:', fs.readdirSync(__dirname));
  } catch (e) {
    console.error('Cannot read script directory:', e.message);
  }
  
  // Try to find any index.js files
  console.error('🔍 Looking for any index.js files...');
  try {
    const findIndexFiles = (dir, depth = 0) => {
      if (depth > 3) return; // Limit search depth
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = join(dir, item);
        try {
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
            findIndexFiles(fullPath, depth + 1);
          } else if (item === 'index.js') {
            console.error(`Found index.js at: ${fullPath}`);
          }
        } catch (e) {
          // Skip files we can't read
        }
      });
    };
    findIndexFiles(process.cwd());
  } catch (e) {
    console.error('Error searching for index.js files:', e.message);
  }
  
  process.exit(1);
}

// Verify client build exists
const clientPossiblePaths = [
  join(__dirname, 'dist', 'client', 'index.html'),
  join(process.cwd(), 'dist', 'client', 'index.html'),
  join(__dirname, 'client', 'dist', 'index.html')
];

let clientPath = null;
for (const path of clientPossiblePaths) {
  if (fs.existsSync(path)) {
    clientPath = path;
    console.log(`✅ Found client at: ${path}`);
    break;
  }
}

if (!clientPath) {
  console.warn('⚠️ Client build not found, but continuing with server start');
}

console.log(`🚀 Starting server from: ${serverPath}`);

// Start the server using spawn for better control
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.PORT || '3000'
  },
  cwd: dirname(serverPath) // Set working directory to server location
});

server.on('error', (err) => {
  console.error('❌ Server startup error:', err);
  process.exit(1);
});

server.on('exit', (code, signal) => {
  console.log(`Server process exited with code: ${code}, signal: ${signal}`);
  process.exit(code || 0);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.kill('SIGTERM');
});