const express = require('express');
const { query, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const Deal = require('../models/Deal');
const Campaign = require('../models/Campaign');
const Ticket = require('../models/Ticket');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get dashboard overview
router.get('/overview', auth, authorize(['analytics.read']), async (req, res) => {
  try {
    let analytics;

    if (require('mongoose').connection.readyState === 1) {
      // Use MongoDB (existing code)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Build base filter for user permissions
      const baseFilter = {};
      if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        baseFilter.$or = [
          { owner: req.user._id },
          { assignedTo: req.user._id },
          { createdBy: req.user._id }
        ];
      }

      // MongoDB aggregation logic here...
      analytics = {
        contacts: { total: 0, newThisMonth: 0, growth: 0 },
        deals: { total: 0, active: 0, closedWon: 0, conversionRate: 0 },
        revenue: { total: 0, thisMonth: 0, growth: 0 },
        tickets: { open: 0, resolvedThisMonth: 0 },
        campaigns: { active: 0 }
      };
    } else {
      // Use demo database
      const demoDatabase = require('../utils/demoDatabase');
      analytics = await demoDatabase.getAnalytics();
    }

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get sales performance data
router.get('/sales-performance', auth, authorize(['analytics.read']), [
  query('period').optional().isIn(['7d', '30d', '90d', '1y']),
  query('groupBy').optional().isIn(['day', 'week', 'month'])
], async (req, res) => {
  try {
    const { period = '30d', groupBy = 'day' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    
    const startDate = new Date(now.getTime() - periodDays[period] * 24 * 60 * 60 * 1000);

    // Build base filter
    const baseFilter = {
      stage: 'closed_won',
      actualCloseDate: { $gte: startDate, $lte: now }
    };

    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      baseFilter.$or = [
        { owner: req.user._id },
        { assignedTo: req.user._id }
      ];
    }

    // Group by format
    const groupFormats = {
      day: { $dateToString: { format: '%Y-%m-%d', date: '$actualCloseDate' } },
      week: { $dateToString: { format: '%Y-W%U', date: '$actualCloseDate' } },
      month: { $dateToString: { format: '%Y-%m', date: '$actualCloseDate' } }
    };

    const salesData = await Deal.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: groupFormats[groupBy],
          revenue: { $sum: '$value' },
          deals: { $sum: 1 },
          avgDealSize: { $avg: '$value' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(salesData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pipeline analytics
router.get('/pipeline', auth, authorize(['analytics.read']), async (req, res) => {
  try {
    const baseFilter = {};
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      baseFilter.$or = [
        { owner: req.user._id },
        { assignedTo: req.user._id }
      ];
    }

    const pipelineData = await Deal.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' },
          weightedValue: { $sum: { $multiply: ['$value', { $divide: ['$probability', 100] }] } },
          avgDealSize: { $avg: '$value' },
          avgProbability: { $avg: '$probability' }
        }
      }
    ]);

    // Calculate conversion rates
    const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
    const stageData = {};
    
    pipelineData.forEach(stage => {
      stageData[stage._id] = stage;
    });

    const conversionRates = {};
    for (let i = 0; i < stageOrder.length - 2; i++) {
      const currentStage = stageOrder[i];
      const nextStage = stageOrder[i + 1];
      
      if (stageData[currentStage] && stageData[nextStage]) {
        conversionRates[`${currentStage}_to_${nextStage}`] = 
          (stageData[nextStage].count / stageData[currentStage].count) * 100;
      }
    }

    res.json({
      stages: pipelineData,
      conversionRates
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get lead source analytics
router.get('/lead-sources', auth, authorize(['analytics.read']), async (req, res) => {
  try {
    const baseFilter = {};
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      baseFilter.$or = [
        { owner: req.user._id },
        { assignedTo: req.user._id }
      ];
    }

    const leadSourceData = await Contact.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: '$leadSource',
          count: { $sum: 1 },
          avgLeadScore: { $avg: '$leadScore' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get conversion rates by lead source
    const conversionData = await Deal.aggregate([
      { $match: baseFilter },
      {
        $lookup: {
          from: 'contacts',
          localField: 'contact',
          foreignField: '_id',
          as: 'contactInfo'
        }
      },
      { $unwind: '$contactInfo' },
      {
        $group: {
          _id: {
            leadSource: '$contactInfo.leadSource',
            stage: '$stage'
          },
          count: { $sum: 1 },
          totalValue: { $sum: '$value' }
        }
      }
    ]);

    res.json({
      leadSources: leadSourceData,
      conversions: conversionData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get campaign performance
router.get('/campaigns', auth, authorize(['analytics.read']), async (req, res) => {
  try {
    const baseFilter = {};
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      baseFilter.createdBy = req.user._id;
    }

    const campaigns = await Campaign.find(baseFilter)
      .select('name type status metrics openRate clickRate conversionRate roi')
      .lean();

    // Calculate aggregate metrics
    const totalMetrics = campaigns.reduce((acc, campaign) => {
      acc.sent += campaign.metrics.sent || 0;
      acc.delivered += campaign.metrics.delivered || 0;
      acc.opened += campaign.metrics.opened || 0;
      acc.clicked += campaign.metrics.clicked || 0;
      acc.conversions += campaign.metrics.conversions || 0;
      acc.revenue += campaign.metrics.revenue || 0;
      return acc;
    }, { sent: 0, delivered: 0, opened: 0, clicked: 0, conversions: 0, revenue: 0 });

    const aggregateRates = {
      deliveryRate: totalMetrics.sent > 0 ? (totalMetrics.delivered / totalMetrics.sent) * 100 : 0,
      openRate: totalMetrics.sent > 0 ? (totalMetrics.opened / totalMetrics.sent) * 100 : 0,
      clickRate: totalMetrics.sent > 0 ? (totalMetrics.clicked / totalMetrics.sent) * 100 : 0,
      conversionRate: totalMetrics.sent > 0 ? (totalMetrics.conversions / totalMetrics.sent) * 100 : 0
    };

    res.json({
      campaigns,
      totalMetrics,
      aggregateRates
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get support metrics
router.get('/support', auth, authorize(['analytics.read']), async (req, res) => {
  try {
    const baseFilter = {};
    if (req.user.role === 'support') {
      baseFilter.$or = [
        { assignedTo: req.user._id },
        { createdBy: req.user._id }
      ];
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalTickets,
      openTickets,
      resolvedTickets,
      avgResolutionTime,
      ticketsByPriority,
      ticketsByCategory,
      slaBreaches
    ] = await Promise.all([
      Ticket.countDocuments(baseFilter),
      Ticket.countDocuments({ ...baseFilter, status: { $in: ['open', 'in_progress', 'pending'] } }),
      Ticket.countDocuments({ ...baseFilter, status: 'resolved' }),
      Ticket.aggregate([
        { $match: { ...baseFilter, status: 'resolved', 'resolution.resolutionTime': { $exists: true } } },
        { $group: { _id: null, avgTime: { $avg: '$resolution.resolutionTime' } } }
      ]),
      Ticket.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Ticket.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Ticket.countDocuments({
        ...baseFilter,
        $or: [
          { 'sla.responseDeadline': { $lt: now } },
          { 'sla.resolutionDeadline': { $lt: now } }
        ]
      })
    ]);

    res.json({
      overview: {
        total: totalTickets,
        open: openTickets,
        resolved: resolvedTickets,
        avgResolutionTime: avgResolutionTime[0]?.avgTime || 0,
        slaBreaches
      },
      distribution: {
        byPriority: ticketsByPriority,
        byCategory: ticketsByCategory
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;