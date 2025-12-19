const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
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
    lowercase: true,
    trim: true
  },
  phone: String,
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  position: String,
  jobTitle: String,
  department: {
    type: String,
    enum: ['Engineering', 'Product', 'Sales', 'Marketing', 'Customer Success', 'Finance', 'HR', 'Operations', 'Executive', 'Other']
  },
  seniority: {
    type: String,
    enum: ['Individual Contributor', 'Manager', 'Director', 'VP', 'C-Level', 'Founder']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  socialProfiles: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  },
  leadSource: {
    type: String,
    enum: ['website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'trade_show', 'other'],
    default: 'website'
  },
  leadScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['lead', 'prospect', 'customer', 'inactive'],
    default: 'lead'
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
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastContactDate: Date,
  nextFollowUp: Date,
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
  activities: [{
    type: {
      type: String,
      enum: ['call', 'email', 'meeting', 'note', 'task']
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
  }]
}, {
  timestamps: true
});

// Indexes for better performance
contactSchema.index({ email: 1 });
contactSchema.index({ company: 1 });
contactSchema.index({ assignedTo: 1 });
contactSchema.index({ owner: 1 });
contactSchema.index({ leadScore: -1 });
contactSchema.index({ tags: 1 });

// Virtual for full name
contactSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
contactSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Contact', contactSchema);