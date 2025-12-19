#!/usr/bin/env node

/**
 * Deploy to GitHub Pages - FAST OPTION
 */

const { execSync } = require('child_process');

console.log('🚀 DEPLOYING TO GITHUB PAGES...\n');

try {
    // Install gh-pages if not installed
    console.log('📦 Installing gh-pages...');
    execSync('npm install -g gh-pages', { stdio: 'inherit' });
    
    console.log('🚀 Deploying to GitHub Pages...');
    execSync('gh-pages -d client/build', { stdio: 'inherit' });
    
    console.log('\n✅ DEPLOYED SUCCESSFULLY!');
    console.log('🔗 Your site will be live at:');
    console.log('https://nobelbitangimana.github.io/software-crm-system/');
    
} catch (error) {
    console.log('❌ Error:', error.message);
    console.log('\n🎯 FASTEST OPTION: Use Netlify Drop');
    console.log('1. Go to: https://app.netlify.com/drop');
    console.log('2. Drag your client/build folder');
    console.log('3. Done!');
}