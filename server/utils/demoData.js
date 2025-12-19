// Demo data for when MongoDB is not available
const bcrypt = require('bcryptjs');

// Hash passwords for demo users
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const createDemoUsers = async () => {
  return [
    {
      _id: 'demo-admin-id',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@crm.com',
      password: await hashPassword('admin123'),
      role: 'admin',
      permissions: [
        'contacts.read', 'contacts.write', 'contacts.delete',
        'deals.read', 'deals.write', 'deals.delete',
        'campaigns.read', 'campaigns.write', 'campaigns.delete',
        'tickets.read', 'tickets.write', 'tickets.delete',
        'analytics.read', 'workflows.read', 'workflows.write',
        'users.read', 'users.write', 'users.delete'
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'demo-sales-id',
      firstName: 'Sales',
      lastName: 'User',
      email: 'sales@crm.com',
      password: await hashPassword('sales123'),
      role: 'sales',
      permissions: [
        'contacts.read', 'contacts.write',
        'deals.read', 'deals.write',
        'analytics.read'
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
};

const demoContacts = [
  {
    _id: 'demo-contact-1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '+1-555-0123',
    company: 'Tech Corp',
    position: 'CEO',
    status: 'customer',
    leadScore: 85,
    leadSource: 'website',
    tags: ['VIP', 'Decision Maker'],
    owner: 'demo-admin-id',
    assignedTo: 'demo-sales-id',
    address: {
      street: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    socialProfiles: {
      linkedin: 'https://linkedin.com/in/johnsmith',
      twitter: 'https://twitter.com/johnsmith'
    },
    notes: [
      {
        content: 'Initial contact made through website inquiry',
        createdBy: 'demo-admin-id',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ],
    activities: [
      {
        type: 'call',
        subject: 'Discovery call',
        description: 'Discussed requirements and budget',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        createdBy: 'demo-sales-id',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    _id: 'demo-contact-2',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: '+1-555-0124',
    company: 'Innovation Inc',
    position: 'CTO',
    status: 'prospect',
    leadScore: 72,
    leadSource: 'referral',
    tags: ['Hot Lead'],
    owner: 'demo-admin-id',
    assignedTo: 'demo-sales-id',
    address: {
      street: '456 Innovation Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    socialProfiles: {
      linkedin: 'https://linkedin.com/in/janedoe'
    },
    notes: [],
    activities: [],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    _id: 'demo-contact-3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@startup.com',
    phone: '+1-555-0125',
    company: 'StartupXYZ',
    position: 'Founder',
    status: 'lead',
    leadScore: 45,
    leadSource: 'social_media',
    tags: ['Startup', 'Early Stage'],
    owner: 'demo-admin-id',
    assignedTo: 'demo-sales-id',
    address: {
      street: '789 Startup Blvd',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      country: 'USA'
    },
    socialProfiles: {},
    notes: [],
    activities: [],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  }
];

const demoDeals = [
  {
    _id: 'demo-deal-1',
    title: 'Tech Corp - Enterprise License',
    description: 'Annual enterprise software license',
    value: 50000,
    currency: 'USD',
    stage: 'negotiation',
    probability: 80,
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    contact: 'demo-contact-1',
    company: 'Tech Corp',
    assignedTo: 'demo-sales-id',
    owner: 'demo-admin-id',
    source: 'inbound',
    tags: ['Enterprise', 'High Value'],
    activities: [
      {
        type: 'demo',
        subject: 'Product demonstration',
        description: 'Showed enterprise features',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdBy: 'demo-sales-id',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ],
    tasks: [
      {
        title: 'Prepare contract',
        description: 'Draft enterprise license agreement',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        completed: false,
        assignedTo: 'demo-sales-id',
        createdBy: 'demo-admin-id',
        createdAt: new Date()
      }
    ],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    _id: 'demo-deal-2',
    title: 'Innovation Inc - Consulting Services',
    description: 'Digital transformation consulting',
    value: 25000,
    currency: 'USD',
    stage: 'proposal',
    probability: 60,
    expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    contact: 'demo-contact-2',
    company: 'Innovation Inc',
    assignedTo: 'demo-sales-id',
    owner: 'demo-admin-id',
    source: 'referral',
    tags: ['Consulting'],
    activities: [],
    tasks: [],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    _id: 'demo-deal-3',
    title: 'StartupXYZ - Basic Package',
    description: 'Starter package for small business',
    value: 5000,
    currency: 'USD',
    stage: 'qualified',
    probability: 40,
    expectedCloseDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    contact: 'demo-contact-3',
    company: 'StartupXYZ',
    assignedTo: 'demo-sales-id',
    owner: 'demo-admin-id',
    source: 'marketing',
    tags: ['Small Business'],
    activities: [],
    tasks: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  }
];

const demoCampaigns = [
  {
    _id: 'demo-campaign-1',
    name: 'Summer Product Launch',
    description: 'Email campaign for new product launch',
    type: 'email',
    status: 'active',
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    targetAudience: {
      segments: ['customers', 'prospects'],
      tags: ['VIP', 'Hot Lead'],
      customFilters: {}
    },
    content: {
      subject: 'Introducing Our Revolutionary New Product!',
      htmlContent: '<h1>New Product Launch</h1><p>We are excited to announce...</p>',
      textContent: 'New Product Launch - We are excited to announce...',
      template: 'product-launch'
    },
    settings: {
      sendTime: '09:00',
      timezone: 'America/New_York',
      frequency: 'once',
      abTestEnabled: false
    },
    metrics: {
      sent: 1500,
      delivered: 1485,
      opened: 742,
      clicked: 148,
      bounced: 15,
      unsubscribed: 8,
      conversions: 23,
      revenue: 115000
    },
    recipients: [],
    createdBy: 'demo-admin-id',
    tags: ['Product Launch', 'Email'],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    _id: 'demo-campaign-2',
    name: 'Customer Retention Campaign',
    description: 'Nurture existing customers',
    type: 'nurture',
    status: 'completed',
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    targetAudience: {
      segments: ['customers'],
      tags: ['VIP'],
      customFilters: {}
    },
    content: {
      subject: 'Thank you for being a valued customer',
      htmlContent: '<h1>Thank You</h1><p>Your loyalty means everything to us...</p>',
      textContent: 'Thank You - Your loyalty means everything to us...',
      template: 'customer-retention'
    },
    settings: {
      sendTime: '10:00',
      timezone: 'America/New_York',
      frequency: 'weekly',
      abTestEnabled: true
    },
    metrics: {
      sent: 800,
      delivered: 795,
      opened: 556,
      clicked: 167,
      bounced: 5,
      unsubscribed: 3,
      conversions: 45,
      revenue: 67500
    },
    recipients: [],
    createdBy: 'demo-admin-id',
    tags: ['Retention', 'Customer Care'],
    createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  }
];

const demoTickets = [
  {
    _id: 'demo-ticket-1',
    ticketNumber: 'TKT-000001',
    subject: 'Login Issues with New Account',
    description: 'Customer unable to login after account creation. Getting "invalid credentials" error.',
    status: 'in_progress',
    priority: 'high',
    category: 'technical',
    customer: 'demo-contact-1',
    assignedTo: 'demo-admin-id',
    createdBy: 'demo-admin-id',
    channel: 'email',
    sla: {
      responseTime: 4,
      resolutionTime: 24,
      responseDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000),
      resolutionDeadline: new Date(Date.now() + 20 * 60 * 60 * 1000)
    },
    tags: ['login', 'authentication'],
    attachments: [],
    comments: [
      {
        content: 'I have investigated the issue and found that the account was not properly activated.',
        isInternal: true,
        createdBy: 'demo-admin-id',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        content: 'Account has been manually activated. Please try logging in again.',
        isInternal: false,
        createdBy: 'demo-admin-id',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ],
    escalation: {
      isEscalated: false
    },
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    _id: 'demo-ticket-2',
    ticketNumber: 'TKT-000002',
    subject: 'Feature Request: Dark Mode',
    description: 'Would like to request a dark mode option for the application interface.',
    status: 'open',
    priority: 'low',
    category: 'feature_request',
    customer: 'demo-contact-2',
    assignedTo: 'demo-admin-id',
    createdBy: 'demo-admin-id',
    channel: 'web_form',
    sla: {
      responseTime: 24,
      resolutionTime: 72,
      responseDeadline: new Date(Date.now() + 18 * 60 * 60 * 1000),
      resolutionDeadline: new Date(Date.now() + 66 * 60 * 60 * 1000)
    },
    tags: ['feature', 'ui'],
    attachments: [],
    comments: [
      {
        content: 'Thank you for the suggestion. We will consider this for our next major release.',
        isInternal: false,
        createdBy: 'demo-admin-id',
        createdAt: new Date(Date.now() - 30 * 60 * 1000)
      }
    ],
    escalation: {
      isEscalated: false
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    _id: 'demo-ticket-3',
    ticketNumber: 'TKT-000003',
    subject: 'Billing Question - Invoice #12345',
    description: 'Question about charges on invoice #12345. Need clarification on additional fees.',
    status: 'resolved',
    priority: 'medium',
    category: 'billing',
    customer: 'demo-contact-3',
    assignedTo: 'demo-admin-id',
    createdBy: 'demo-admin-id',
    channel: 'phone',
    sla: {
      responseTime: 8,
      resolutionTime: 48,
      responseDeadline: new Date(Date.now() - 16 * 60 * 60 * 1000),
      resolutionDeadline: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    tags: ['billing', 'invoice'],
    attachments: [],
    comments: [
      {
        content: 'The additional fees are for premium support services as outlined in your contract.',
        isInternal: false,
        createdBy: 'demo-admin-id',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      }
    ],
    resolution: {
      solution: 'Explained billing structure and provided detailed breakdown of charges.',
      resolvedBy: 'demo-admin-id',
      resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      resolutionTime: 120
    },
    satisfaction: {
      rating: 5,
      feedback: 'Very helpful explanation, thank you!',
      submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    escalation: {
      isEscalated: false
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
  }
];

module.exports = {
  createDemoUsers,
  demoContacts,
  demoDeals,
  demoCampaigns,
  demoTickets
};