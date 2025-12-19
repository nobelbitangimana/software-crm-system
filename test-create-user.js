// Test user creation specifically
const axios = require('axios');

async function testCreateUser() {
  try {
    console.log('🧪 Testing User Creation...');
    
    // Login first
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@crm.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.accessToken;
    console.log('✅ Login successful');
    
    // Test creating a user with minimal data
    console.log('2️⃣ Testing create user with minimal data...');
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test.user.${Date.now()}@company.com`,
      password: 'password123',
      role: 'sdr'
    };
    
    console.log('📤 Sending user data:', JSON.stringify(userData, null, 2));
    
    const createResponse = await axios.post('http://localhost:3001/api/users', userData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ User created successfully!');
    console.log('📥 Response:', JSON.stringify(createResponse.data, null, 2));
    
    // Test creating a user with full data
    console.log('3️⃣ Testing create user with full data...');
    const fullUserData = {
      firstName: 'Full',
      lastName: 'User',
      email: `full.user.${Date.now()}@company.com`,
      password: 'password123',
      role: 'ae',
      department: 'Sales',
      territory: 'North America',
      phone: '+1-555-0123',
      quota: 50000,
      commissionRate: 5.5,
      isActive: true
    };
    
    console.log('📤 Sending full user data:', JSON.stringify(fullUserData, null, 2));
    
    const createFullResponse = await axios.post('http://localhost:3001/api/users', fullUserData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Full user created successfully!');
    console.log('📥 Response:', JSON.stringify(createFullResponse.data, null, 2));
    
    // Test with invalid data to see validation
    console.log('4️⃣ Testing create user with invalid data...');
    const invalidUserData = {
      firstName: '',
      lastName: 'User',
      email: 'invalid-email',
      password: '123', // Too short
      role: 'invalid_role'
    };
    
    try {
      await axios.post('http://localhost:3001/api/users', invalidUserData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (validationError) {
      console.log('✅ Validation working correctly');
      console.log('📥 Validation errors:', JSON.stringify(validationError.response.data, null, 2));
    }
    
    console.log('\n🎉 User creation tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing user creation:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

testCreateUser();