const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  type: {
    type: String,
    enum: ['email', 'social', 'landing_page', 'drip_sequence', 'nurture'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'paused', 'completed'],
    default: 'draft'
  },
  startDate: Date,
  endDate: Date,
  targetAudience: {
    segments: [String],
    tags: [String],
    customFilters: mongoose.Schema.Types.Mixed
  },
  content: {
    subject: String,
    htmlContent: String,
    textContent: String,
    template: String,
    personalizations: [{
      field: String,
      value: String
    }]
  },
  settings: {
    sendTime: String,
    timezone: String,
    frequency: String,
    abTestEnabled: Boolean,
    abTestVariants: [{
      name: String,
      subject: String,
      content: String,
      percentage: Number
    }]
  },
  metrics: {
    sent: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    },
    opened: {
      type: Number,
      default: 0
    },
    clicked: {
      type: Number,
      default: 0
    },
    bounced: {
      type: Number,
      default: 0
    },
    unsubscribed: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    }
  },
  recipients: [{
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact'
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed'],
      default: 'pending'
    },
    sentAt: Date,
    openedAt: Date,
    clickedAt: Date,
    variant: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [String]
}, {
  timestamps: true
});

// Indexes
campaignSchema.index({ status: 1 });
campaignSchema.index({ type: 1 });
campaignSchema.index({ createdBy: 1 });
campaignSchema.index({ startDate: 1 });

// Calculate performance metrics
campaignSchema.virtual('openRate').get(function() {
  return this.metrics.sent > 0 ? (this.metrics.opened / this.metrics.sent) * 100 : 0;
});

campaignSchema.virtual('clickRate').get(function() {
  return this.metrics.sent > 0 ? (this.metrics.clicked / this.metrics.sent) * 100 : 0;
});

campaignSchema.virtual('conversionRate').get(function() {
  return this.metrics.sent > 0 ? (this.metrics.conversions / this.metrics.sent) * 100 : 0;
});

campaignSchema.virtual('roi').get(function() {
  const cost = this.budget || 0;
  return cost > 0 ? ((this.metrics.revenue - cost) / cost) * 100 : 0;
});

// Ensure virtual fields are serialized
campaignSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Campaign', campaignSchema);