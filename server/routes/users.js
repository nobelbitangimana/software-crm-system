const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Get all users (Admin only)
router.get('/', auth, authorize(['users.read']), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('role').optional().isIn(['admin', 'sdr', 'ae', 'csm', 'account_manager', 'support_engineer', 'product', 'marketing', 'executive']),
  query('isActive').optional().isBoolean()
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
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive;

    let users, total;

    if (isMongoConnected()) {
      // Use MongoDB
      users = await User.find(filter)
        .populate('manager', 'firstName lastName email')
        .select('-password -refreshToken')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      total = await User.countDocuments(filter);
    } else {
      // Use demo database - simplified for demo
      users = [
        {
          _id: '1',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@crm.com',
          role: 'admin',
          isActive: true,
          department: 'Management',
          createdAt: new Date()
        }
      ];
      total = users.length;
    }

    res.json({
      users,
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

// Get single user (Admin only)
router.get('/:id', auth, authorize(['users.read']), async (req, res) => {
  try {
    let user;

    if (isMongoConnected()) {
      user = await User.findById(req.params.id)
        .populate('manager', 'firstName lastName email')
        .select('-password -refreshToken');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    } else {
      // Demo mode
      user = {
        _id: req.params.id,
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@crm.com',
        role: 'sdr',
        isActive: true
      };
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create user (Admin only)
router.post('/', auth, authorize(['users.write']), [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'sdr', 'ae', 'csm', 'account_manager', 'support_engineer', 'product', 'marketing', 'executive']).withMessage('Valid role is required'),
  body('department').optional().isString(),
  body('territory').optional().isString(),
  body('quota').optional().isNumeric(),
  body('commissionRate').optional().isNumeric(),
  body('manager').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let user;

    if (isMongoConnected()) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Set default permissions based on role
      const rolePermissions = {
        admin: [
          'leads.read', 'leads.write', 'leads.delete',
          'contacts.read', 'contacts.write', 'contacts.delete',
          'companies.read', 'companies.write', 'companies.delete',
          'deals.read', 'deals.write', 'deals.delete',
          'campaigns.read', 'campaigns.write', 'campaigns.delete',
          'tickets.read', 'tickets.write', 'tickets.delete',
          'analytics.read', 'workflows.read', 'workflows.write',
          'users.read', 'users.write', 'users.delete',
          'subscriptions.read', 'subscriptions.write',
          'health_scores.read', 'health_scores.write',
          'renewals.read', 'renewals.write'
        ],
        sdr: [
          'leads.read', 'leads.write',
          'contacts.read', 'contacts.write',
          'companies.read',
          'deals.read', 'deals.write',
          'campaigns.read',
          'analytics.read'
        ],
        ae: [
          'contacts.read', 'contacts.write',
          'companies.read', 'companies.write',
          'deals.read', 'deals.write', 'deals.delete',
          'campaigns.read',
          'analytics.read'
        ],
        csm: [
          'contacts.read', 'contacts.write',
          'companies.read', 'companies.write',
          'subscriptions.read', 'subscriptions.write',
          'tickets.read', 'tickets.write',
          'health_scores.read', 'health_scores.write',
          'renewals.read', 'renewals.write',
          'analytics.read'
        ],
        account_manager: [
          'contacts.read', 'contacts.write',
          'companies.read', 'companies.write',
          'deals.read', 'deals.write',
          'subscriptions.read', 'subscriptions.write',
          'analytics.read'
        ],
        support_engineer: [
          'contacts.read',
          'companies.read',
          'tickets.read', 'tickets.write', 'tickets.delete',
          'analytics.read'
        ],
        product: [
          'companies.read',
          'tickets.read',
          'analytics.read'
        ],
        marketing: [
          'contacts.read', 'contacts.write',
          'companies.read',
          'campaigns.read', 'campaigns.write', 'campaigns.delete',
          'analytics.read'
        ],
        executive: [
          'contacts.read',
          'companies.read',
          'deals.read',
          'subscriptions.read',
          'campaigns.read',
          'tickets.read',
          'analytics.read'
        ]
      };

      user = new User({
        ...req.body,
        permissions: rolePermissions[req.body.role] || [],
        isActive: true
      });

      await user.save();
      
      // Remove sensitive data from response
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.refreshToken;

      if (user.manager) {
        await user.populate('manager', 'firstName lastName email');
      }
    } else {
      // Demo mode
      user = {
        _id: Date.now().toString(),
        ...req.body,
        isActive: true,
        createdAt: new Date()
      };
      delete user.password; // Don't return password
    }

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user (Admin only)
router.put('/:id', auth, authorize(['users.write']), [
  body('firstName').optional().notEmpty(),
  body('lastName').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('role').optional().isIn(['admin', 'sdr', 'ae', 'csm', 'account_manager', 'support_engineer', 'product', 'marketing', 'executive']),
  body('isActive').optional().isBoolean(),
  body('department').optional().isString(),
  body('territory').optional().isString(),
  body('quota').optional().isNumeric(),
  body('commissionRate').optional().isNumeric(),
  body('manager').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let user;

    if (isMongoConnected()) {
      user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Don't allow users to deactivate themselves
      if (req.params.id === req.user._id.toString() && req.body.isActive === false) {
        return res.status(400).json({ message: 'Cannot deactivate your own account' });
      }

      // Update user
      Object.assign(user, req.body);
      await user.save();

      await user.populate('manager', 'firstName lastName email');
      
      // Remove sensitive data
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.refreshToken;
      
      user = userResponse;
    } else {
      // Demo mode
      user = {
        _id: req.params.id,
        ...req.body,
        updatedAt: new Date()
      };
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user (Admin only)
router.delete('/:id', auth, authorize(['users.delete']), async (req, res) => {
  try {
    // Don't allow users to delete themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    if (isMongoConnected()) {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await User.findByIdAndDelete(req.params.id);
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reset user password (Admin only)
router.post('/:id/reset-password', auth, authorize(['users.write']), [
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (isMongoConnected()) {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.password = req.body.newPassword;
      await user.save();
    }

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;