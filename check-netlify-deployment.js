#!/usr/bin/env node

/**
 * Check Netlify Deployment Status
 * This script helps verify your Netlify deployment configuration
 */

const https = require('https');

// Your deployment URLs
const NETLIFY_SITE_ID = 'warm-stroopwafel-01d9af';
const EXPECTED_BACKEND_URL = 'https://crm-backend-jet-seven.vercel.app/api';

console.log('🔍 Checking Netlify Deployment Status...\n');

// Check if Netlify site is accessible
function checkNetlifySite() {
    const netlifyUrl = `https://${NETLIFY_SITE_ID}.netlify.app`;
    
    console.log(`📡 Checking Netlify site: ${netlifyUrl}`);
    
    https.get(netlifyUrl, (res) => {
        console.log(`✅ Netlify site status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
            console.log('🎉 Frontend is accessible!');
        } else {
            console.log('❌ Frontend might not be deployed yet');
        }
        
        // Check backend
        checkBackend();
    }).on('error', (err) => {
        console.log('❌ Netlify site not accessible:', err.message);
        checkBackend();
    });
}

// Check if backend is accessible
function checkBackend() {
    console.log(`\n📡 Checking backend: ${EXPECTED_BACKEND_URL}`);
    
    https.get(EXPECTED_BACKEND_URL + '/health', (res) => {
        console.log(`✅ Backend status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
            console.log('🎉 Backend is accessible!');
        } else {
            console.log('❌ Backend might have issues');
        }
        
        showNextSteps();
    }).on('error', (err) => {
        console.log('❌ Backend not accessible:', err.message);
        showNextSteps();
    });
}

function showNextSteps() {
    console.log('\n📋 Next Steps:');
    console.log('1. Find "Trigger deploy" button in Netlify:');
    console.log('   - Go to your Netlify dashboard');
    console.log('   - Click "Deploys" tab');
    console.log('   - Look for "Trigger deploy" button');
    console.log('   - Select "Deploy site"');
    console.log('');
    console.log('2. Your build settings should be:');
    console.log('   - Base directory: (empty)');
    console.log('   - Build command: cd client && npm run build');
    console.log('   - Publish directory: client/build');
    console.log('');
    console.log('3. Environment variables in Netlify:');
    console.log(`   - REACT_APP_API_URL: ${EXPECTED_BACKEND_URL}`);
    console.log('');
    console.log('🔗 Your URLs:');
    console.log(`   Frontend: https://${NETLIFY_SITE_ID}.netlify.app`);
    console.log(`   Backend: https://crm-backend-jet-seven.vercel.app`);
}

// Start checking
checkNetlifySite();