const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  value: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  stage: {
    type: String,
    enum: ['lead', 'demo_scheduled', 'demo_completed', 'trial', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
    default: 'lead'
  },
  probability: {
    type: Number,
    min: 0,
    max: 100,
    default: 10
  },
  expectedCloseDate: Date,
  actualCloseDate: Date,
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  source: {
    type: String,
    enum: ['inbound', 'outbound', 'referral', 'partner', 'marketing'],
    default: 'inbound'
  },
  // Software-specific fields
  dealType: {
    type: String,
    enum: ['new_business', 'expansion', 'renewal', 'upsell'],
    default: 'new_business'
  },
  contractType: {
    type: String,
    enum: ['monthly', 'annual', 'multi_year'],
    default: 'annual'
  },
  arr: Number, // Annual Recurring Revenue
  mrr: Number, // Monthly Recurring Revenue
  contractLength: Number, // in months
  seats: Number, // number of user seats
  
  // Product details
  products: [{
    name: String,
    plan: {
      type: String,
      enum: ['starter', 'professional', 'enterprise', 'custom']
    },
    seats: Number,
    monthlyPrice: Number,
    annualPrice: Number,
    features: [String]
  }],
  
  // Technical requirements
  technicalRequirements: [String],
  integrationNeeds: [String],
  securityRequirements: [String],
  
  // Trial information
  trialStartDate: Date,
  trialEndDate: Date,
  trialStatus: {
    type: String,
    enum: ['not_started', 'active', 'expired', 'converted']
  },
  competitors: [String],
  lossReason: {
    type: String,
    enum: ['price', 'competitor', 'timing', 'budget', 'no_decision', 'other']
  },
  winReason: {
    type: String,
    enum: ['price', 'features', 'relationship', 'timing', 'other']
  },
  tags: [String],
  customFields: [{
    name: String,
    value: mongoose.Schema.Types.Mixed,
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'boolean', 'select']
    }
  }],
  activities: [{
    type: {
      type: String,
      enum: ['call', 'email', 'meeting', 'proposal', 'demo', 'negotiation']
    },
    subject: String,
    description: String,
    date: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tasks: [{
    title: String,
    description: String,
    dueDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
dealSchema.index({ stage: 1 });
dealSchema.index({ assignedTo: 1 });
dealSchema.index({ owner: 1 });
dealSchema.index({ expectedCloseDate: 1 });
dealSchema.index({ value: -1 });

// Calculate weighted value
dealSchema.virtual('weightedValue').get(function() {
  return (this.value * this.probability) / 100;
});

// Ensure virtual fields are serialized
dealSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Deal', dealSchema);