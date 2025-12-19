const fs = require('fs');
const path = require('path');

console.log('🔍 Checking CRM System Setup...\n');

// Check if required files exist
const requiredFiles = [
  'server/.env',
  'client/.env',
  'server/package.json',
  'client/package.json'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} is missing`);
    allFilesExist = false;
  }
});

// Check if node_modules exist
const nodeModulesPaths = [
  'node_modules',
  'server/node_modules',
  'client/node_modules'
];

nodeModulesPaths.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir} exists`);
  } else {
    console.log(`⚠️  ${dir} is missing - run 'npm run install-all'`);
  }
});

console.log('\n📋 Setup Summary:');
if (allFilesExist) {
  console.log('✅ All required configuration files are present');
  console.log('🚀 You can start the application with: npm run dev');
  console.log('🌐 Frontend: http://localhost:3000');
  console.log('🔧 Backend API: http://localhost:3333/api');
} else {
  console.log('❌ Some configuration files are missing');
  console.log('📖 Please check the README.md for setup instructions');
}

console.log('\n💡 Demo Credentials:');
console.log('   Admin: admin@crm.com / admin123');
console.log('   Sales: sales@crm.com / sales123');