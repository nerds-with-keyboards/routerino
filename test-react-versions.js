#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

console.log('🧪 Testing Routerino with multiple React versions...\n');

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
const currentReactVersion = packageJson.devDependencies.react;
const currentReactDomVersion = packageJson.devDependencies['react-dom'];
const currentTestingLibraryVersion = packageJson.devDependencies['@testing-library/react'];

const versions = [
  { 
    react: '^17.0.0', 
    dom: '^17.0.0', 
    name: 'React 17',
    testingLibrary: '@testing-library/react@^12.1.5' // Compatible with React 17
  },
  { react: '^18.0.0', dom: '^18.0.0', name: 'React 18' },
  { react: '^19.0.0', dom: '^19.0.0', name: 'React 19' },
  { 
    react: 'npm:@preact/compat@^17.0.0', 
    dom: 'npm:@preact/compat@^17.0.0',
    name: 'Preact',
    extraPackages: 'preact@^10.0.0',
    testingLibrary: '@testing-library/preact@^3.0.0' // Preact testing library
  }
];

let allPassed = true;

for (const version of versions) {
  console.log(`\n📦 Testing with ${version.name}...`);
  console.log('─'.repeat(50));
  
  try {
    // Install specific React version
    console.log(`Installing ${version.name} packages...`);
    let packages = `react@${version.react} react-dom@${version.dom}`;
    
    if (version.extraPackages) {
      packages += ` ${version.extraPackages}`;
    }
    
    if (version.testingLibrary) {
      packages += ` ${version.testingLibrary}`;
    }
    
    execSync(`npm install --no-save ${packages}`, {
      stdio: 'inherit'
    });
    
    // Run tests
    console.log(`\nRunning tests...`);
    execSync('npm test -- --run', { stdio: 'inherit' });
    
    console.log(`✅ ${version.name} tests passed!\n`);
  } catch {
    console.error(`❌ ${version.name} tests failed!\n`);
    allPassed = false;
  }
}

// Restore original React version
console.log('\n🔄 Restoring original packages...');
execSync(`npm install --no-save react@${currentReactVersion} react-dom@${currentReactDomVersion} @testing-library/react@${currentTestingLibraryVersion}`, {
  stdio: 'inherit'
});

if (allPassed) {
  console.log('\n✨ All React versions tested successfully!');
  process.exit(0);
} else {
  console.error('\n💥 Some React versions failed!');
  process.exit(1);
}