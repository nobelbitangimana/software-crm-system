// Test ticket creation specifically
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testTicket() {
  try {
    // Login first
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@crm.com',
      password: 'admin123'
    });
    
    const authToken = loginResponse.data.accessToken;
    console.log('✅ Login successful');
    
    // Create a contact first
    const contactResponse = await axios.post(`${API_BASE}/contacts`, {
      firstName: 'Test',
      lastName: 'Customer',
      email: `test.customer.${Date.now()}@example.com`,
      phone: '+1234567890',
      company: 'Test Company'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Contact created:', contactResponse.data._id);
    
    // Now try to create a ticket
    console.log('🎫 Creating ticket...');
    const ticketResponse = await axios.post(`${API_BASE}/tickets`, {
      subject: 'Test Support Ticket',
      description: 'This is a test support ticket',
      category: 'technical',
      priority: 'medium',
      customer: contactResponse.data._id
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Ticket created successfully:', ticketResponse.data._id);
    
  } catch (error) {
    console.error('❌ Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testTicket();