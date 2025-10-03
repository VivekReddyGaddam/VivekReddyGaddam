const express = require('express');
const router = express.Router();
const { Story, StoryNode } = require('../models/Story');
const { aiService } = require('../services/aiService');
const { getCachedStory, cacheStory, invalidateStoryCache } = require('../config/redis');
const auth = require('../middleware/auth');
const { validateStoryInput } = require('../middleware/validation');

// Get all stories for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, genre, domain } = req.query;
    const query = { userId: req.user.id };
    
    if (status) query.status = status;
    if (genre) query.genre = genre;
    if (domain) query.domain = domain;
    
    const stories = await Story.find(query)
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('title description genre tone domain status visibility tags stats createdAt updatedAt');
    
    const total = await Story.countDocuments(query);
    
    res.json({
      stories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// Get public stories
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 10, genre, domain, tags } = req.query;
    const query = { visibility: 'public', status: 'active' };
    
    if (genre) query.genre = genre;
    if (domain) query.domain = domain;
    if (tags) query.tags = { $in: tags.split(',') };
    
    const stories = await Story.find(query)
      .populate('userId', 'username')
      .sort({ 'stats.playCount': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('title description genre tone domain tags stats userId createdAt');
    
    const total = await Story.countDocuments(query);
    
    res.json({
      stories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get public stories error:', error);
    res.status(500).json({ error: 'Failed to fetch public stories' });
  }
});

// Get single story by ID
router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // Check if user has access to this story
    if (story.visibility === 'private' && (!req.user || story.userId.toString() !== req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Try to get from cache first
    let cachedStory = await getCachedStory(req.params.id);
    if (cachedStory) {
      return res.json(cachedStory);
    }
    
    // Get story tree
    const storyTree = await story.getStoryTree();
    
    const storyData = {
      ...story.toObject(),
      tree: storyTree
    };
    
    // Cache the story
    await cacheStory(req.params.id, storyData);
    
    res.json(storyData);
  } catch (error) {
    console.error('Get story error:', error);
    res.status(500).json({ error: 'Failed to fetch story' });
  }
});

// Create new story
router.post('/', auth, validateStoryInput, async (req, res) => {
  try {
    // Check if user can create more stories
    if (!req.user.canCreateStory()) {
      return res.status(403).json({ 
        error: 'Story limit reached. Upgrade your plan to create more stories.' 
      });
    }
    
    const storyData = {
      ...req.body,
      userId: req.user.id
    };
    
    const story = new Story(storyData);
    await story.save();
    
    // Create initial story node
    const initialPrompt = req.body.initialPrompt || `Create a ${story.genre} story about ${story.title}`;
    const initialNode = await generateStoryNode(story._id, null, initialPrompt, {
      genre: story.genre,
      tone: story.tone,
      domain: story.domain
    });
    
    story.startNodeId = initialNode.nodeId;
    await story.save();
    
    // Update user stats
    req.user.stats.storiesCreated += 1;
    await req.user.save();
    
    res.status(201).json(story);
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ error: 'Failed to create story' });
  }
});

// Update story
router.put('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    if (story.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    Object.assign(story, req.body);
    await story.save();
    
    // Invalidate cache
    await invalidateStoryCache(req.params.id);
    
    res.json(story);
  } catch (error) {
    console.error('Update story error:', error);
    res.status(500).json({ error: 'Failed to update story' });
  }
});

// Delete story
router.delete('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    if (story.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Delete all associated nodes
    await StoryNode.deleteMany({ storyId: story._id });
    
    // Delete the story
    await Story.findByIdAndDelete(req.params.id);
    
    // Invalidate cache
    await invalidateStoryCache(req.params.id);
    
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

// Generate new story node
router.post('/:id/nodes', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    if (story.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { parentNodeId, prompt, choiceId } = req.body;
    
    // Get parent node context
    const parentNode = parentNodeId ? 
      await StoryNode.findOne({ storyId: story._id, nodeId: parentNodeId }) : 
      null;
    
    const context = parentNode ? parentNode.context : story.lore;
    
    // Generate new node
    const newNode = await generateStoryNode(
      story._id,
      parentNodeId,
      prompt,
      {
        genre: story.genre,
        tone: story.tone,
        domain: story.domain
      },
      context
    );
    
    // Update parent node's choice to point to new node
    if (parentNode && choiceId) {
      const choice = parentNode.choices.id(choiceId);
      if (choice) {
        choice.nextNodeId = newNode._id;
        await parentNode.save();
      }
    }
    
    // Update story stats
    await story.updateStats();
    
    // Invalidate cache
    await invalidateStoryCache(req.params.id);
    
    res.status(201).json(newNode);
  } catch (error) {
    console.error('Generate node error:', error);
    res.status(500).json({ error: 'Failed to generate story node' });
  }
});

// Get story nodes
router.get('/:id/nodes', async (req, res) => {
  try {
    const { parentNodeId } = req.query;
    const query = { storyId: req.params.id };
    
    if (parentNodeId) {
      query.parentNodeId = parentNodeId;
    }
    
    const nodes = await StoryNode.find(query).sort({ createdAt: 1 });
    res.json(nodes);
  } catch (error) {
    console.error('Get nodes error:', error);
    res.status(500).json({ error: 'Failed to fetch story nodes' });
  }
});

// Play story (record play session)
router.post('/:id/play', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // Update play stats
    story.stats.playCount += 1;
    story.stats.lastPlayed = new Date();
    await story.save();
    
    res.json({ message: 'Play session recorded' });
  } catch (error) {
    console.error('Play story error:', error);
    res.status(500).json({ error: 'Failed to record play session' });
  }
});

// Helper function to generate story node
async function generateStoryNode(storyId, parentNodeId, prompt, options, context = {}) {
  try {
    // Generate story segment using AI
    const result = await aiService.generateStorySegment(prompt, context, options);
    
    // Create new node
    const node = new StoryNode({
      storyId,
      nodeId: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      parentNodeId,
      text: result.text,
      choices: result.choices,
      metadata: result.metadata,
      context: {
        ...context,
        previousEvents: [...(context.previousEvents || []), result.text.substring(0, 100) + '...']
      }
    });
    
    await node.save();
    
    // Store in vector DB for consistency checking
    await aiService.storeInVectorDB(storyId, result.text, result.metadata);
    
    return node;
  } catch (error) {
    console.error('Generate story node error:', error);
    throw error;
  }
}

module.exports = router;