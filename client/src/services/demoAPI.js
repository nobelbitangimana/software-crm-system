// Demo API with full CRM functionality
// This provides all CRM features without needing a backend

let demoData = {
  contacts: [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      company: 'Tech Corp',
      position: 'CTO',
      status: 'active',
      source: 'website',
      tags: ['enterprise', 'decision-maker'],
      createdAt: new Date('2024-01-15').toISOString(),
      updatedAt: new Date('2024-01-15').toISOString()
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@startup.com',
      phone: '+1-555-0124',
      company: 'StartupCo',
      position: 'CEO',
      status: 'active',
      source: 'referral',
      tags: ['startup', 'hot-lead'],
      createdAt: new Date('2024-01-16').toISOString(),
      updatedAt: new Date('2024-01-16').toISOString()
    }
  ],
  companies: [
    {
      id: '1',
      name: 'Tech Corp',
      industry: 'Technology',
      size: '500-1000',
      website: 'https://techcorp.com',
      phone: '+1-555-0100',
      email: 'contact@techcorp.com',
      address: '123 Tech Street, Silicon Valley, CA',
      techStack: ['React', 'Node.js', 'MongoDB'],
      status: 'active',
      createdAt: new Date('2024-01-10').toISOString()
    },
    {
      id: '2',
      name: 'StartupCo',
      industry: 'SaaS',
      size: '10-50',
      website: 'https://startupco.com',
      phone: '+1-555-0101',
      email: 'hello@startupco.com',
      address: '456 Innovation Ave, Austin, TX',
      techStack: ['Vue.js', 'Python', 'PostgreSQL'],
      status: 'prospect',
      createdAt: new Date('2024-01-12').toISOString()
    }
  ],
  deals: [
    {
      id: '1',
      title: 'Enterprise Software License',
      company: 'Tech Corp',
      contact: 'John Doe',
      value: 50000,
      stage: 'proposal',
      probability: 75,
      expectedCloseDate: '2024-03-15',
      arr: 50000,
      mrr: 4167,
      dealType: 'new-business',
      status: 'active',
      createdAt: new Date('2024-01-20').toISOString()
    },
    {
      id: '2',
      title: 'Startup Package',
      company: 'StartupCo',
      contact: 'Jane Smith',
      value: 12000,
      stage: 'negotiation',
      probability: 60,
      expectedCloseDate: '2024-02-28',
      arr: 12000,
      mrr: 1000,
      dealType: 'new-business',
      status: 'active',
      createdAt: new Date('2024-01-22').toISOString()
    }
  ],
  campaigns: [
    {
      id: '1',
      name: 'Q1 Product Launch',
      type: 'email',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-03-31',
      budget: 10000,
      spent: 3500,
      impressions: 50000,
      clicks: 2500,
      conversions: 125,
      createdAt: new Date('2024-01-01').toISOString()
    },
    {
      id: '2',
      name: 'Enterprise Outreach',
      type: 'linkedin',
      status: 'active',
      startDate: '2024-02-01',
      endDate: '2024-04-30',
      budget: 15000,
      spent: 5000,
      impressions: 25000,
      clicks: 1250,
      conversions: 75,
      createdAt: new Date('2024-02-01').toISOString()
    }
  ],
  tickets: [
    {
      id: '1',
      title: 'Login Issue',
      description: 'User cannot access dashboard',
      priority: 'high',
      status: 'open',
      assignee: 'Support Team',
      customer: 'John Doe',
      company: 'Tech Corp',
      category: 'technical',
      createdAt: new Date('2024-01-25').toISOString(),
      updatedAt: new Date('2024-01-25').toISOString()
    },
    {
      id: '2',
      title: 'Feature Request',
      description: 'Request for API integration',
      priority: 'medium',
      status: 'in-progress',
      assignee: 'Product Team',
      customer: 'Jane Smith',
      company: 'StartupCo',
      category: 'feature-request',
      createdAt: new Date('2024-01-26').toISOString(),
      updatedAt: new Date('2024-01-26').toISOString()
    }
  ],
  users: [
    {
      id: '1',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@crm.com',
      role: 'admin',
      department: 'Management',
      isActive: true,
      createdAt: new Date('2024-01-01').toISOString()
    },
    {
      id: '2',
      firstName: 'Sales',
      lastName: 'Rep',
      email: 'sales@crm.com',
      role: 'sales',
      department: 'Sales',
      isActive: true,
      createdAt: new Date('2024-01-01').toISOString()
    }
  ]
};

// Helper function to generate ID
const generateId = () => Date.now().toString();

