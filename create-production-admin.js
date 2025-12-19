// Script to create admin user in production MongoDB
// Run this after deploying to production

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// IMPORTANT: Replace with your MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://bitangimanaalainnobel_db_user:wnwPf2wbfep96edr@cluster0.lifsbo1.mongodb.net/crm?retryWrites=true&w=majority&appName=Cluster0';

// Admin user details - CHANGE THESE!
const adminData = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@crm.com',
  password: 'admin123', // Simple password for now
  role: 'admin',
  department: 'Management',
  isActive: true
};

// User Schema (simplified)
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  permissions: [String],
  department: String,
  territory: String,
  phone: String,
  quota: Number,
  commissionRate: Number,
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: Boolean,
  lastLogin: Date,
  refreshToken: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', adminData.email);
      console.log('If you want to reset the password, delete the user first.\n');
      await mongoose.connection.close();
      return;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Admin permissions
    const adminPermissions = [
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
    ];

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = new User({
      ...adminData,
      password: hashedPassword,
      permissions: adminPermissions
    });

    await admin.save();

    console.log('\n✅ Admin user created successfully!\n');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('🎭 Role:', adminData.role);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run the script
createAdminUser();
