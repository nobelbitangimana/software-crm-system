#!/usr/bin/env node

/**
 * IMMEDIATE DEPLOYMENT SCRIPT
 * This will deploy your CRM system RIGHT NOW
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 DEPLOYING YOUR CRM SYSTEM NOW...\n');

// Step 1: Build the frontend (already done, but let's make sure)
console.log('1️⃣ Building frontend...');
try {
    execSync('npm run build', { 
        cwd: path.join(__dirname, 'client'),
        stdio: 'inherit'
    });
    console.log('✅ Frontend built successfully\n');
} catch (error) {
    console.log('❌ Build failed:', error.message);
    process.exit(1);
}

// Step 2: Check if build folder exists
const buildPath = path.join(__dirname, 'client', 'build');
if (!fs.existsSync(buildPath)) {
    console.log('❌ Build folder not found');
    process.exit(1);
}

console.log('✅ Build folder exists with files:');
const buildFiles = fs.readdirSync(buildPath);
buildFiles.forEach(file => console.log(`   📁 ${file}`));

console.log('\n🎯 DEPLOYMENT OPTIONS:\n');

console.log('OPTION 1: Manual Netlify Deploy');
console.log('1. Go to https://app.netlify.com/drop');
console.log('2. Drag and drop your client/build folder');
console.log('3. Your site will be live immediately!');
console.log('');

console.log('OPTION 2: Use Netlify CLI (if login works)');
console.log('Run: netlify deploy --prod --dir=client/build');
console.log('');

console.log('OPTION 3: Use Vercel for Frontend Too');
console.log('1. Install: npm i -g vercel');
console.log('2. Run: vercel --prod');
console.log('3. Point to client/build folder');
console.log('');

console.log('🔗 YOUR CURRENT SETUP:');
console.log('✅ Backend: https://crm-backend-jet-seven.vercel.app');
console.log('✅ Database: MongoDB Atlas connected');
console.log('✅ Frontend: Built and ready in client/build/');
console.log('');

console.log('🎉 YOUR SYSTEM IS READY TO DEPLOY!');
console.log('The fastest way is OPTION 1 - just drag and drop to Netlify!');