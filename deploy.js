#!/usr/bin/env node

// Deployment helper script for CRM system
const fs = require('fs');
const path = require('path');

console.log('🚀 CRM System Deployment Helper\n');

// Check if required files exist
const requiredFiles = [
  'netlify.toml',
  'render.yaml',
  'client/.env.production',
  'server/.env.production',
  'create-production-admin.js'
];

console.log('📋 Checking deployment files...\n');

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please run the deployment setup first.');
  process.exit(1);
}

console.log('\n✅ All deployment files are ready!\n');

// Display next steps
console.log('📝 Next Steps for Deployment:\n');

console.log('1️⃣  Setup Cloud Services:');
console.log('   • Create MongoDB Atlas account and cluster');
console.log('   • Create Render account');
console.log('   • Create Netlify account');
console.log('   • Push code to GitHub\n');

console.log('2️⃣  Deploy Backend (Render):');
console.log('   • Connect GitHub repo to Render');
console.log('   • Set environment variables in Render dashboard');
console.log('   • Deploy and get backend URL\n');

console.log('3️⃣  Deploy Frontend (Netlify):');
console.log('   • Update client/.env.production with backend URL');
console.log('   • Connect GitHub repo to Netlify');
console.log('   • Deploy and get frontend URL\n');

console.log('4️⃣  Create Admin User:');
console.log('   • Update create-production-admin.js with MongoDB URI');
console.log('   • Run: node create-production-admin.js\n');

console.log('5️⃣  Test Deployment:');
console.log('   • Visit your Netlify URL');
console.log('   • Login with admin credentials');
console.log('   • Test all CRM features\n');

console.log('📚 For detailed instructions, see:');
console.log('   • NETLIFY-DEPLOYMENT-GUIDE.md');
console.log('   • DEPLOYMENT-CHECKLIST.md\n');

// Check current environment
console.log('🔍 Current Environment Check:\n');

// Check if MongoDB is running locally
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/crm', { 
  serverSelectionTimeoutMS: 2000 
}).then(() => {
  console.log('✅ Local MongoDB is running');
  mongoose.connection.close();
}).catch(() => {
  console.log('⚠️  Local MongoDB not running (this is OK for deployment)');
});

// Check if client build works
const { execSync } = require('child_process');
try {
  console.log('🔄 Testing client build...');
  execSync('cd client && npm run build', { stdio: 'ignore' });
  console.log('✅ Client build successful');
} catch (error) {
  console.log('❌ Client build failed - check for errors');
}

console.log('\n🎉 Your CRM system is ready for deployment!');
console.log('Follow the deployment guide for step-by-step instructions.\n');