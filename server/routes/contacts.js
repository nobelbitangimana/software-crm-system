const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Contact = require('../models/Contact');
const { auth, authorize } = require('../middleware/auth');
const demoDatabase = require('../utils/demoDatabase');

const router = express.Router();

// Check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Get all contacts with filtering, sorting, and pagination
router.get('/', auth, authorize(['contacts.read']), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('status').optional().isIn(['lead', 'prospect', 'customer', 'inactive']),
  query('leadSource').optional().isString(),
  query('assignedTo').optional().isMongoId(),
  query('tags').optional().isString()
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
      leadSource,
      assignedTo,
      tags,
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
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) filter.status = status;
    if (leadSource) filter.leadSource = leadSource;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (tags) filter.tags = { $in: tags.split(',') };

    let contacts, total;

    if (isMongoConnected()) {
      // Use MongoDB
      contacts = await Contact.find(filter)
        .populate('assignedTo', 'firstName lastName email')
        .populate('owner', 'firstName lastName email')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      total = await Contact.countDocuments(filter);
    } else {
      // Use demo database
      const result = await demoDatabase.findContacts({
        search,
        status,
        leadSource,
        assignedTo,
        tags
      }, { page, limit });
      
      contacts = result.contacts;
      total = result.total;
    }

    res.json({
      contacts,
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

// Get single contact
router.get('/:id', auth, authorize(['contacts.read']), async (req, res) => {
  try {
    let contact;

    if (isMongoConnected()) {
      contact = await Contact.findById(req.params.id)
        .populate('assignedTo', 'firstName lastName email')
        .populate('owner', 'firstName lastName email')
        .populate('notes.createdBy', 'firstName lastName')
        .populate('activities.createdBy', 'firstName lastName');
    } else {
      contact = await demoDatabase.findContactById(req.params.id);
    }

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Check permissions (simplified for demo)
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      if (contact.owner !== req.user._id && contact.assignedTo !== req.user._id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create contact
router.post('/', auth, authorize(['contacts.write']), [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().isString(),
  body('company').optional().isString(),
  body('position').optional().isString(),
  body('leadSource').optional().isIn(['website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'trade_show', 'other']),
  body('status').optional().isIn(['lead', 'prospect', 'customer', 'inactive']),
  body('assignedTo').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let contact;

    if (isMongoConnected()) {
      // Check for duplicate email
      const existingContact = await Contact.findOne({ email: req.body.email });
      if (existingContact) {
        return res.status(400).json({ message: 'Contact with this email already exists' });
      }

      contact = new Contact({
        ...req.body,
        owner: req.user._id,
        assignedTo: req.body.assignedTo || req.user._id
      });

      await contact.save();
      await contact.populate('assignedTo', 'firstName lastName email');
      await contact.populate('owner', 'firstName lastName email');
    } else {
      // Use demo database
      contact = await demoDatabase.createContact({
        ...req.body,
        owner: req.user._id,
        assignedTo: req.body.assignedTo || req.user._id,
        leadScore: 50,
        notes: [],
        activities: []
      });
    }

    // Emit real-time event
    req.app.get('io').emit('contact:created', contact);

    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update contact
router.put('/:id', auth, authorize(['contacts.write']), [
  body('firstName').optional().notEmpty(),
  body('lastName').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('phone').optional().isMobilePhone(),
  body('leadSource').optional().isIn(['website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'trade_show', 'other']),
  body('status').optional().isIn(['lead', 'prospect', 'customer', 'inactive']),
  body('assignedTo').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      if (contact.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Check for duplicate email if email is being updated
    if (req.body.email && req.body.email !== contact.email) {
      const existingContact = await Contact.findOne({ email: req.body.email });
      if (existingContact) {
        return res.status(400).json({ message: 'Contact with this email already exists' });
      }
    }

    Object.assign(contact, req.body);
    await contact.save();
    await contact.populate('assignedTo', 'firstName lastName email');
    await contact.populate('owner', 'firstName lastName email');

    // Emit real-time event
    req.app.get('io').emit('contact:updated', contact);

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete contact
router.delete('/:id', auth, authorize(['contacts.delete']), async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      if (contact.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    await Contact.findByIdAndDelete(req.params.id);

    // Emit real-time event
    req.app.get('io').emit('contact:deleted', { id: req.params.id });

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add note to contact
router.post('/:id/notes', auth, authorize(['contacts.write']), [
  body('content').notEmpty().withMessage('Note content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    contact.notes.push({
      content: req.body.content,
      createdBy: req.user._id
    });

    await contact.save();
    await contact.populate('notes.createdBy', 'firstName lastName');

    res.json(contact.notes[contact.notes.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add activity to contact
router.post('/:id/activities', auth, authorize(['contacts.write']), [
  body('type').isIn(['call', 'email', 'meeting', 'note', 'task']),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('date').isISO8601().withMessage('Valid date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    contact.activities.push({
      ...req.body,
      createdBy: req.user._id
    });

    // Update last contact date
    contact.lastContactDate = new Date();

    await contact.save();
    await contact.populate('activities.createdBy', 'firstName lastName');

    res.json(contact.activities[contact.activities.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;