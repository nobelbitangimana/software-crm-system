#!/usr/bin/env node

/**
 * Test Production API Connection
 * This will test if the frontend can reach the backend
 */

const https = require('https');

const BACKEND_URL = 'https://crm-backend-jet-seven.vercel.app';
const FRONTEND_URL = 'https://warm-stroopwafel-01d9af.netlify.app'; // Replace with your actual URL

console.log('🔍 Testing Production API Connection...\n');

// Test 1: Backend Health Check
function testBackendHealth() {
    return new Promise((resolve) => {
        console.log('1️⃣ Testing backend health...');
        
        https.get(`${BACKEND_URL}/api/health`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Backend is responding');
                    console.log('📊 Response:', data);
                } else {
                    console.log('❌ Backend health check failed:', res.statusCode);
                }
                resolve();
            });
        }).on('error', (err) => {
            console.log('❌ Backend not reachable:', err.message);
            resolve();
        });
    });
}

// Test 2: Login API
function testLoginAPI() {
    return new Promise((resolve) => {
        console.log('\n2️⃣ Testing login API...');
        
        const postData = JSON.stringify({
            email: 'admin@crm.com',
            password: 'admin123'
        });
        
        const options = {
            hostname: 'crm-backend-jet-seven.vercel.app',
            port: 443,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Origin': FRONTEND_URL
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('📊 Login API Status:', res.statusCode);
                console.log('📊 Response:', data);
                
                if (res.statusCode === 200) {
                    console.log('✅ Login API is working');
                } else {
                    console.log('❌ Login API failed');
                }
                resolve();
            });
        });
        
        req.on('error', (err) => {
            console.log('❌ Login API error:', err.message);
            resolve();
        });
        
        req.write(postData);
        req.end();
    });
}

// Test 3: CORS Check
function testCORS() {
    return new Promise((resolve) => {
        console.log('\n3️⃣ Testing CORS configuration...');
        
        const options = {
            hostname: 'crm-backend-jet-seven.vercel.app',
            port: 443,
            path: '/api/health',
            method: 'OPTIONS',
            headers: {
                'Origin': FRONTEND_URL,
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        };
        
        const req = https.request(options, (res) => {
            console.log('📊 CORS Status:', res.statusCode);
            console.log('📊 CORS Headers:', res.headers);
            
            if (res.headers['access-control-allow-origin']) {
                console.log('✅ CORS is configured');
            } else {
                console.log('❌ CORS might be blocking requests');
            }
            resolve();
        });
        
        req.on('error', (err) => {
            console.log('❌ CORS test error:', err.message);
            resolve();
        });
        
        req.end();
    });
}

async function runTests() {
    await testBackendHealth();
    await testLoginAPI();
    await testCORS();
    
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Check Vercel environment variables');
    console.log('2. Verify MongoDB connection string');
    console.log('3. Check CORS configuration');
    console.log('4. Verify frontend API URL');
    
    console.log('\n📝 NEXT STEPS:');
    console.log('If login API failed, we need to:');
    console.log('- Set environment variables in Vercel dashboard');
    console.log('- Update CORS settings for your frontend URL');
}

runTests();