// Helper function to simulate API delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Demo API functions
export const demoAPI = {
  // Contacts
  contacts: {
    getAll: async () => {
      await delay();
      return { data: demoData.contacts };
    },
    
    getById: async (id) => {
      await delay();
      const contact = demoData.contacts.find(c => c.id === id);
      if (!contact) throw new Error('Contact not found');
      return { data: contact };
    },
    
    create: async (contactData) => {
      await delay();
      const newContact = {
        ...contactData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      demoData.contacts.push(newContact);
      return { data: newContact };
    },
    
    update: async (id, contactData) => {
      await delay();
      const index = demoData.contacts.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Contact not found');
      
      demoData.contacts[index] = {
        ...demoData.contacts[index],
        ...contactData,
        updatedAt: new Date().toISOString()
      };
      return { data: demoData.contacts[index] };
    },
    
    delete: async (id) => {
      await delay();
      const index = demoData.contacts.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Contact not found');
      
      demoData.contacts.splice(index, 1);
      return { message: 'Contact deleted successfully' };
    }
  },

  // Companies
  companies: {
    getAll: async () => {
      await delay();
      return { data: demoData.companies };
    },
    
    getById: async (id) => {
      await delay();
      const company = demoData.companies.find(c => c.id === id);
      if (!company) throw new Error('Company not found');
      return { data: company };
    },
    
    create: async (companyData) => {
      await delay();
      const newCompany = {
        ...companyData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      demoData.companies.push(newCompany);
      return { data: newCompany };
    },
    
    update: async (id, companyData) => {
      await delay();
      const index = demoData.companies.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Company not found');
      
      demoData.companies[index] = {
        ...demoData.companies[index],
        ...companyData,
        updatedAt: new Date().toISOString()
      };
      return { data: demoData.companies[index] };
    },
    
    delete: async (id) => {
      await delay();
      const index = demoData.companies.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Company not found');
      
      demoData.companies.splice(index, 1);
      return { message: 'Company deleted successfully' };
    }
  },

  // Deals
  deals: {
    getAll: async () => {
      await delay();
      return { data: demoData.deals };
    },
    
    getById: async (id) => {
      await delay();
      const deal = demoData.deals.find(d => d.id === id);
      if (!deal) throw new Error('Deal not found');
      return { data: deal };
    },
    
    create: async (dealData) => {
      await delay();
      const newDeal = {
        ...dealData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      demoData.deals.push(newDeal);
      return { data: newDeal };
    },
    
    update: async (id, dealData) => {
      await delay();
      const index = demoData.deals.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Deal not found');
      
      demoData.deals[index] = {
        ...demoData.deals[index],
        ...dealData,
        updatedAt: new Date().toISOString()
      };
      return { data: demoData.deals[index] };
    },
    
    delete: async (id) => {
      await delay();
      const index = demoData.deals.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Deal not found');
      
      demoData.deals.splice(index, 1);
      return { message: 'Deal deleted successfully' };
    }
  },

  // Campaigns
  campaigns: {
    getAll: async () => {
      await delay();
      return { data: demoData.campaigns };
    },
    
    getById: async (id) => {
      await delay();
      const campaign = demoData.campaigns.find(c => c.id === id);
      if (!campaign) throw new Error('Campaign not found');
      return { data: campaign };
    },
    
    create: async (campaignData) => {
      await delay();
      const newCampaign = {
        ...campaignData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      demoData.campaigns.push(newCampaign);
      return { data: newCampaign };
    },
    
    update: async (id, campaignData) => {
      await delay();
      const index = demoData.campaigns.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Campaign not found');
      
      demoData.campaigns[index] = {
        ...demoData.campaigns[index],
        ...campaignData,
        updatedAt: new Date().toISOString()
      };
      return { data: demoData.campaigns[index] };
    },
    
    delete: async (id) => {
      await delay();
      const index = demoData.campaigns.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Campaign not found');
      
      demoData.campaigns.splice(index, 1);
      return { message: 'Campaign deleted successfully' };
    }
  },

  // Tickets
  tickets: {
    getAll: async () => {
      await delay();
      return { data: demoData.tickets };
    },
    
    getById: async (id) => {
      await delay();
      const ticket = demoData.tickets.find(t => t.id === id);
      if (!ticket) throw new Error('Ticket not found');
      return { data: ticket };
    },
    
    create: async (ticketData) => {
      await delay();
      const newTicket = {
        ...ticketData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      demoData.tickets.push(newTicket);
      return { data: newTicket };
    },
    
    update: async (id, ticketData) => {
      await delay();
      const index = demoData.tickets.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Ticket not found');
      
      demoData.tickets[index] = {
        ...demoData.tickets[index],
        ...ticketData,
        updatedAt: new Date().toISOString()
      };
      return { data: demoData.tickets[index] };
    },
    
    delete: async (id) => {
      await delay();
      const index = demoData.tickets.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Ticket not found');
      
      demoData.tickets.splice(index, 1);
      return { message: 'Ticket deleted successfully' };
    }
  },

  // Users
  users: {
    getAll: async () => {
      await delay();
      return { data: demoData.users };
    },
    
    getById: async (id) => {
      await delay();
      const user = demoData.users.find(u => u.id === id);
      if (!user) throw new Error('User not found');
      return { data: user };
    },
    
    create: async (userData) => {
      await delay();
      const newUser = {
        ...userData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      demoData.users.push(newUser);
      return { data: newUser };
    },
    
    update: async (id, userData) => {
      await delay();
      const index = demoData.users.findIndex(u => u.id === id);
      if (index === -1) throw new Error('User not found');
      
      demoData.users[index] = {
        ...demoData.users[index],
        ...userData,
        updatedAt: new Date().toISOString()
      };
      return { data: demoData.users[index] };
    },
    
    delete: async (id) => {
      await delay();
      const index = demoData.users.findIndex(u => u.id === id);
      if (index === -1) throw new Error('User not found');
      
      demoData.users.splice(index, 1);
      return { message: 'User deleted successfully' };
    }
  },

  // Analytics
  analytics: {
    getDashboard: async () => {
      await delay();
      return {
        data: {
          totalContacts: demoData.contacts.length,
          totalCompanies: demoData.companies.length,
          totalDeals: demoData.deals.length,
          totalRevenue: demoData.deals.reduce((sum, deal) => sum + deal.value, 0),
          activeTickets: demoData.tickets.filter(t => t.status === 'open').length,
          activeCampaigns: demoData.campaigns.filter(c => c.status === 'active').length,
          conversionRate: 15.5,
          avgDealSize: demoData.deals.reduce((sum, deal) => sum + deal.value, 0) / demoData.deals.length
        }
      };
    }
  }
};