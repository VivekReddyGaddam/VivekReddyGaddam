const narrativeEngine = require('../services/narrativeEngine');
const Story = require('../models/Story');
const Session = require('../models/Session');

// @desc    Create new story
// @route   POST /api/stories
// @access  Private
exports.createStory = async (req, res) => {
  try {
    const userId = req.user._id;
    const storyData = req.body;

    // Validate required fields
    if (!storyData.initialPrompt || !storyData.parameters) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create story using narrative engine
    const story = await narrativeEngine.createStory(userId, storyData);

    // Update user story count
    if (req.user.subscription.tier === 'free') {
      req.user.subscription.storiesUsed += 1;
      await req.user.save();
    }

    res.status(201).json(story);
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ message: error.message || 'Failed to create story' });
  }
};

// @desc    Get user's stories
// @route   GET /api/stories
// @access  Private
exports.getUserStories = async (req, res) => {
  try {
    const { status, genre, limit = 20, page = 1 } = req.query;
    
    const query = { author: req.user._id };
    
    if (status) query.status = status;
    if (genre) query['parameters.genre'] = genre;

    const stories = await Story.find(query)
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Story.countDocuments(query);

    res.json({
      stories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({ message: 'Failed to fetch stories' });
  }
};

// @desc    Get story by ID
// @route   GET /api/stories/:id
// @access  Private
exports.getStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    // Check if user has access
    if (story.author.toString() !== req.user._id.toString() && !story.isPublic) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(story);
  } catch (error) {
    console.error('Get story error:', error);
    res.status(500).json({ message: 'Failed to fetch story' });
  }
};

// @desc    Continue story with a choice
// @route   POST /api/stories/:id/continue
// @access  Private
exports.continueStory = async (req, res) => {
  try {
    const { currentNodeId, choiceIndex } = req.body;
    const storyId = req.params.id;

    if (currentNodeId === undefined || choiceIndex === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Generate next segment
    const result = await narrativeEngine.generateNextSegment(
      storyId,
      currentNodeId,
      choiceIndex,
      req.user._id
    );

    res.json(result);
  } catch (error) {
    console.error('Continue story error:', error);
    res.status(500).json({ message: error.message || 'Failed to continue story' });
  }
};

// @desc    Get story tree visualization
// @route   GET /api/stories/:id/tree
// @access  Private
exports.getStoryTree = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (story.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const treeData = narrativeEngine.getStoryTree(story);
    res.json(treeData);
  } catch (error) {
    console.error('Get story tree error:', error);
    res.status(500).json({ message: 'Failed to fetch story tree' });
  }
};

// @desc    Update story
// @route   PUT /api/stories/:id
// @access  Private
exports.updateStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (story.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'loreBook', 'isPublic', 'status'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        story[field] = req.body[field];
      }
    });

    await story.save();
    res.json(story);
  } catch (error) {
    console.error('Update story error:', error);
    res.status(500).json({ message: 'Failed to update story' });
  }
};

// @desc    Delete story
// @route   DELETE /api/stories/:id
// @access  Private
exports.deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (story.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await story.deleteOne();
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ message: 'Failed to delete story' });
  }
};

// @desc    Export story as JSON
// @route   GET /api/stories/:id/export
// @access  Private
exports.exportStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (story.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const exportData = story.exportJSON();
    res.json(exportData);
  } catch (error) {
    console.error('Export story error:', error);
    res.status(500).json({ message: 'Failed to export story' });
  }
};

// @desc    Get public stories
// @route   GET /api/stories/public/feed
// @access  Public
exports.getPublicStories = async (req, res) => {
  try {
    const { genre, limit = 20, page = 1 } = req.query;
    
    const query = { isPublic: true, status: 'active' };
    if (genre) query['parameters.genre'] = genre;

    const stories = await Story.find(query)
      .populate('author', 'name')
      .sort({ plays: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Story.countDocuments(query);

    res.json({
      stories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get public stories error:', error);
    res.status(500).json({ message: 'Failed to fetch public stories' });
  }
};
