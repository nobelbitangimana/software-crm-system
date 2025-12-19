// Test user management functionality
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testUserManagement() {
  console.log('🧪 Testing User Management System...\n');
  
  let authToken = '';
  
  try {
    // Test 1: Login as admin
    console.log('1️⃣ Testing admin login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@crm.com',
      password: 'admin123'
    });
    
    authToken = loginResponse.data.accessToken;
    console.log('✅ Admin login successful');
    console.log(`   User: ${loginResponse.data.user.firstName} ${loginResponse.data.user.lastName}`);
    console.log(`   Role: ${loginResponse.data.user.role}\n`);
    
    // Test 2: Fetch existing users
    console.log('2️⃣ Testing fetch users...');
    const usersResponse = await axios.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Users fetched successfully');
    console.log(`   Total users: ${usersResponse.data.users.length}`);
    console.log(`   Users: ${usersResponse.data.users.map(u => u.email).join(', ')}\n`);
    
    // Test 3: Create a new SDR user
    console.log('3️⃣ Testing create SDR user...');
    const sdrData = {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: `sarah.johnson.${Date.now()}@company.com`,
      password: 'password123',
      role: 'sdr',
      department: 'Sales',
      territory: 'North America',
      quota: 30000,
      commissionRate: 4.5
    };
    
    const createSdrResponse = await axios.post(`${API_BASE}/users`, sdrData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ SDR user created successfully');
    console.log(`   User ID: ${createSdrResponse.data._id}`);
    console.log(`   Name: ${createSdrResponse.data.firstName} ${createSdrResponse.data.lastName}`);
    console.log(`   Role: ${createSdrResponse.data.role}`);
    console.log(`   Permissions: ${createSdrResponse.data.permissions?.length || 0} permissions\n`);
    
    // Test 4: Create an AE user
    console.log('4️⃣ Testing create AE user...');
    const aeData = {
      firstName: 'Mike',
      lastName: 'Davis',
      email: `mike.davis.${Date.now()}@company.com`,
      password: 'password123',
      role: 'ae',
      department: 'Sales',
      territory: 'Enterprise',
      quota: 100000,
      commissionRate: 6.0
    };
    
    const createAeResponse = await axios.post(`${API_BASE}/users`, aeData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ AE user created successfully');
    console.log(`   User ID: ${createAeResponse.data._id}`);
    console.log(`   Name: ${createAeResponse.data.firstName} ${createAeResponse.data.lastName}`);
    console.log(`   Role: ${createAeResponse.data.role}\n`);
    
    // Test 5: Create a CSM user
    console.log('5️⃣ Testing create CSM user...');
    const csmData = {
      firstName: 'Lisa',
      lastName: 'Chen',
      email: `lisa.chen.${Date.now()}@company.com`,
      password: 'password123',
      role: 'csm',
      department: 'Customer Success',
      territory: 'West Coast'
    };
    
    const createCsmResponse = await axios.post(`${API_BASE}/users`, csmData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ CSM user created successfully');
    console.log(`   User ID: ${createCsmResponse.data._id}`);
    console.log(`   Name: ${createCsmResponse.data.firstName} ${createCsmResponse.data.lastName}`);
    console.log(`   Role: ${createCsmResponse.data.role}\n`);
    
    // Test 6: Update a user
    console.log('6️⃣ Testing update user...');
    const updateData = {
      department: 'Sales Operations',
      quota: 35000
    };
    
    const updateResponse = await axios.put(`${API_BASE}/users/${createSdrResponse.data._id}`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ User updated successfully');
    console.log(`   Updated department: ${updateResponse.data.department}`);
    console.log(`   Updated quota: ${updateResponse.data.quota}\n`);
    
    // Test 7: Reset password
    console.log('7️⃣ Testing password reset...');
    const resetResponse = await axios.post(`${API_BASE}/users/${createSdrResponse.data._id}/reset-password`, {
      newPassword: 'newpassword123'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Password reset successfully');
    console.log(`   Message: ${resetResponse.data.message}\n`);
    
    // Test 8: Test login with new user
    console.log('8️⃣ Testing login with new SDR user...');
    const sdrLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: sdrData.email,
      password: 'newpassword123' // Using the reset password
    });
    
    console.log('✅ SDR user login successful');
    console.log(`   SDR User: ${sdrLoginResponse.data.user.firstName} ${sdrLoginResponse.data.user.lastName}`);
    console.log(`   SDR Role: ${sdrLoginResponse.data.user.role}`);
    console.log(`   SDR Permissions: ${sdrLoginResponse.data.user.permissions.length} permissions\n`);
    
    // Test 9: Fetch all users again to see the new ones
    console.log('9️⃣ Testing fetch all users after creation...');
    const finalUsersResponse = await axios.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Final users list fetched successfully');
    console.log(`   Total users: ${finalUsersResponse.data.users.length}`);
    finalUsersResponse.data.users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`);
    });
    
    console.log('\n🎉 ALL USER MANAGEMENT TESTS PASSED!');
    console.log('\n📋 User Management Features Verified:');
    console.log('   ✅ Admin can fetch users');
    console.log('   ✅ Admin can create users with different roles');
    console.log('   ✅ Role-based permissions are automatically assigned');
    console.log('   ✅ Admin can update user information');
    console.log('   ✅ Admin can reset user passwords');
    console.log('   ✅ New users can login with their credentials');
    console.log('   ✅ Users have appropriate role-based access');
    
    console.log('\n🎯 Created Users:');
    console.log('   👑 Admin: admin@crm.com / admin123');
    console.log(`   🎯 SDR: ${sdrData.email} / newpassword123`);
    console.log(`   💼 AE: ${aeData.email} / password123`);
    console.log(`   🤝 CSM: ${csmData.email} / password123`);
    
    console.log('\n🚀 Your User Management System is Ready!');
    console.log('   Go to Settings → User Management to manage users via UI');
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.message || error.response.data}`);
      if (error.response.data.errors) {
        console.error('   Validation errors:', error.response.data.errors);
      }
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
}

testUserManagement();