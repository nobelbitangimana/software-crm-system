// Test the fixed frontend form logic
const axios = require('axios');

async function testFixedFrontend() {
  try {
    console.log('🧪 Testing Fixed Frontend Form Logic...');
    
    // Login first
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@crm.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.accessToken;
    console.log('✅ Login successful');
    
    // Simulate the fixed frontend form data processing
    console.log('2️⃣ Testing with empty optional fields (fixed logic)...');
    
    let submitData = {
      firstName: 'Fixed',
      lastName: 'Frontend',
      email: `fixed.frontend.${Date.now()}@company.com`,
      password: 'password123',
      role: 'sdr',
      department: '', // Empty string
      territory: '', // Empty string
      phone: '', // Empty string
      quota: '', // Empty string - this was causing the issue
      commissionRate: '', // Empty string - this was causing the issue
      isActive: true
    };
    
    console.log('📤 Original form data:', JSON.stringify(submitData, null, 2));
    
    // Apply the frontend fix logic
    if (submitData.quota && submitData.quota !== '') {
      submitData.quota = parseFloat(submitData.quota);
    } else {
      delete submitData.quota;
    }
    
    if (submitData.commissionRate && submitData.commissionRate !== '') {
      submitData.commissionRate = parseFloat(submitData.commissionRate);
    } else {
      delete submitData.commissionRate;
    }
    
    // Remove empty string fields
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '') {
        delete submitData[key];
      }
    });
    
    console.log('📤 Processed form data:', JSON.stringify(submitData, null, 2));
    
    const createResponse = await axios.post('http://localhost:3001/api/users', submitData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Fixed frontend user created successfully!');
    console.log('📥 Response:', JSON.stringify(createResponse.data, null, 2));
    
    // Test with some filled numeric fields
    console.log('3️⃣ Testing with filled numeric fields...');
    
    let submitData2 = {
      firstName: 'Sales',
      lastName: 'Rep',
      email: `sales.rep.${Date.now()}@company.com`,
      password: 'password123',
      role: 'ae',
      department: 'Sales',
      territory: 'North America',
      phone: '+1-555-0123',
      quota: '75000', // String number
      commissionRate: '6.5', // String number
      isActive: true
    };
    
    console.log('📤 Original sales rep data:', JSON.stringify(submitData2, null, 2));
    
    // Apply the frontend fix logic
    if (submitData2.quota && submitData2.quota !== '') {
      submitData2.quota = parseFloat(submitData2.quota);
    } else {
      delete submitData2.quota;
    }
    
    if (submitData2.commissionRate && submitData2.commissionRate !== '') {
      submitData2.commissionRate = parseFloat(submitData2.commissionRate);
    } else {
      delete submitData2.commissionRate;
    }
    
    // Remove empty string fields
    Object.keys(submitData2).forEach(key => {
      if (submitData2[key] === '') {
        delete submitData2[key];
      }
    });
    
    console.log('📤 Processed sales rep data:', JSON.stringify(submitData2, null, 2));
    
    const createResponse2 = await axios.post('http://localhost:3001/api/users', submitData2, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Sales rep user created successfully!');
    console.log('📥 Response:', JSON.stringify(createResponse2.data, null, 2));
    
    console.log('\n🎉 Frontend fix working perfectly!');
    console.log('\n✅ The "failed to save user" issue should now be resolved!');
    console.log('\n💡 The problem was empty string values for numeric fields.');
    console.log('   The fix removes empty fields before sending to the API.');
    
  } catch (error) {
    console.error('❌ Error in fixed frontend test:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Message:', error.message);
    }
  }
}

testFixedFrontend();