const express = require('express');
const router = express.Router();
const {
  createStory,
  getUserStories,
  getStory,
  continueStory,
  getStoryTree,
  updateStory,
  deleteStory,
  exportStory,
  getPublicStories
} = require('../controllers/storyController');
const { protect, checkStoryLimit } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/public/feed', getPublicStories);

// Protected routes
router.post('/', protect, checkStoryLimit, aiLimiter, createStory);
router.get('/', protect, getUserStories);
router.get('/:id', protect, getStory);
router.post('/:id/continue', protect, aiLimiter, continueStory);
router.get('/:id/tree', protect, getStoryTree);
router.put('/:id', protect, updateStory);
router.delete('/:id', protect, deleteStory);
router.get('/:id/export', protect, exportStory);

module.exports = router;
