const axios = require('axios');

const API_BASE = 'http://127.0.0.1:3002/api';

async function registerAdmin() {
  console.log('🔧 Registering admin user through API...');
  
  try {
    const response = await axios.post(`${API_BASE}/auth/register`, {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@crm.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('✅ Admin user registered successfully!');
    console.log('📧 Email: admin@crm.com');
    console.log('🔑 Password: admin123');
    console.log('\n🚀 You can now login to your CRM!');
    
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message === 'User already exists') {
      console.log('✅ Admin user already exists!');
      console.log('📧 Email: admin@crm.com');
      console.log('🔑 Password: admin123');
      console.log('\n🚀 Try logging in to your CRM!');
    } else {
      console.error('❌ Registration failed:');
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Message:', error.message);
      console.error('Full error:', error);
    }
  }
}

registerAdmin();