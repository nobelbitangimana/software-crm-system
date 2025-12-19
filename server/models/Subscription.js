const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  // Subscription details
  status: {
    type: String,
    enum: ['trial', 'active', 'past_due', 'cancelled', 'expired'],
    default: 'trial'
  },
  
  plan: {
    type: String,
    enum: ['starter', 'professional', 'enterprise', 'custom'],
    required: true
  },
  
  // Financial
  mrr: {
    type: Number,
    required: true
  },
  arr: {
    type: Number,
    required: true
  },
  
  billingCycle: {
    type: String,
    enum: ['monthly', 'annual', 'multi_year'],
    default: 'annual'
  },
  
  seats: {
    type: Number,
    default: 1
  },
  
  // Dates
  startDate: {
    type: Date,
    required: true
  },
  trialEndDate: Date,
  renewalDate: Date,
  cancellationDate: Date,
  
  // Health metrics
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  
  churnRisk: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  
  // Usage metrics
  lastLoginDate: Date,
  activeUsers: Number,
  featureAdoption: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Product usage
  productsUsed: [String],
  integrationsActive: [String],
  
  // Ownership
  customerSuccessManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  accountManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Renewal tracking
  renewalProbability: {
    type: Number,
    min: 0,
    max: 100
  },
  
  expansionOpportunity: {
    type: Boolean,
    default: false
  },
  
  expansionValue: Number,
  
  // Notes
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Contract details
  contractUrl: String,
  paymentMethod: String,
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
subscriptionSchema.index({ company: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ renewalDate: 1 });
subscriptionSchema.index({ healthScore: -1 });
subscriptionSchema.index({ customerSuccessManager: 1 });

// Calculate days until renewal
subscriptionSchema.virtual('daysUntilRenewal').get(function() {
  if (!this.renewalDate) return null;
  const now = new Date();
  const diff = this.renewalDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
subscriptionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);