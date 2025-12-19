const jwt = require('jsonwebtoken');
const User = require('../models/User');
const demoDatabase = require('../utils/demoDatabase');

// Check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user;

    if (isMongoConnected()) {
      // Use MongoDB
      user = await User.findById(decoded.userId).select('-password -refreshToken');
    } else {
      // Use demo database
      user = await demoDatabase.findUserById(decoded.userId);
      if (user) {
        // Remove sensitive fields
        const { password, refreshToken, ...userWithoutSensitive } = user;
        user = userWithoutSensitive;
      }
    }
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const authorize = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied' });
    }

    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user has required permissions
    const hasPermission = permissions.some(permission => 
      req.user.permissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = { auth, authorize };