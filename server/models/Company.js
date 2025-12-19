const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  domain: {
    type: String,
    trim: true,
    lowercase: true
  },
  industry: {
    type: String,
    enum: ['SaaS', 'E-commerce', 'Fintech', 'Healthcare', 'Education', 'Enterprise', 'Startup', 'Other']
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  },
  website: String,
  description: String,
  
  // Business details
  annualRevenue: Number,
  fundingStage: {
    type: String,
    enum: ['Bootstrap', 'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'IPO']
  },
  
  // CRM specific
  status: {
    type: String,
    enum: ['prospect', 'customer', 'churned', 'inactive'],
    default: 'prospect'
  },
  
  // Account ownership
  accountExecutive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customerSuccessManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  accountManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Health and engagement
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  healthStatus: {
    type: String,
    enum: ['healthy', 'at-risk', 'critical'],
    default: 'healthy'
  },
  lastEngagement: Date,
  
  // Technical details
  techStack: [String],
  integrationNeeds: [String],
  securityRequirements: [String],
  
  // Address
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Social
  linkedinUrl: String,
  twitterHandle: String,
  
  // Internal notes
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: true
    }
  }],
  
  // Tags for segmentation
  tags: [String],
  
  // Tracking
  source: {
    type: String,
    enum: ['website', 'referral', 'cold_outreach', 'inbound', 'partner', 'event', 'social_media', 'other']
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
companySchema.index({ name: 1 });
companySchema.index({ domain: 1 });
companySchema.index({ status: 1 });
companySchema.index({ healthScore: -1 });
companySchema.index({ accountExecutive: 1 });
companySchema.index({ customerSuccessManager: 1 });

// Virtual for contact count
companySchema.virtual('contactCount', {
  ref: 'Contact',
  localField: '_id',
  foreignField: 'company',
  count: true
});

// Virtual for deal count
companySchema.virtual('dealCount', {
  ref: 'Deal',
  localField: '_id',
  foreignField: 'company',
  count: true
});

// Ensure virtual fields are serialized
companySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Company', companySchema);