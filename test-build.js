#!/usr/bin/env node

/**
 * Test Build Script - Simulates Netlify build process
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🔧 Testing build process...\n');

// Set environment variables like Netlify
process.env.CI = 'false';
process.env.GENERATE_SOURCEMAP = 'false';
process.env.NODE_ENV = 'production';

const clientDir = path.join(__dirname, 'client');

console.log('📁 Client directory:', clientDir);
console.log('🌍 Environment variables:');
console.log('  CI:', process.env.CI);
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  GENERATE_SOURCEMAP:', process.env.GENERATE_SOURCEMAP);
console.log('');

// Run npm install first
console.log('📦 Installing dependencies...');
const install = spawn('npm', ['install'], {
    cwd: clientDir,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
});

install.on('close', (code) => {
    if (code !== 0) {
        console.log('❌ npm install failed with code:', code);
        return;
    }
    
    console.log('✅ Dependencies installed successfully');
    console.log('🏗️ Building project...\n');
    
    // Run build
    const build = spawn('npm', ['run', 'build'], {
        cwd: clientDir,
        stdio: 'inherit',
        shell: true,
        env: { ...process.env }
    });
    
    build.on('close', (buildCode) => {
        if (buildCode === 0) {
            console.log('\n🎉 Build completed successfully!');
            console.log('📁 Build output should be in client/build/');
        } else {
            console.log('\n❌ Build failed with code:', buildCode);
            console.log('This is the same error Netlify is encountering.');
        }
    });
});

install.on('error', (err) => {
    console.log('❌ Error running npm install:', err.message);
});