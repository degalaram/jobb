#!/usr/bin/env node

// Simplified Render deployment start script
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Primary server location
const serverPath = join(__dirname, 'server', 'dist', 'index.js');

console.log('🔍 Starting Job Portal server...');
console.log('Server path:', serverPath);

// Check if server exists
if (!fs.existsSync(serverPath)) {
  console.error('❌ Server file not found at:', serverPath);
  console.error('Directory contents:', fs.readdirSync(__dirname));
  console.error('Server directory contents:', fs.existsSync(join(__dirname, 'server')) ? fs.readdirSync(join(__dirname, 'server')) : 'server directory not found');
  console.error('Server dist contents:', fs.existsSync(join(__dirname, 'server', 'dist')) ? fs.readdirSync(join(__dirname, 'server', 'dist')) : 'dist directory not found');
  process.exit(1);
}

console.log(`🚀 Starting server from: ${serverPath}`);
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: { 
    ...process.env,
    NODE_ENV: 'production'
  }
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code: ${code}`);
  process.exit(code || 0);
});