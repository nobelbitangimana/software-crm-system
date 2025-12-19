// Debug token validation issue
const axios = require('axios');

async function debugTokenIssue() {
  try {
    console.log('🔍 Debugging Token Issue...\n');
    
    // Step 1: Test login and get token
    console.log('1️⃣ Testing login to get fresh token...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@crm.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.accessToken;
    console.log('✅ Login successful');
    console.log('🔑 Token received:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    console.log('👤 User:', loginResponse.data.user.firstName, loginResponse.data.user.lastName);
    console.log('🎭 Role:', loginResponse.data.user.role);
    console.log('🔐 Permissions:', loginResponse.data.user.permissions.length, 'permissions\n');
    
    // Step 2: Test token validation with /users endpoint
    console.log('2️⃣ Testing token with /users endpoint...');
    try {
      const usersResponse = await axios.get('http://localhost:3001/api/users', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Token valid for /users endpoint');
      console.log('📊 Users found:', usersResponse.data.users.length);
    } catch (usersError) {
      console.log('❌ Token invalid for /users endpoint');
      console.log('Status:', usersError.response?.status);
      console.log('Error:', usersError.response?.data);
    }
    
    // Step 3: Test token validation with auth middleware directly
    console.log('\n3️⃣ Testing token with /auth/me endpoint...');
    try {
      const meResponse = await axios.get('http://localhost:3001/api/auth/me', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Token valid for /auth/me endpoint');
      console.log('👤 Current user:', meResponse.data.user.firstName, meResponse.data.user.lastName);
    } catch (meError) {
      console.log('❌ Token invalid for /auth/me endpoint');
      console.log('Status:', meError.response?.status);
      console.log('Error:', meError.response?.data);
    }
    
    // Step 4: Test user creation with fresh token
    console.log('\n4️⃣ Testing user creation with fresh token...');
    const testUserData = {
      firstName: 'Token',
      lastName: 'Test',
      email: `token.test.${Date.now()}@company.com`,
      password: 'password123',
      role: 'sdr'
    };
    
    try {
      const createResponse = await axios.post('http://localhost:3001/api/users', testUserData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ User creation successful with fresh token');
      console.log('👤 Created user:', createResponse.data.firstName, createResponse.data.lastName);
    } catch (createError) {
      console.log('❌ User creation failed');
      console.log('Status:', createError.response?.status);
      console.log('Error:', createError.response?.data);
      
      if (createError.response?.status === 401) {
        console.log('\n🔍 401 Unauthorized - Token issue confirmed');
      } else if (createError.response?.status === 403) {
        console.log('\n🔍 403 Forbidden - Permission issue');
      }
    }
    
    // Step 5: Check token expiration
    console.log('\n5️⃣ Checking token details...');
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        console.log('🔍 Token payload:');
        console.log('   User ID:', payload.userId);
        console.log('   Issued at:', new Date(payload.iat * 1000).toISOString());
        console.log('   Expires at:', new Date(payload.exp * 1000).toISOString());
        console.log('   Current time:', new Date().toISOString());
        console.log('   Token expired?', Date.now() > payload.exp * 1000 ? 'YES' : 'NO');
      }
    } catch (tokenError) {
      console.log('❌ Could not decode token:', tokenError.message);
    }
    
    // Step 6: Test with different authorization header formats
    console.log('\n6️⃣ Testing different authorization header formats...');
    
    const headerFormats = [
      { name: 'Bearer with space', value: `Bearer ${token}` },
      { name: 'Bearer without space', value: `Bearer${token}` },
      { name: 'Token only', value: token },
      { name: 'bearer lowercase', value: `bearer ${token}` }
    ];
    
    for (const format of headerFormats) {
      try {
        await axios.get('http://localhost:3001/api/auth/me', {
          headers: { 'Authorization': format.value }
        });
        console.log(`✅ ${format.name}: WORKS`);
      } catch (error) {
        console.log(`❌ ${format.name}: FAILS (${error.response?.status})`);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

debugTokenIssue();