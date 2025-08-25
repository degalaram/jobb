#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🔧 Installing dependencies for monorepo structure...');

// Read root package.json
const rootPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Copy required dependencies to client
const clientDeps = {
  "react": rootPkg.dependencies.react,
  "react-dom": rootPkg.dependencies["react-dom"],
  "@radix-ui/react-accordion": rootPkg.dependencies["@radix-ui/react-accordion"],
  "@radix-ui/react-alert-dialog": rootPkg.dependencies["@radix-ui/react-alert-dialog"],
  "@radix-ui/react-avatar": rootPkg.dependencies["@radix-ui/react-avatar"],
  "@radix-ui/react-checkbox": rootPkg.dependencies["@radix-ui/react-checkbox"],
  "@radix-ui/react-dialog": rootPkg.dependencies["@radix-ui/react-dialog"],
  "@radix-ui/react-dropdown-menu": rootPkg.dependencies["@radix-ui/react-dropdown-menu"],
  "@radix-ui/react-label": rootPkg.dependencies["@radix-ui/react-label"],
  "@radix-ui/react-popover": rootPkg.dependencies["@radix-ui/react-popover"],
  "@radix-ui/react-progress": rootPkg.dependencies["@radix-ui/react-progress"],
  "@radix-ui/react-select": rootPkg.dependencies["@radix-ui/react-select"],
  "@radix-ui/react-separator": rootPkg.dependencies["@radix-ui/react-separator"],
  "@radix-ui/react-slot": rootPkg.dependencies["@radix-ui/react-slot"],
  "@radix-ui/react-switch": rootPkg.dependencies["@radix-ui/react-switch"],
  "@radix-ui/react-tabs": rootPkg.dependencies["@radix-ui/react-tabs"],
  "@radix-ui/react-toast": rootPkg.dependencies["@radix-ui/react-toast"],
  "@radix-ui/react-tooltip": rootPkg.dependencies["@radix-ui/react-tooltip"],
  "class-variance-authority": rootPkg.dependencies["class-variance-authority"],
  "clsx": rootPkg.dependencies.clsx,
  "tailwind-merge": rootPkg.dependencies["tailwind-merge"],
  "wouter": rootPkg.dependencies.wouter,
  "@tanstack/react-query": rootPkg.dependencies["@tanstack/react-query"],
  "lucide-react": rootPkg.dependencies["lucide-react"],
  "react-icons": rootPkg.dependencies["react-icons"],
  "framer-motion": rootPkg.dependencies["framer-motion"],
  "react-hook-form": rootPkg.dependencies["react-hook-form"],
  "@hookform/resolvers": rootPkg.dependencies["@hookform/resolvers"],
  "zod": rootPkg.dependencies.zod,
  "date-fns": rootPkg.dependencies["date-fns"],
  "recharts": rootPkg.dependencies.recharts,
  "tailwindcss-animate": rootPkg.dependencies["tailwindcss-animate"]
};

// Update client package.json
const clientPkg = JSON.parse(fs.readFileSync('client/package.json', 'utf8'));
clientPkg.dependencies = { ...clientPkg.dependencies, ...clientDeps };
fs.writeFileSync('client/package.json', JSON.stringify(clientPkg, null, 2));

console.log('✅ Updated client package.json with required dependencies');

// Copy node_modules to client if it doesn't exist
try {
  if (!fs.existsSync('client/node_modules')) {
    console.log('📦 Copying node_modules to client...');
    execSync('cp -r node_modules client/', { stdio: 'inherit' });
  }
} catch (error) {
  console.log('⚠️  Could not copy node_modules, but continuing...');
}

console.log('🎉 Dependency setup complete!');