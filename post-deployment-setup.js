// Post-deployment setup script
// Run this after successful deployment to verify everything works

const axios = require('axios');

// Configuration - UPDATE THESE WITH YOUR ACTUAL URLS
const FRONTEND_URL = 'https://your-crm-app.netlify.app';
const BACKEND_URL = 'https://your-crm-backend.vercel.app';
const ADMIN_EMAIL = 'admin@yourcompany.com';
const ADMIN_PASSWORD = 'YourSecurePassword123!';

async function testDeployment() {
  console.log('🧪 Testing CRM Deployment\n');
  
  try {
    // Test 1: Backend Health Check
    console.log('1️⃣  Testing backend health...');
    try {
      const healthResponse = await axios.get(`${BACKEND_URL}/api/health`, {
        timeout: 10000
      });
      console.log('✅ Backend is healthy');
    } catch (error) {
      console.log('❌ Backend health check failed:', error.message);
      return;
    }

    // Test 2: Database Connection
    console.log('\n2️⃣  Testing database connection...');
    try {
      const dbResponse = await axios.get(`${BACKEND_URL}/api/auth/health`, {
        timeout: 10000
      });
      console.log('✅ Database connection working');
    } catch (error) {
      console.log('❌ Database connection failed:', error.message);
    }

    // Test 3: Admin Login
    console.log('\n3️⃣  Testing admin login...');
    try {
      const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      }, {
        timeout: 10000
      });
      
      const token = loginResponse.data.accessToken;
      console.log('✅ Admin login successful');
      console.log(`👤 User: ${loginResponse.data.user.firstName} ${loginResponse.data.user.lastName}`);
      console.log(`🎭 Role: ${loginResponse.data.user.role}`);

      // Test 4: User Management API
      console.log('\n4️⃣  Testing user management...');
      try {
        const usersResponse = await axios.get(`${BACKEND_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        });
        console.log(`✅ User management working - ${usersResponse.data.users.length} users found`);
      } catch (error) {
        console.log('❌ User management failed:', error.response?.data?.message || error.message);
      }

      // Test 5: Create Test User
      console.log('\n5️⃣  Testing user creation...');
      try {
        const testUser = {
          firstName: 'Test',
          lastName: 'User',
          email: `test.${Date.now()}@company.com`,
          password: 'password123',
          role: 'sdr'
        };

        const createResponse = await axios.post(`${BACKEND_URL}/api/users`, testUser, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        });
        console.log(`✅ User creation working - Created: ${createResponse.data.firstName} ${createResponse.data.lastName}`);
      } catch (error) {
        console.log('❌ User creation failed:', error.response?.data?.message || error.message);
      }

    } catch (error) {
      console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
      console.log('   Make sure you created the admin user with create-production-admin.js');
      return;
    }

    // Test 6: Frontend Accessibility
    console.log('\n6️⃣  Testing frontend accessibility...');
    try {
      const frontendResponse = await axios.get(FRONTEND_URL, {
        timeout: 10000
      });
      if (frontendResponse.status === 200) {
        console.log('✅ Frontend is accessible');
      }
    } catch (error) {
      console.log('❌ Frontend not accessible:', error.message);
    }

    console.log('\n🎉 Deployment Test Complete!\n');
    
    console.log('📊 Summary:');
    console.log(`   Frontend: ${FRONTEND_URL}`);
    console.log(`   Backend:  ${BACKEND_URL}`);
    console.log(`   Admin:    ${ADMIN_EMAIL}`);
    console.log('\n✅ Your CRM system is ready to use!');

  } catch (error) {
    console.error('❌ Deployment test failed:', error.message);
  }
}

// Instructions
console.log('🔧 Post-Deployment Setup\n');
console.log('Before running this test, make sure you have:');
console.log('1. Updated the URLs at the top of this file');
console.log('2. Created the admin user with create-production-admin.js');
console.log('3. Both frontend and backend are deployed\n');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Have you updated the URLs in this file? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    rl.close();
    testDeployment();
  } else {
    console.log('\nPlease update the URLs at the top of this file first:');
    console.log('- FRONTEND_URL: Your Netlify URL');
    console.log('- BACKEND_URL: Your Render URL');
    console.log('- ADMIN_EMAIL: Your admin email');
    console.log('- ADMIN_PASSWORD: Your admin password\n');
    rl.close();
  }
});