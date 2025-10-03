const express = require('express');
const router = express.Router();
const { aiService } = require('../services/aiService');
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for AI requests
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each user to 20 AI requests per windowMs
  message: 'Too many AI requests, please try again later.',
  keyGenerator: (req) => req.user ? req.user.id : req.ip
});

// Generate story segment
router.post('/generate', auth, aiLimiter, async (req, res) => {
  try {
    const { prompt, context = {}, options = {} } = req.body;
    
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    if (prompt.length > 500) {
      return res.status(400).json({ error: 'Prompt too long (max 500 characters)' });
    }
    
    // Generate story segment
    const result = await aiService.generateStorySegment(prompt, context, options);
    
    res.json(result);
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Failed to generate story segment' });
  }
});

// Analyze sentiment
router.post('/sentiment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const sentiment = await aiService.analyzeSentiment(text);
    res.json(sentiment);
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
});

// Check consistency
router.post('/consistency', auth, async (req, res) => {
  try {
    const { storyId, content, context } = req.body;
    
    if (!storyId || !content) {
      return res.status(400).json({ error: 'Story ID and content are required' });
    }
    
    const consistency = await aiService.checkConsistency(storyId, content, context);
    res.json(consistency);
  } catch (error) {
    console.error('Consistency check error:', error);
    res.status(500).json({ error: 'Failed to check consistency' });
  }
});

// Generate multiple story branches
router.post('/branches', auth, aiLimiter, async (req, res) => {
  try {
    const { prompt, context = {}, options = {}, branchCount = 3 } = req.body;
    
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    if (branchCount < 2 || branchCount > 5) {
      return res.status(400).json({ error: 'Branch count must be between 2 and 5' });
    }
    
    // Generate multiple branches
    const branches = await Promise.all(
      Array.from({ length: branchCount }, (_, i) => 
        aiService.generateStorySegment(
          `${prompt} (Branch ${i + 1})`,
          context,
          { ...options, branchingComplexity: 2 }
        )
      )
    );
    
    res.json({ branches });
  } catch (error) {
    console.error('Branch generation error:', error);
    res.status(500).json({ error: 'Failed to generate story branches' });
  }
});

// Generate character suggestions
router.post('/characters', auth, async (req, res) => {
  try {
    const { genre, tone, count = 3 } = req.body;
    
    const characterPrompts = [
      `Create a ${genre} character with ${tone} personality`,
      `Design a ${genre} character suitable for ${tone} storytelling`,
      `Generate a ${genre} character that fits ${tone} narrative tone`
    ];
    
    const characters = await Promise.all(
      characterPrompts.slice(0, count).map(prompt =>
        aiService.generateStorySegment(prompt, {}, {
          genre,
          tone,
          length: 'short',
          branchingComplexity: 1
        })
      )
    );
    
    // Extract character information
    const characterData = characters.map((char, index) => ({
      id: index + 1,
      name: `Character ${index + 1}`,
      description: char.text,
      traits: extractTraits(char.text),
      role: determineRole(char.text, genre)
    }));
    
    res.json({ characters: characterData });
  } catch (error) {
    console.error('Character generation error:', error);
    res.status(500).json({ error: 'Failed to generate characters' });
  }
});

// Generate setting suggestions
router.post('/settings', auth, async (req, res) => {
  try {
    const { genre, tone, count = 3 } = req.body;
    
    const settingPrompts = [
      `Describe a ${genre} setting with ${tone} atmosphere`,
      `Create a ${genre} world suitable for ${tone} storytelling`,
      `Design a ${genre} location that fits ${tone} narrative tone`
    ];
    
    const settings = await Promise.all(
      settingPrompts.slice(0, count).map(prompt =>
        aiService.generateStorySegment(prompt, {}, {
          genre,
          tone,
          length: 'short',
          branchingComplexity: 1
        })
      )
    );
    
    const settingData = settings.map((setting, index) => ({
      id: index + 1,
      name: `${genre} Setting ${index + 1}`,
      description: setting.text,
      atmosphere: extractAtmosphere(setting.text),
      features: extractFeatures(setting.text)
    }));
    
    res.json({ settings: settingData });
  } catch (error) {
    console.error('Setting generation error:', error);
    res.status(500).json({ error: 'Failed to generate settings' });
  }
});

// Generate plot suggestions
router.post('/plots', auth, aiLimiter, async (req, res) => {
  try {
    const { genre, tone, characters = [], setting = '', count = 3 } = req.body;
    
    const plotPrompts = [
      `Create a ${genre} plot involving ${characters.map(c => c.name).join(', ') || 'the characters'} in ${setting || 'this world'}`,
      `Design a ${tone} ${genre} story arc for ${characters.map(c => c.name).join(', ') || 'the protagonists'}`,
      `Generate a ${genre} narrative structure with ${tone} elements`
    ];
    
    const plots = await Promise.all(
      plotPrompts.slice(0, count).map(prompt =>
        aiService.generateStorySegment(prompt, { characters, setting }, {
          genre,
          tone,
          length: 'medium',
          branchingComplexity: 2
        })
      )
    );
    
    const plotData = plots.map((plot, index) => ({
      id: index + 1,
      title: `${genre} Plot ${index + 1}`,
      description: plot.text,
      conflict: extractConflict(plot.text),
      resolution: extractResolution(plot.text),
      themes: extractThemes(plot.text)
    }));
    
    res.json({ plots: plotData });
  } catch (error) {
    console.error('Plot generation error:', error);
    res.status(500).json({ error: 'Failed to generate plots' });
  }
});

// Helper functions for extracting information from generated text
function extractTraits(text) {
  const traitKeywords = ['brave', 'cunning', 'wise', 'fierce', 'gentle', 'mysterious', 'powerful', 'kind', 'determined', 'clever'];
  return traitKeywords.filter(trait => text.toLowerCase().includes(trait));
}

function determineRole(text, genre) {
  const roles = {
    fantasy: ['warrior', 'mage', 'rogue', 'healer', 'bard'],
    'sci-fi': ['pilot', 'scientist', 'engineer', 'soldier', 'explorer'],
    mystery: ['detective', 'investigator', 'witness', 'suspect', 'victim'],
    romance: ['protagonist', 'love interest', 'friend', 'rival', 'mentor']
  };
  
  const genreRoles = roles[genre] || roles.fantasy;
  return genreRoles[Math.floor(Math.random() * genreRoles.length)];
}

function extractAtmosphere(text) {
  const atmospheres = ['dark', 'bright', 'mysterious', 'peaceful', 'tense', 'magical', 'futuristic', 'ancient'];
  return atmospheres.filter(atm => text.toLowerCase().includes(atm));
}

function extractFeatures(text) {
  const features = ['mountains', 'forests', 'cities', 'castles', 'spaceships', 'labs', 'temples', 'ruins'];
  return features.filter(feature => text.toLowerCase().includes(feature));
}

function extractConflict(text) {
  const conflicts = ['war', 'betrayal', 'mystery', 'romance', 'survival', 'revenge', 'discovery', 'redemption'];
  return conflicts.filter(conflict => text.toLowerCase().includes(conflict));
}

function extractResolution(text) {
  const resolutions = ['victory', 'defeat', 'sacrifice', 'redemption', 'discovery', 'love', 'peace', 'transformation'];
  return resolutions.filter(resolution => text.toLowerCase().includes(resolution));
}

function extractThemes(text) {
  const themes = ['good vs evil', 'love', 'sacrifice', 'redemption', 'power', 'justice', 'freedom', 'family'];
  return themes.filter(theme => text.toLowerCase().includes(theme.split(' ')[0]));
}

module.exports = router;