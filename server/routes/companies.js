const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Company = require('../models/Company');
const { auth, authorize } = require('../middleware/auth');
const demoDatabase = require('../utils/demoDatabase');

const router = express.Router();

// Check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Get all companies with filtering, sorting, and pagination
router.get('/', auth, authorize(['companies.read']), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('status').optional().isIn(['prospect', 'customer', 'churned', 'inactive']),
  query('industry').optional().isString(),
  query('size').optional().isString(),
  query('healthStatus').optional().isIn(['healthy', 'at-risk', 'critical'])
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
      industry,
      size,
      healthStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    
    // Role-based filtering
    if (req.user.role === 'ae') {
      filter.accountExecutive = req.user._id;
    } else if (req.user.role === 'csm') {
      filter.customerSuccessManager = req.user._id;
    } else if (req.user.role === 'account_manager') {
      filter.accountManager = req.user._id;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { domain: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) filter.status = status;
    if (industry) filter.industry = industry;
    if (size) filter.size = size;
    if (healthStatus) filter.healthStatus = healthStatus;

    let companies, total;

    if (isMongoConnected()) {
      // Use MongoDB
      companies = await Company.find(filter)
        .populate('accountExecutive', 'firstName lastName email')
        .populate('customerSuccessManager', 'firstName lastName email')
        .populate('accountManager', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      total = await Company.countDocuments(filter);
    } else {
      // Use demo database
      companies = await demoDatabase.getCompanies(filter, {
        page,
        limit,
        sortBy,
        sortOrder
      });
      total = companies.length;
    }

    res.json({
      companies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single company
router.get('/:id', auth, authorize(['companies.read']), async (req, res) => {
  try {
    let company;

    if (isMongoConnected()) {
      company = await Company.findById(req.params.id)
        .populate('accountExecutive', 'firstName lastName email')
        .populate('customerSuccessManager', 'firstName lastName email')
        .populate('accountManager', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('notes.createdBy', 'firstName lastName email');

      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      // Role-based access control
      if (req.user.role === 'ae' && company.accountExecutive?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (req.user.role === 'csm' && company.customerSuccessManager?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else {
      company = await demoDatabase.getCompanyById(req.params.id);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create company
router.post('/', auth, authorize(['companies.write']), [
  body('name').notEmpty().withMessage('Company name is required'),
  body('domain').optional().isString(),
  body('industry').optional().isIn(['SaaS', 'E-commerce', 'Fintech', 'Healthcare', 'Education', 'Enterprise', 'Startup', 'Other']),
  body('size').optional().isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']),
  body('status').optional().isIn(['prospect', 'customer', 'churned', 'inactive']),
  body('annualRevenue').optional().isNumeric(),
  body('fundingStage').optional().isIn(['Bootstrap', 'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'IPO'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let company;

    if (isMongoConnected()) {
      // Check for duplicate domain
      if (req.body.domain) {
        const existingCompany = await Company.findOne({ domain: req.body.domain });
        if (existingCompany) {
          return res.status(400).json({ message: 'Company with this domain already exists' });
        }
      }

      company = new Company({
        ...req.body,
        createdBy: req.user._id,
        // Auto-assign based on role
        accountExecutive: req.user.role === 'ae' ? req.user._id : req.body.accountExecutive,
        customerSuccessManager: req.user.role === 'csm' ? req.user._id : req.body.customerSuccessManager,
        accountManager: req.user.role === 'account_manager' ? req.user._id : req.body.accountManager
      });

      await company.save();
      await company.populate('accountExecutive', 'firstName lastName email');
      await company.populate('customerSuccessManager', 'firstName lastName email');
      await company.populate('accountManager', 'firstName lastName email');
      await company.populate('createdBy', 'firstName lastName email');
    } else {
      // Use demo database
      company = await demoDatabase.createCompany({
        ...req.body,
        createdBy: req.user._id,
        healthScore: 50,
        healthStatus: 'healthy',
        notes: []
      });
    }

    // Emit real-time event
    req.app.get('io').emit('company:created', company);

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update company
router.put('/:id', auth, authorize(['companies.write']), [
  body('name').optional().notEmpty(),
  body('domain').optional().isString(),
  body('industry').optional().isIn(['SaaS', 'E-commerce', 'Fintech', 'Healthcare', 'Education', 'Enterprise', 'Startup', 'Other']),
  body('size').optional().isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']),
  body('status').optional().isIn(['prospect', 'customer', 'churned', 'inactive']),
  body('healthScore').optional().isInt({ min: 0, max: 100 }),
  body('healthStatus').optional().isIn(['healthy', 'at-risk', 'critical'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let company;

    if (isMongoConnected()) {
      company = await Company.findById(req.params.id);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      // Role-based access control
      if (req.user.role === 'ae' && company.accountExecutive?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      Object.assign(company, req.body);
      await company.save();
      
      await company.populate('accountExecutive', 'firstName lastName email');
      await company.populate('customerSuccessManager', 'firstName lastName email');
      await company.populate('accountManager', 'firstName lastName email');
    } else {
      company = await demoDatabase.updateCompany(req.params.id, req.body);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
    }

    // Emit real-time event
    req.app.get('io').emit('company:updated', company);

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete company
router.delete('/:id', auth, authorize(['companies.delete']), async (req, res) => {
  try {
    let company;

    if (isMongoConnected()) {
      company = await Company.findById(req.params.id);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      // Only admin or the creator can delete
      if (req.user.role !== 'admin' && company.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await Company.findByIdAndDelete(req.params.id);
    } else {
      const deleted = await demoDatabase.deleteCompany(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Company not found' });
      }
    }

    // Emit real-time event
    req.app.get('io').emit('company:deleted', { id: req.params.id });

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add note to company
router.post('/:id/notes', auth, authorize(['companies.write']), [
  body('content').notEmpty().withMessage('Note content is required'),
  body('isInternal').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let company;

    if (isMongoConnected()) {
      company = await Company.findById(req.params.id);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      const note = {
        content: req.body.content,
        isInternal: req.body.isInternal || true,
        createdBy: req.user._id,
        createdAt: new Date()
      };

      company.notes.push(note);
      await company.save();
      
      await company.populate('notes.createdBy', 'firstName lastName email');
    } else {
      company = await demoDatabase.addCompanyNote(req.params.id, {
        content: req.body.content,
        isInternal: req.body.isInternal || true,
        createdBy: req.user._id
      });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get company health metrics
router.get('/:id/health', auth, authorize(['companies.read']), async (req, res) => {
  try {
    let healthMetrics;

    if (isMongoConnected()) {
      const company = await Company.findById(req.params.id);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }

      // Calculate health metrics (this would typically come from usage data)
      healthMetrics = {
        healthScore: company.healthScore,
        healthStatus: company.healthStatus,
        lastEngagement: company.lastEngagement,
        metrics: {
          loginFrequency: Math.floor(Math.random() * 100),
          featureAdoption: Math.floor(Math.random() * 100),
          supportTickets: Math.floor(Math.random() * 10),
          paymentStatus: 'current'
        }
      };
    } else {
      healthMetrics = await demoDatabase.getCompanyHealth(req.params.id);
    }

    res.json(healthMetrics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;