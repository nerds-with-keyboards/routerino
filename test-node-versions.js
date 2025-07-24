#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🧪 Testing Routerino with multiple Node.js versions...\n');

const nodeVersions = ['16', '18', '20', '22'];

console.log('📋 Current Node.js version:');
execSync('node --version', { stdio: 'inherit' });

console.log('\n⚠️  Note: This script shows which Node versions to test.');
console.log('To actually test different versions, you need to:');
console.log('1. Use a Node version manager (nvm, volta, fnm, etc.)');
console.log('2. Switch to each version and run: npm test -- --run\n');

console.log('Recommended test commands:\n');

for (const version of nodeVersions) {
  console.log(`# Node.js ${version}`);
  console.log(`nvm use ${version} && npm test -- --run`);
  console.log('');
}

console.log('Or use GitHub Actions which will test all combinations automatically.');