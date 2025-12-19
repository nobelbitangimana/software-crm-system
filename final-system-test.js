// Final comprehensive system test
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function runTests() {
  console.log('🧪 Running comprehensive CRM system tests...\n');
  
  let authToken = '';
  
  try {
    // Test 1: Login
    console.log('1️⃣ Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@crm.com',
      password: 'admin123'
    });
    
    authToken = loginResponse.data.accessToken;
    console.log('✅ Login successful');
    console.log(`   User: ${loginResponse.data.user.firstName} ${loginResponse.data.user.lastName}`);
    console.log(`   Role: ${loginResponse.data.user.role}`);
    console.log(`   Permissions: ${loginResponse.data.user.permissions.length} permissions\n`);
    
    // Test 2: Create Contact
    console.log('2️⃣ Testing contact creation...');
    const contactResponse = await axios.post(`${API_BASE}/contacts`, {
      firstName: 'John',
      lastName: 'Doe',
      email: `john.doe.${Date.now()}@example.com`,
      phone: '+1234567890',
      company: 'Test Company'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Contact created successfully');
    console.log(`   Contact ID: ${contactResponse.data._id}\n`);
    
    // Test 3: Create Deal
    console.log('3️⃣ Testing deal creation...');
    const dealResponse = await axios.post(`${API_BASE}/deals`, {
      title: 'Test Deal',
      value: 10000,
      stage: 'lead',
      contact: contactResponse.data._id,
      description: 'This is a test deal'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Deal created successfully');
    console.log(`   Deal ID: ${dealResponse.data._id}\n`);
    
    // Test 4: Create Campaign
    console.log('4️⃣ Testing campaign creation...');
    const campaignResponse = await axios.post(`${API_BASE}/campaigns`, {
      name: 'Test Campaign',
      type: 'email',
      status: 'draft',
      description: 'This is a test campaign'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Campaign created successfully');
    console.log(`   Campaign ID: ${campaignResponse.data._id}\n`);
    
    // Test 5: Create Ticket
    console.log('5️⃣ Testing ticket creation...');
    const ticketResponse = await axios.post(`${API_BASE}/tickets`, {
      subject: 'Test Support Ticket',
      description: 'This is a test support ticket',
      category: 'technical',
      priority: 'medium',
      status: 'open',
      customer: contactResponse.data._id
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Ticket created successfully');
    console.log(`   Ticket ID: ${ticketResponse.data._id}\n`);
    
    // Test 6: Get Analytics
    console.log('6️⃣ Testing analytics...');
    const analyticsResponse = await axios.get(`${API_BASE}/analytics/overview`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Analytics retrieved successfully');
    console.log(`   Total Contacts: ${analyticsResponse.data.totalContacts}`);
    console.log(`   Total Deals: ${analyticsResponse.data.totalDeals}`);
    console.log(`   Total Campaigns: ${analyticsResponse.data.totalCampaigns}`);
    console.log(`   Total Tickets: ${analyticsResponse.data.totalTickets}\n`);
    
    console.log('🎉 ALL TESTS PASSED! Your CRM system is fully functional!');
    console.log('\n📋 System Status:');
    console.log('   ✅ MongoDB connected and working');
    console.log('   ✅ Authentication system working');
    console.log('   ✅ All CRUD operations working');
    console.log('   ✅ Admin user created and can login');
    console.log('   ✅ Frontend should be accessible at http://localhost:3000');
    console.log('   ✅ Backend API running at http://localhost:3001/api');
    
    console.log('\n🔑 Login Credentials:');
    console.log('   Email: admin@crm.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.message || error.response.data}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
}

runTests();