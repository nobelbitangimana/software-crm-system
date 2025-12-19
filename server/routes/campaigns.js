const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Campaign = require('../models/Campaign');
const Contact = require('../models/Contact');
const { auth, authorize } = require('../middleware/auth');
const demoDatabase = require('../utils/demoDatabase');

const router = express.Router();

// Check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Get all campaigns
router.get('/', auth, authorize(['campaigns.read']), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('type').optional().isIn(['email', 'social', 'landing_page', 'drip_sequence', 'nurture']),
  query('status').optional().isIn(['draft', 'scheduled', 'active', 'paused', 'completed'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      search,
      type,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    
    // Role-based filtering
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      filter.createdBy = req.user._id;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (type) filter.type = type;
    if (status) filter.status = status;

    let campaigns, total;

    if (isMongoConnected()) {
      // Use MongoDB
      campaigns = await Campaign.find(filter)
        .populate('createdBy', 'firstName lastName email')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      total = await Campaign.countDocuments(filter);
    } else {
      // Use demo database
      const result = await demoDatabase.findCampaigns({
        search,
        type,
        status
      }, { page, limit });
      
      campaigns = result.campaigns;
      total = result.total;
    }

    res.json({
      campaigns,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single campaign
router.get('/:id', auth, authorize(['campaigns.read']), async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('recipients.contact', 'firstName lastName email');

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      if (campaign.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create campaign
router.post('/', auth, authorize(['campaigns.write']), [
  body('name').notEmpty().withMessage('Campaign name is required'),
  body('type').isIn(['email', 'social', 'landing_page', 'drip_sequence', 'nurture']),
  body('content.subject').optional().notEmpty(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let campaign;

    if (isMongoConnected()) {
      // Use MongoDB
      campaign = new Campaign({
        ...req.body,
        createdBy: req.user._id
      });

      await campaign.save();
      await campaign.populate('createdBy', 'firstName lastName email');
    } else {
      // Use demo database
      const campaignData = {
        ...req.body,
        createdBy: req.user._id
      };
      
      campaign = await demoDatabase.createCampaign(campaignData);
    }

    // Emit real-time event
    req.app.get('io').emit('campaign:created', campaign);

    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update campaign
router.put('/:id', auth, authorize(['campaigns.write']), [
  body('name').optional().notEmpty(),
  body('type').optional().isIn(['email', 'social', 'landing_page', 'drip_sequence', 'nurture']),
  body('status').optional().isIn(['draft', 'scheduled', 'active', 'paused', 'completed'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      if (campaign.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    Object.assign(campaign, req.body);
    await campaign.save();
    await campaign.populate('createdBy', 'firstName lastName email');

    // Emit real-time event
    req.app.get('io').emit('campaign:updated', campaign);

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete campaign
router.delete('/:id', auth, authorize(['campaigns.delete']), async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      if (campaign.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    await Campaign.findByIdAndDelete(req.params.id);

    // Emit real-time event
    req.app.get('io').emit('campaign:deleted', { id: req.params.id });

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add recipients to campaign
router.post('/:id/recipients', auth, authorize(['campaigns.write']), [
  body('contacts').isArray().withMessage('Contacts must be an array'),
  body('contacts.*').isMongoId().withMessage('Invalid contact ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Verify contacts exist
    const contacts = await Contact.find({ _id: { $in: req.body.contacts } });
    if (contacts.length !== req.body.contacts.length) {
      return res.status(400).json({ message: 'Some contacts not found' });
    }

    // Add recipients
    const newRecipients = contacts.map(contact => ({
      contact: contact._id,
      status: 'pending'
    }));

    campaign.recipients.push(...newRecipients);
    await campaign.save();

    res.json({ message: 'Recipients added successfully', count: newRecipients.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Launch campaign
router.post('/:id/launch', auth, authorize(['campaigns.write']), async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      if (campaign.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      return res.status(400).json({ message: 'Campaign cannot be launched in current status' });
    }

    campaign.status = 'active';
    campaign.startDate = new Date();
    await campaign.save();

    // Here you would integrate with email service (SendGrid, Mailgun, etc.)
    // For now, we'll just update the metrics
    campaign.metrics.sent = campaign.recipients.length;
    await campaign.save();

    // Emit real-time event
    req.app.get('io').emit('campaign:launched', campaign);

    res.json({ message: 'Campaign launched successfully', campaign });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get campaign analytics
router.get('/:id/analytics', auth, authorize(['campaigns.read']), async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const analytics = {
      overview: {
        sent: campaign.metrics.sent,
        delivered: campaign.metrics.delivered,
        opened: campaign.metrics.opened,
        clicked: campaign.metrics.clicked,
        bounced: campaign.metrics.bounced,
        unsubscribed: campaign.metrics.unsubscribed,
        conversions: campaign.metrics.conversions,
        revenue: campaign.metrics.revenue
      },
      rates: {
        deliveryRate: campaign.metrics.sent > 0 ? (campaign.metrics.delivered / campaign.metrics.sent) * 100 : 0,
        openRate: campaign.openRate,
        clickRate: campaign.clickRate,
        conversionRate: campaign.conversionRate,
        bounceRate: campaign.metrics.sent > 0 ? (campaign.metrics.bounced / campaign.metrics.sent) * 100 : 0,
        unsubscribeRate: campaign.metrics.sent > 0 ? (campaign.metrics.unsubscribed / campaign.metrics.sent) * 100 : 0
      },
      roi: campaign.roi
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;