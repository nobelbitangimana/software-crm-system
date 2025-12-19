// Simple in-memory database for demo purposes when MongoDB is not available
const { createDemoUsers, demoContacts, demoDeals, demoCampaigns, demoTickets } = require('./demoData');

class DemoDatabase {
  constructor() {
    this.users = [];
    this.contacts = [...demoContacts];
    this.deals = [...demoDeals];
    this.campaigns = [...demoCampaigns];
    this.tickets = [...demoTickets];
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      this.users = await createDemoUsers();
      this.initialized = true;
      console.log('📝 Demo database initialized with sample data');
    }
  }

  // User methods
  async findUserByEmail(email) {
    await this.initialize();
    return this.users.find(user => user.email === email);
  }

  async findUserById(id) {
    await this.initialize();
    return this.users.find(user => user._id === id);
  }

  // Contact methods
  async findContacts(filter = {}, options = {}) {
    await this.initialize();
    let results = [...this.contacts];
    
    // Simple filtering
    if (filter.search) {
      const search = filter.search.toLowerCase();
      results = results.filter(contact => 
        contact.firstName.toLowerCase().includes(search) ||
        contact.lastName.toLowerCase().includes(search) ||
        contact.email.toLowerCase().includes(search) ||
        (contact.company && contact.company.toLowerCase().includes(search))
      );
    }

    if (filter.status) {
      results = results.filter(contact => contact.status === filter.status);
    }

    // Simple pagination
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const skip = (page - 1) * limit;
    
    return {
      contacts: results.slice(skip, skip + limit),
      total: results.length
    };
  }

  async findContactById(id) {
    await this.initialize();
    return this.contacts.find(contact => contact._id === id);
  }

  async createContact(contactData) {
    await this.initialize();
    const newContact = {
      _id: `demo-contact-${Date.now()}`,
      ...contactData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.contacts.push(newContact);
    return newContact;
  }

  async updateContact(id, updateData) {
    await this.initialize();
    const index = this.contacts.findIndex(contact => contact._id === id);
    if (index !== -1) {
      this.contacts[index] = { ...this.contacts[index], ...updateData, updatedAt: new Date() };
      return this.contacts[index];
    }
    return null;
  }

  async deleteContact(id) {
    await this.initialize();
    const index = this.contacts.findIndex(contact => contact._id === id);
    if (index !== -1) {
      this.contacts.splice(index, 1);
      return true;
    }
    return false;
  }

  // Deal methods
  async findDeals(filter = {}, options = {}) {
    await this.initialize();
    let results = [...this.deals];
    
    if (filter.search) {
      const search = filter.search.toLowerCase();
      results = results.filter(deal => 
        deal.title.toLowerCase().includes(search) ||
        (deal.description && deal.description.toLowerCase().includes(search))
      );
    }

    if (filter.stage) {
      results = results.filter(deal => deal.stage === filter.stage);
    }

    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const skip = (page - 1) * limit;
    
    return {
      deals: results.slice(skip, skip + limit),
      total: results.length
    };
  }

  async findDealById(id) {
    await this.initialize();
    return this.deals.find(deal => deal._id === id);
  }

  async createDeal(dealData) {
    await this.initialize();
    const newDeal = {
      _id: `demo-deal-${Date.now()}`,
      ...dealData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.deals.push(newDeal);
    return newDeal;
  }

  async updateDeal(id, updateData) {
    await this.initialize();
    const index = this.deals.findIndex(deal => deal._id === id);
    if (index !== -1) {
      this.deals[index] = { ...this.deals[index], ...updateData, updatedAt: new Date() };
      return this.deals[index];
    }
    return null;
  }

  async deleteDeal(id) {
    await this.initialize();
    const index = this.deals.findIndex(deal => deal._id === id);
    if (index !== -1) {
      this.deals.splice(index, 1);
      return true;
    }
    return false;
  }

  // Campaign methods
  async findCampaigns(filter = {}, options = {}) {
    await this.initialize();
    let results = [...this.campaigns];
    
    if (filter.search) {
      const search = filter.search.toLowerCase();
      results = results.filter(campaign => 
        campaign.name.toLowerCase().includes(search) ||
        (campaign.description && campaign.description.toLowerCase().includes(search))
      );
    }

    if (filter.type) {
      results = results.filter(campaign => campaign.type === filter.type);
    }

    if (filter.status) {
      results = results.filter(campaign => campaign.status === filter.status);
    }

    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const skip = (page - 1) * limit;
    
    return {
      campaigns: results.slice(skip, skip + limit),
      total: results.length
    };
  }

  async findCampaignById(id) {
    await this.initialize();
    return this.campaigns.find(campaign => campaign._id === id);
  }

  async createCampaign(campaignData) {
    await this.initialize();
    const newCampaign = {
      _id: `demo-campaign-${Date.now()}`,
      ...campaignData,
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
        conversions: 0,
        revenue: 0
      },
      recipients: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.campaigns.push(newCampaign);
    return newCampaign;
  }

  async updateCampaign(id, updateData) {
    await this.initialize();
    const index = this.campaigns.findIndex(campaign => campaign._id === id);
    if (index !== -1) {
      this.campaigns[index] = { ...this.campaigns[index], ...updateData, updatedAt: new Date() };
      return this.campaigns[index];
    }
    return null;
  }

  async deleteCampaign(id) {
    await this.initialize();
    const index = this.campaigns.findIndex(campaign => campaign._id === id);
    if (index !== -1) {
      this.campaigns.splice(index, 1);
      return true;
    }
    return false;
  }

  // Ticket methods
  async findTickets(filter = {}, options = {}) {
    await this.initialize();
    let results = [...this.tickets];
    
    if (filter.search) {
      const search = filter.search.toLowerCase();
      results = results.filter(ticket => 
        ticket.subject.toLowerCase().includes(search) ||
        ticket.description.toLowerCase().includes(search) ||
        ticket.ticketNumber.toLowerCase().includes(search)
      );
    }

    if (filter.status) {
      results = results.filter(ticket => ticket.status === filter.status);
    }

    if (filter.priority) {
      results = results.filter(ticket => ticket.priority === filter.priority);
    }

    if (filter.category) {
      results = results.filter(ticket => ticket.category === filter.category);
    }

    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 20;
    const skip = (page - 1) * limit;
    
    return {
      tickets: results.slice(skip, skip + limit),
      total: results.length
    };
  }

  async findTicketById(id) {
    await this.initialize();
    return this.tickets.find(ticket => ticket._id === id);
  }

  async createTicket(ticketData) {
    await this.initialize();
    const count = this.tickets.length;
    const newTicket = {
      _id: `demo-ticket-${Date.now()}`,
      ticketNumber: `TKT-${String(count + 1).padStart(6, '0')}`,
      ...ticketData,
      comments: [],
      attachments: [],
      escalation: { isEscalated: false },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tickets.push(newTicket);
    return newTicket;
  }

  async updateTicket(id, updateData) {
    await this.initialize();
    const index = this.tickets.findIndex(ticket => ticket._id === id);
    if (index !== -1) {
      this.tickets[index] = { ...this.tickets[index], ...updateData, updatedAt: new Date() };
      return this.tickets[index];
    }
    return null;
  }

  async deleteTicket(id) {
    await this.initialize();
    const index = this.tickets.findIndex(ticket => ticket._id === id);
    if (index !== -1) {
      this.tickets.splice(index, 1);
      return true;
    }
    return false;
  }

  // Analytics methods
  async getAnalytics() {
    await this.initialize();
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Calculate metrics
    const totalContacts = this.contacts.length;
    const newContactsThisMonth = this.contacts.filter(c => c.createdAt >= startOfMonth).length;
    
    const totalDeals = this.deals.length;
    const activeDeals = this.deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length;
    const closedWonDeals = this.deals.filter(d => d.stage === 'closed_won').length;
    
    const totalRevenue = this.deals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + d.value, 0);
    const revenueThisMonth = this.deals.filter(d => 
      d.stage === 'closed_won' && d.actualCloseDate && d.actualCloseDate >= startOfMonth
    ).reduce((sum, d) => sum + d.value, 0);
    
    const openTickets = this.tickets.filter(t => ['open', 'in_progress', 'pending'].includes(t.status)).length;
    const resolvedTicketsThisMonth = this.tickets.filter(t => 
      t.status === 'resolved' && t.resolution?.resolvedAt >= startOfMonth
    ).length;
    
    const activeCampaigns = this.campaigns.filter(c => ['active', 'scheduled'].includes(c.status)).length;
    
    return {
      contacts: {
        total: totalContacts,
        newThisMonth: newContactsThisMonth,
        growth: 12 // Mock growth percentage
      },
      deals: {
        total: totalDeals,
        active: activeDeals,
        closedWon: closedWonDeals,
        conversionRate: totalDeals > 0 ? Math.round((closedWonDeals / totalDeals) * 100) : 0
      },
      revenue: {
        total: totalRevenue,
        thisMonth: revenueThisMonth,
        growth: 8 // Mock growth percentage
      },
      tickets: {
        open: openTickets,
        resolvedThisMonth: resolvedTicketsThisMonth
      },
      campaigns: {
        active: activeCampaigns
      }
    };
  }
}

// Export singleton instance
module.exports = new DemoDatabase();