const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Workflow model would be defined here, but for now we'll use a simple structure
const workflows = [];

// Get all workflows
router.get('/', auth, authorize(['workflows.read']), async (req, res) => {
  try {
    // In a real implementation, this would fetch from database
    res.json({ workflows });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create workflow
router.post('/', auth, authorize(['workflows.write']), [
  body('name').notEmpty().withMessage('Workflow name is required'),
  body('description').optional().isString(),
  body('trigger').notEmpty().withMessage('Trigger is required'),
  body('actions').isArray().withMessage('Actions must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const workflow = {
      id: Date.now().toString(),
      ...req.body,
      createdBy: req.user._id,
      createdAt: new Date(),
      isActive: true
    };

    workflows.push(workflow);

    res.status(201).json(workflow);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update workflow
router.put('/:id', auth, authorize(['workflows.write']), async (req, res) => {
  try {
    const workflowIndex = workflows.findIndex(w => w.id === req.params.id);
    if (workflowIndex === -1) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    workflows[workflowIndex] = { ...workflows[workflowIndex], ...req.body };
    res.json(workflows[workflowIndex]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete workflow
router.delete('/:id', auth, authorize(['workflows.write']), async (req, res) => {
  try {
    const workflowIndex = workflows.findIndex(w => w.id === req.params.id);
    if (workflowIndex === -1) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    workflows.splice(workflowIndex, 1);
    res.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;