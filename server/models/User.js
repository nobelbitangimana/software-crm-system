const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'sdr', 'ae', 'csm', 'account_manager', 'support_engineer', 'product', 'marketing', 'executive'],
    default: 'sdr'
  },
  permissions: [{
    type: String,
    enum: [
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
    ]
  }],
  avatar: String,
  phone: String,
  department: String,
  territory: String,
  quota: Number, // Monthly/quarterly sales quota
  commissionRate: Number, // Commission percentage
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  refreshToken: String
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.refreshToken;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);