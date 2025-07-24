#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

console.log('🧪 Testing Routerino with multiple React versions...\n');

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
const currentReactVersion = packageJson.devDependencies.react;

const versions = [
  { react: '^18.0.0', dom: '^18.0.0', name: 'React 18' },
  { react: '^19.0.0', dom: '^19.0.0', name: 'React 19' }
];

let allPassed = true;

for (const version of versions) {
  console.log(`\n📦 Testing with ${version.name}...`);
  console.log('─'.repeat(50));
  
  try {
    // Install specific React version
    console.log(`Installing react@${version.react} and react-dom@${version.dom}`);
    execSync(`npm install --no-save react@${version.react} react-dom@${version.dom}`, {
      stdio: 'inherit'
    });
    
    // Run tests
    console.log(`\nRunning tests...`);
    execSync('npm test -- --run', { stdio: 'inherit' });
    
    console.log(`✅ ${version.name} tests passed!\n`);
  } catch (error) {
    console.error(`❌ ${version.name} tests failed!\n`);
    allPassed = false;
  }
}

// Restore original React version
console.log('\n🔄 Restoring original React version...');
execSync(`npm install --no-save react@${currentReactVersion} react-dom@${currentReactVersion}`, {
  stdio: 'inherit'
});

if (allPassed) {
  console.log('\n✨ All React versions tested successfully!');
  process.exit(0);
} else {
  console.error('\n💥 Some React versions failed!');
  process.exit(1);
}