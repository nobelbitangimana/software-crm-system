const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'pending', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['technical', 'billing', 'general', 'feature_request', 'bug_report'],
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  channel: {
    type: String,
    enum: ['email', 'chat', 'phone', 'social', 'web_form'],
    default: 'web_form'
  },
  sla: {
    responseTime: Number, // in hours
    resolutionTime: Number, // in hours
    responseDeadline: Date,
    resolutionDeadline: Date
  },
  tags: [String],
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    content: String,
    isInternal: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolution: {
    solution: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolutionTime: Number // in minutes
  },
  satisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    submittedAt: Date
  },
  escalation: {
    isEscalated: {
      type: Boolean,
      default: false
    },
    escalatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    escalatedAt: Date,
    reason: String
  }
}, {
  timestamps: true
});

// Auto-generate ticket number
ticketSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes
ticketSchema.index({ ticketNumber: 1 }, { unique: true });
ticketSchema.index({ status: 1 });
ticketSchema.index({ priority: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ customer: 1 });
ticketSchema.index({ createdAt: -1 });

// Calculate response time
ticketSchema.virtual('responseTime').get(function() {
  if (this.comments && this.comments.length > 0) {
    const firstResponse = this.comments.find(comment => !comment.isInternal);
    if (firstResponse) {
      return Math.round((firstResponse.createdAt - this.createdAt) / (1000 * 60)); // in minutes
    }
  }
  return null;
});

// Check if SLA is breached
ticketSchema.virtual('slaBreached').get(function() {
  const now = new Date();
  return {
    response: this.sla?.responseDeadline && now > this.sla.responseDeadline,
    resolution: this.sla?.resolutionDeadline && now > this.sla.resolutionDeadline
  };
});

// Ensure virtual fields are serialized
ticketSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Ticket', ticketSchema);