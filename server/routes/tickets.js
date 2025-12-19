const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Ticket = require('../models/Ticket');
const Contact = require('../models/Contact');
const { auth, authorize } = require('../middleware/auth');
const demoDatabase = require('../utils/demoDatabase');

const router = express.Router();

// Check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Get all tickets
router.get('/', auth, authorize(['tickets.read']), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('status').optional().isIn(['open', 'in_progress', 'pending', 'resolved', 'closed']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  query('category').optional().isIn(['technical', 'billing', 'general', 'feature_request', 'bug_report']),
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
      status,
      priority,
      category,
      assignedTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    
    // Role-based filtering
    if (req.user.role === 'support') {
      filter.$or = [
        { assignedTo: req.user._id },
        { createdBy: req.user._id }
      ];
    }

    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (assignedTo) filter.assignedTo = assignedTo;

    let tickets, total;

    if (isMongoConnected()) {
      // Use MongoDB
      tickets = await Ticket.find(filter)
        .populate('customer', 'firstName lastName email company')
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      total = await Ticket.countDocuments(filter);
    } else {
      // Use demo database
      const result = await demoDatabase.findTickets({
        search,
        status,
        priority,
        category,
        assignedTo
      }, { page, limit });
      
      tickets = result.tickets;
      total = result.total;
    }

    res.json({
      tickets,
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

// Get single ticket
router.get('/:id', auth, authorize(['tickets.read']), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('customer', 'firstName lastName email company phone')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('comments.createdBy', 'firstName lastName')
      .populate('resolution.resolvedBy', 'firstName lastName')
      .populate('escalation.escalatedTo', 'firstName lastName');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check permissions
    if (req.user.role === 'support') {
      if (ticket.assignedTo?.toString() !== req.user._id.toString() && 
          ticket.createdBy?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create ticket
router.post('/', auth, authorize(['tickets.write']), [
  body('subject').notEmpty().withMessage('Subject is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('customer').notEmpty().withMessage('Customer is required'),
  body('category').isIn(['technical', 'billing', 'general', 'feature_request', 'bug_report']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('channel').optional().isIn(['email', 'chat', 'phone', 'social', 'web_form'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let ticket;

    if (isMongoConnected()) {
      // Use MongoDB
      const customer = await Contact.findById(req.body.customer);
      if (!customer) {
        return res.status(400).json({ message: 'Customer not found' });
      }

      // Set SLA based on priority
      const slaHours = {
        low: { response: 24, resolution: 72 },
        medium: { response: 8, resolution: 48 },
        high: { response: 4, resolution: 24 },
        urgent: { response: 1, resolution: 8 }
      };

      const priority = req.body.priority || 'medium';
      const sla = slaHours[priority];
      const now = new Date();

      // Generate ticket number manually
      const count = await Ticket.countDocuments();
      const ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;

      ticket = new Ticket({
        ...req.body,
        ticketNumber,
        createdBy: req.user._id,
        sla: {
          responseTime: sla.response,
          resolutionTime: sla.resolution,
          responseDeadline: new Date(now.getTime() + sla.response * 60 * 60 * 1000),
          resolutionDeadline: new Date(now.getTime() + sla.resolution * 60 * 60 * 1000)
        }
      });

      await ticket.save();
      await ticket.populate('customer', 'firstName lastName email company');
      await ticket.populate('createdBy', 'firstName lastName email');
    } else {
      // Use demo database
      const ticketData = {
        ...req.body,
        createdBy: req.user._id
      };
      
      ticket = await demoDatabase.createTicket(ticketData);
    }

    // Emit real-time event
    req.app.get('io').emit('ticket:created', ticket);

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update ticket
router.put('/:id', auth, authorize(['tickets.write']), [
  body('status').optional().isIn(['open', 'in_progress', 'pending', 'resolved', 'closed']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('assignedTo').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check permissions
    if (req.user.role === 'support') {
      if (ticket.assignedTo?.toString() !== req.user._id.toString() && 
          ticket.createdBy?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Handle status changes
    if (req.body.status === 'resolved' && ticket.status !== 'resolved') {
      ticket.resolution = {
        resolvedBy: req.user._id,
        resolvedAt: new Date(),
        resolutionTime: Math.round((new Date() - ticket.createdAt) / (1000 * 60)) // in minutes
      };
    }

    Object.assign(ticket, req.body);
    await ticket.save();
    await ticket.populate('customer', 'firstName lastName email company');
    await ticket.populate('assignedTo', 'firstName lastName email');
    await ticket.populate('createdBy', 'firstName lastName email');

    // Emit real-time event
    req.app.get('io').emit('ticket:updated', ticket);

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete ticket
router.delete('/:id', auth, authorize(['tickets.delete']), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Ticket.findByIdAndDelete(req.params.id);

    // Emit real-time event
    req.app.get('io').emit('ticket:deleted', { id: req.params.id });

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add comment to ticket
router.post('/:id/comments', auth, authorize(['tickets.write']), [
  body('content').notEmpty().withMessage('Comment content is required'),
  body('isInternal').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.comments.push({
      content: req.body.content,
      isInternal: req.body.isInternal || false,
      createdBy: req.user._id
    });

    await ticket.save();
    await ticket.populate('comments.createdBy', 'firstName lastName');

    // Emit real-time event
    req.app.get('io').emit('ticket:comment', {
      ticketId: ticket._id,
      comment: ticket.comments[ticket.comments.length - 1]
    });

    res.json(ticket.comments[ticket.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Escalate ticket
router.post('/:id/escalate', auth, authorize(['tickets.write']), [
  body('escalatedTo').isMongoId().withMessage('Valid user ID is required'),
  body('reason').notEmpty().withMessage('Escalation reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.escalation = {
      isEscalated: true,
      escalatedTo: req.body.escalatedTo,
      escalatedAt: new Date(),
      reason: req.body.reason
    };

    ticket.assignedTo = req.body.escalatedTo;
    await ticket.save();

    // Emit real-time event
    req.app.get('io').emit('ticket:escalated', ticket);

    res.json({ message: 'Ticket escalated successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;