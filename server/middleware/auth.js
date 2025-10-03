const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Update last active
      req.user.lastActive = Date.now();
      await req.user.save();

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const checkSubscription = (requiredTier) => {
  return (req, res, next) => {
    const tierLevels = { free: 0, pro: 1, enterprise: 2 };
    const userLevel = tierLevels[req.user.subscription.tier];
    const requiredLevel = tierLevels[requiredTier];

    if (userLevel < requiredLevel) {
      return res.status(403).json({ 
        message: `This feature requires ${requiredTier} subscription`,
        currentTier: req.user.subscription.tier
      });
    }

    next();
  };
};

const checkStoryLimit = async (req, res, next) => {
  try {
    await req.user.resetMonthlyLimit();

    if (req.user.subscription.tier === 'free' && 
        req.user.subscription.storiesUsed >= req.user.subscription.storiesPerMonth) {
      return res.status(403).json({ 
        message: 'Monthly story limit reached. Upgrade to Pro for unlimited stories.',
        storiesUsed: req.user.subscription.storiesUsed,
        limit: req.user.subscription.storiesPerMonth
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking story limit' });
  }
};

module.exports = { protect, checkSubscription, checkStoryLimit };
