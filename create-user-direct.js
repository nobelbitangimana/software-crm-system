// Simple script to create admin user directly in MongoDB
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple user schema (without pre-save hook to avoid issues)
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  permissions: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createUser() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/crm');
    console.log('✅ Connected!');

    // Delete existing admin user if any
    await User.deleteOne({ email: 'admin@crm.com' });
    console.log('🗑️ Cleared existing admin user');

    // Hash password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    console.log('🔐 Password hashed');

    // Create new admin user
    const admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@crm.com',
      password: hashedPassword, // Already hashed
      role: 'admin',
      permissions: [
        'leads.read', 'leads.write', 'leads.delete',
        'contacts.read', 'contacts.write', 'contacts.delete',
        'companies.read', 'companies.write', 'companies.delete',
        'deals.read', 'deals.write', 'deals.delete',
        'campaigns.read', 'campaigns.write', 'campaigns.delete',
        'tickets.read', 'tickets.write', 'tickets.delete',
        'analytics.read', 'workflows.read', 'workflows.write',
        'users.read', 'users.write', 'users.delete',
        'subscriptions.read', 'subscriptions.write',
        'health_scores.read', 'health_scores.write',
        'renewals.read', 'renewals.write'
      ],
      isActive: true
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@crm.com');
    console.log('🔑 Password: admin123');
    
    await mongoose.disconnect();
    console.log('\n🎉 Done! You can now login to your CRM!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

createUser();