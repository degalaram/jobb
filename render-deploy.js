#!/usr/bin/env node

// FINAL BULLETPROOF Render deployment script
// This will find and start your server NO MATTER WHERE IT IS

console.log('🚀 RENDER DEPLOYMENT - BULLETPROOF START SCRIPT');
console.log('Working directory:', process.cwd());
console.log('Script location:', __dirname);

// Import required modules
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set environment
process.env.NODE_ENV = 'production';

// FIND SERVER FILE ANYWHERE
function findServerFile() {
  const searchPaths = [
    // Standard locations
    'server/dist/index.js',
    'dist/server/index.js',
    'server/index.js',
    'dist/index.js',
    
    // With absolute paths
    join(__dirname, 'server/dist/index.js'),
    join(__dirname, 'dist/server/index.js'),
    join(__dirname, 'server/index.js'),
    join(process.cwd(), 'server/dist/index.js'),
    join(process.cwd(), 'dist/server/index.js'),
    
    // Alternative structures
    resolve('server/dist/index.js'),
    resolve('dist/server/index.js'),
    resolve('./server/dist/index.js'),
    resolve('./dist/server/index.js')
  ];

  console.log('🔍 Searching for server file...');
  
  for (let path of searchPaths) {
    console.log(`Checking: ${path}`);
    if (fs.existsSync(path)) {
      const fullPath = resolve(path);
      console.log(`✅ FOUND SERVER: ${fullPath}`);
      return fullPath;
    }
  }

  // Last resort - search entire directory tree
  console.log('🔍 Performing deep search...');
  const deepSearch = (dir, maxDepth = 3, currentDepth = 0) => {
    if (currentDepth >= maxDepth) return null;
    
    try {
      const items = fs.readdirSync(dir);
      
      // Look for index.js in this directory
      if (items.includes('index.js')) {
        const indexPath = join(dir, 'index.js');
        console.log(`Found index.js at: ${indexPath}`);
        return indexPath;
      }
      
      // Search subdirectories
      for (const item of items) {
        if (item === 'node_modules' || item.startsWith('.')) continue;
        
        const fullPath = join(dir, item);
        try {
          if (fs.statSync(fullPath).isDirectory()) {
            const result = deepSearch(fullPath, maxDepth, currentDepth + 1);
            if (result) return result;
          }
        } catch (e) {
          // Skip inaccessible directories
        }
      }
    } catch (e) {
      console.log(`Cannot read directory: ${dir}`);
    }
    
    return null;
  };

  const foundServer = deepSearch(process.cwd());
  if (foundServer) {
    console.log(`✅ DEEP SEARCH FOUND: ${foundServer}`);
    return foundServer;
  }

  return null;
}

// MAIN EXECUTION
async function startServer() {
  console.log('📁 Current directory contents:');
  try {
    console.log(fs.readdirSync(process.cwd()));
  } catch (e) {
    console.log('Cannot list directory contents');
  }

  const serverPath = findServerFile();
  
  if (!serverPath) {
    console.error('❌ CRITICAL ERROR: Cannot find server file anywhere!');
    console.error('📁 Full directory listing:');
    
    // Show full directory structure
    const showDir = (dir, prefix = '') => {
      try {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          if (item.startsWith('.') || item === 'node_modules') return;
          console.error(`${prefix}${item}`);
          const fullPath = join(dir, item);
          try {
            if (fs.statSync(fullPath).isDirectory() && prefix.length < 10) {
              showDir(fullPath, prefix + '  ');
            }
          } catch (e) {
            // Skip
          }
        });
      } catch (e) {
        console.error(`${prefix}[Cannot read directory]`);
      }
    };
    
    showDir(process.cwd());
    process.exit(1);
  }

  console.log(`🚀 STARTING SERVER: ${serverPath}`);
  console.log(`📂 Server directory: ${dirname(serverPath)}`);

  // Start the server
  const server = spawn('node', [serverPath], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: process.env.PORT || '10000'
    },
    cwd: dirname(serverPath)
  });

  server.on('error', (err) => {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  });

  server.on('exit', (code, signal) => {
    console.log(`Server exited with code ${code}, signal ${signal}`);
    process.exit(code || 0);
  });

  // Graceful shutdown
  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
      console.log(`Received ${signal}, shutting down...`);
      server.kill(signal);
    });
  });
}

startServer().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});