// Test login functionality
const axios = require('axios');

async function testLogin() {
  try {
    console.log('🧪 Testing login with admin credentials...');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@crm.com',
      password: 'admin123'
    });
    
    console.log('✅ Login successful!');
    console.log('👤 User:', response.data.user);
    console.log('🔑 Access token received:', response.data.accessToken ? 'Yes' : 'No');
    
  } catch (error) {
    console.error('❌ Login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin();