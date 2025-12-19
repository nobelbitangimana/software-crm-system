const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import your models
const User = require('./server/models/User');
const Contact = require('./server/models/Contact');
const Deal = require('./server/models/Deal');
const Campaign = require('./server/models/Campaign');
const Ticket = require('./server/models/Ticket');

// Import demo data
const { createDemoUsers, demoContacts, demoDeals, demoCampaigns, demoTickets } = require('./server/utils/demoData');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm';

async function setupMongoDB() {
  console.log('🍃 MongoDB Setup and Migration Tool\n');

  try {
    // Test MongoDB connection
    console.log('1️⃣ Testing MongoDB connection...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
    console.log(`📍 Connected to: ${MONGODB_URI}\n`);

    // Check if database is empty
    const userCount = await User.countDocuments();
    const contactCount = await Contact.countDocuments();
    
    console.log(`📊 Current database status:`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Contacts: ${contactCount}`);

    if (userCount === 0) {
      console.log('\n2️⃣ Database is empty. Setting up initial data...');
      
      // Create demo users
      console.log('   Creating demo users...');
      const demoUsers = await createDemoUsers();
      
      for (const userData of demoUsers) {
        const existingUser = await User.findOne({ email: userData.email });
        if (!existingUser) {
          const user = new User(userData);
          await user.save();
          console.log(`   ✅ Created user: ${userData.email}`);
        }
      }

      // Ask if user wants to migrate demo data
      console.log('\n3️⃣ Would you like to migrate demo data to MongoDB?');
      console.log('   This will add sample contacts, deals, campaigns, and tickets.');
      console.log('   You can skip this and start with a clean database.\n');
      
      // For now, let's add the demo data automatically
      console.log('   Adding demo data...');
      
      // Add contacts
      for (const contactData of demoContacts) {
        const contact = new Contact(contactData);
        await contact.save();
      }
      console.log(`   ✅ Added ${demoContacts.length} demo contacts`);

      // Add deals
      for (const dealData of demoDeals) {
        const deal = new Deal(dealData);
        await deal.save();
      }
      console.log(`   ✅ Added ${demoDeals.length} demo deals`);

      // Add campaigns
      for (const campaignData of demoCampaigns) {
        const campaign = new Campaign(campaignData);
        await campaign.save();
      }
      console.log(`   ✅ Added ${demoCampaigns.length} demo campaigns`);

      // Add tickets
      for (const ticketData of demoTickets) {
        const ticket = new Ticket(ticketData);
        await ticket.save();
      }
      console.log(`   ✅ Added ${demoTickets.length} demo tickets`);

      console.log('\n🎉 MongoDB setup completed successfully!');
      console.log('\n📋 Demo Credentials:');
      console.log('   Admin: admin@crm.com / admin123');
      console.log('   Sales: sales@crm.com / sales123');
      
    } else {
      console.log('\n✅ Database already has data. No migration needed.');
    }

    console.log('\n🚀 Your CRM is ready to use with MongoDB!');
    console.log('   Restart your server to connect to MongoDB instead of demo mode.');

  } catch (error) {
    console.error('\n❌ MongoDB setup failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Make sure MongoDB is installed and running');
      console.log('   2. Check if MongoDB service is started');
      console.log('   3. Verify MongoDB is listening on port 27017');
      console.log('   4. Try: mongosh --eval "db.adminCommand(\'ismaster\')"');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run the setup
setupMongoDB();