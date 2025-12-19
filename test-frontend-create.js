// Test user creation exactly like the frontend would do it
const axios = require('axios');

async function testFrontendCreate() {
  try {
    console.log('🧪 Testing Frontend-style User Creation...');
    
    // Login first (like frontend does)
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@crm.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.accessToken;
    console.log('✅ Login successful');
    
    // Simulate exactly what the frontend UserForm would send
    console.log('2️⃣ Testing create user like frontend form...');
    
    // This is the exact data structure the UserForm component would send
    const frontendUserData = {
      firstName: 'Frontend',
      lastName: 'Test',
      email: `frontend.test.${Date.now()}@company.com`,
      password: 'password123',
      role: 'sdr',
      department: 'Sales',
      territory: 'Test Territory',
      phone: '+1-555-0123',
      quota: 30000,
      commissionRate: 4.5,
      isActive: true
    };
    
    console.log('📤 Sending frontend-style data:', JSON.stringify(frontendUserData, null, 2));
    
    // Use the same axios configuration as the frontend
    const config = {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const createResponse = await axios.post(
      'http://localhost:3001/api/users', 
      frontendUserData, 
      config
    );
    
    console.log('✅ Frontend-style user created successfully!');
    console.log('📥 Response:', JSON.stringify(createResponse.data, null, 2));
    
    // Test with empty/undefined values (common frontend issue)
    console.log('3️⃣ Testing with empty optional fields...');
    const emptyFieldsData = {
      firstName: 'Empty',
      lastName: 'Fields',
      email: `empty.fields.${Date.now()}@company.com`,
      password: 'password123',
      role: 'ae',
      department: '', // Empty string
      territory: '', // Empty string
      phone: '', // Empty string
      quota: '', // Empty string
      commissionRate: '', // Empty string
      isActive: true
    };
    
    console.log('📤 Sending data with empty fields:', JSON.stringify(emptyFieldsData, null, 2));
    
    const emptyResponse = await axios.post(
      'http://localhost:3001/api/users', 
      emptyFieldsData, 
      config
    );
    
    console.log('✅ User with empty fields created successfully!');
    console.log('📥 Response:', JSON.stringify(emptyResponse.data, null, 2));
    
    // Test duplicate email (common error)
    console.log('4️⃣ Testing duplicate email error...');
    try {
      await axios.post(
        'http://localhost:3001/api/users', 
        frontendUserData, // Same email as before
        config
      );
    } catch (duplicateError) {
      console.log('✅ Duplicate email validation working');
      console.log('📥 Error response:', JSON.stringify(duplicateError.response.data, null, 2));
    }
    
    console.log('\n🎉 All frontend-style tests passed!');
    console.log('\n💡 If you\'re still getting "failed to save user", check:');
    console.log('   1. Browser console for JavaScript errors');
    console.log('   2. Network tab in DevTools for the actual request');
    console.log('   3. Make sure you\'re logged in as admin');
    console.log('   4. Try with minimal data (just name, email, password, role)');
    
  } catch (error) {
    console.error('❌ Error in frontend-style test:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

testFrontendCreate();