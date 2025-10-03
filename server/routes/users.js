const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { Story } = require('../models/Story');
const auth = require('../middleware/auth');

// Get user profile by username
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's public stories
    const publicStories = await Story.find({
      userId: user._id,
      visibility: 'public',
      status: 'active'
    }).select('title description genre tone domain tags stats createdAt').limit(10);
    
    res.json({
      profile: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        stats: user.stats,
        createdAt: user.createdAt
      },
      publicStories
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Get user stats
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get additional stats
    const storyStats = await Story.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          totalStories: { $sum: 1 },
          totalPlayCount: { $sum: '$stats.playCount' },
          avgPlayTime: { $avg: '$stats.averagePlayTime' },
          genres: { $addToSet: '$genre' },
          domains: { $addToSet: '$domain' }
        }
      }
    ]);
    
    const stats = storyStats[0] || {
      totalStories: 0,
      totalPlayCount: 0,
      avgPlayTime: 0,
      genres: [],
      domains: []
    };
    
    res.json({
      user: user.stats,
      stories: stats,
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to get user stats' });
  }
});

// Get user's recent activity
router.get('/activity', auth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Get recent stories
    const recentStories = await Story.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .select('title genre domain status updatedAt stats.playCount');
    
    res.json({ recentStories });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ error: 'Failed to get user activity' });
  }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update preferences
    user.preferences = { ...user.preferences, ...preferences };
    await user.save();
    
    res.json({ preferences: user.preferences });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Upload avatar
router.post('/avatar', auth, async (req, res) => {
  try {
    // This would handle file upload
    // For now, just return a placeholder
    res.json({ 
      message: 'Avatar upload endpoint - implement with multer or cloud storage',
      avatarUrl: null 
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Get user's subscription details
router.get('/subscription', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      subscription: user.subscription,
      canCreateStory: user.canCreateStory(),
      storiesCreated: user.stats.storiesCreated,
      maxStories: user.subscription.features.maxStories
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription details' });
  }
});

// Upgrade subscription (placeholder)
router.post('/subscription/upgrade', auth, async (req, res) => {
  try {
    const { plan } = req.body;
    
    if (!['pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid subscription plan' });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update subscription
    user.subscription.plan = plan;
    user.subscription.startDate = new Date();
    user.subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    // Update features based on plan
    if (plan === 'pro') {
      user.subscription.features = {
        maxStories: 100,
        maxBranches: 50,
        voiceGeneration: true,
        customDomains: false,
        apiAccess: false
      };
    } else if (plan === 'enterprise') {
      user.subscription.features = {
        maxStories: -1, // unlimited
        maxBranches: -1, // unlimited
        voiceGeneration: true,
        customDomains: true,
        apiAccess: true
      };
    }
    
    await user.save();
    
    res.json({ 
      message: 'Subscription upgraded successfully',
      subscription: user.subscription 
    });
  } catch (error) {
    console.error('Upgrade subscription error:', error);
    res.status(500).json({ error: 'Failed to upgrade subscription' });
  }
});

module.exports = router;