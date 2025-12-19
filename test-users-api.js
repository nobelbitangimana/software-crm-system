// Test users API endpoint
const axios = require('axios');

async function testUsersAPI() {
  try {
    console.log('🧪 Testing Users API...');
    
    // First login to get token
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@crm.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.accessToken;
    console.log('✅ Login successful, token received');
    
    // Test users endpoint
    console.log('2️⃣ Testing GET /api/users...');
    const usersResponse = await axios.get('http://localhost:3001/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Users API successful');
    console.log('📊 Response:', JSON.stringify(usersResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing users API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testUsersAPI();