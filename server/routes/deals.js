const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Deal = require('../models/Deal');
const Contact = require('../models/Contact');
const { auth, authorize } = require('../middleware/auth');
const demoDatabase = require('../utils/demoDatabase');

const router = express.Router();

// Check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Get all deals with filtering, sorting, and pagination
router.get('/', auth, authorize(['deals.read']), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('stage').optional().isIn(['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
  query('assignedTo').optional().isMongoId()
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
      stage,
      assignedTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    
    // Role-based filtering
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      filter.$or = [
        { owner: req.user._id },
        { assignedTo: req.user._id }
      ];
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    if (stage) filter.stage = stage;
    if (assignedTo) filter.assignedTo = assignedTo;

    let deals, total;

    if (isMongoConnected()) {
      // Use MongoDB
      deals = await Deal.find(filter)
        .populate('contact', 'firstName lastName email company')
        .populate('assignedTo', 'firstName lastName email')
        .populate('owner', 'firstName lastName email')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      total = await Deal.countDocuments(filter);
    } else {
      // Use demo database
      const result = await demoDatabase.findDeals({
        search,
        stage,
        assignedTo
      }, { page, limit });
      
      deals = result.deals;
      total = result.total;
    }

    res.json({
      deals,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single deal
router.get('/:id', auth, authorize(['deals.read']), async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('contact', 'firstName lastName email company phone')
      .populate('assignedTo', 'firstName lastName email')
      .populate('owner', 'firstName lastName email')
      .populate('activities.createdBy', 'firstName lastName')
      .populate('tasks.assignedTo', 'firstName lastName')
      .populate('tasks.createdBy', 'firstName lastName');

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      if (deal.owner.toString() !== req.user._id.toString() && 
          deal.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create deal
router.post('/', auth, authorize(['deals.write']), [
  body('title').notEmpty().withMessage('Title is required'),
  body('value').isNumeric().withMessage('Value must be a number'),
  body('contact').notEmpty().withMessage('Contact is required'),
  body('stage').optional().isIn(['lead', 'demo_scheduled', 'demo_completed', 'trial', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
  body('probability').optional().isInt({ min: 0, max: 100 }),
  body('expectedCloseDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let deal;

    if (isMongoConnected()) {
      // Use MongoDB
      const contact = await Contact.findById(req.body.contact);
      if (!contact) {
        return res.status(400).json({ message: 'Contact not found' });
      }

      deal = new Deal({
        ...req.body,
        owner: req.user._id,
        assignedTo: req.body.assignedTo || req.user._id,
        company: contact.company
      });

      await deal.save();
      await deal.populate('contact', 'firstName lastName email company');
      await deal.populate('assignedTo', 'firstName lastName email');
      await deal.populate('owner', 'firstName lastName email');
    } else {
      // Use demo database
      const dealData = {
        ...req.body,
        owner: req.user._id,
        assignedTo: req.body.assignedTo || req.user._id,
        createdBy: req.user._id
      };
      
      deal = await demoDatabase.createDeal(dealData);
    }

    // Emit real-time event
    req.app.get('io').emit('deal:created', deal);

    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update deal
router.put('/:id', auth, authorize(['deals.write']), [
  body('title').optional().notEmpty(),
  body('value').optional().isNumeric(),
  body('stage').optional().isIn(['lead', 'demo_scheduled', 'demo_completed', 'trial', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
  body('probability').optional().isInt({ min: 0, max: 100 }),
  body('expectedCloseDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      if (deal.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Handle stage changes
    if (req.body.stage && req.body.stage !== deal.stage) {
      if (req.body.stage === 'closed_won' || req.body.stage === 'closed_lost') {
        deal.actualCloseDate = new Date();
      }
    }

    Object.assign(deal, req.body);
    await deal.save();
    await deal.populate('contact', 'firstName lastName email company');
    await deal.populate('assignedTo', 'firstName lastName email');
    await deal.populate('owner', 'firstName lastName email');

    // Emit real-time event
    req.app.get('io').emit('deal:updated', deal);

    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete deal
router.delete('/:id', auth, authorize(['deals.delete']), async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      if (deal.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    await Deal.findByIdAndDelete(req.params.id);

    // Emit real-time event
    req.app.get('io').emit('deal:deleted', { id: req.params.id });

    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add activity to deal
router.post('/:id/activities', auth, authorize(['deals.write']), [
  body('type').isIn(['call', 'email', 'meeting', 'proposal', 'demo', 'negotiation']),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('date').isISO8601().withMessage('Valid date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    deal.activities.push({
      ...req.body,
      createdBy: req.user._id
    });

    await deal.save();
    await deal.populate('activities.createdBy', 'firstName lastName');

    res.json(deal.activities[deal.activities.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add task to deal
router.post('/:id/tasks', auth, authorize(['deals.write']), [
  body('title').notEmpty().withMessage('Title is required'),
  body('dueDate').optional().isISO8601(),
  body('assignedTo').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    deal.tasks.push({
      ...req.body,
      createdBy: req.user._id,
      assignedTo: req.body.assignedTo || req.user._id
    });

    await deal.save();
    await deal.populate('tasks.assignedTo', 'firstName lastName');
    await deal.populate('tasks.createdBy', 'firstName lastName');

    res.json(deal.tasks[deal.tasks.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update task
router.put('/:dealId/tasks/:taskId', auth, authorize(['deals.write']), [
  body('completed').optional().isBoolean()
], async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.dealId);
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    const task = deal.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    Object.assign(task, req.body);
    await deal.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;