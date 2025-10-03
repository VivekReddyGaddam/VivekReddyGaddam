const Joi = require('joi');

// Auth validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  username: Joi.string().alphanum().min(3).max(20).required(),
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Story validation schemas
const storySchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  genre: Joi.string().valid('fantasy', 'sci-fi', 'mystery', 'romance', 'horror', 'historical', 'adventure').required(),
  tone: Joi.string().valid('serious', 'humorous', 'mysterious', 'romantic').required(),
  domain: Joi.string().valid('general', 'gaming', 'education', 'therapy').default('general'),
  visibility: Joi.string().valid('private', 'public', 'unlisted').default('private'),
  tags: Joi.array().items(Joi.string().max(20)).max(10).optional(),
  initialPrompt: Joi.string().max(500).optional(),
  settings: Joi.object({
    branchingComplexity: Joi.number().min(2).max(10).default(3),
    maxLength: Joi.number().min(100).max(10000).default(1000),
    allowUserInput: Joi.boolean().default(true),
    autoGenerate: Joi.boolean().default(false)
  }).optional(),
  lore: Joi.object({
    worldBuilding: Joi.string().max(2000).optional(),
    characterProfiles: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      backstory: Joi.string().optional(),
      traits: Joi.array().items(Joi.string()).optional(),
      goals: Joi.array().items(Joi.string()).optional()
    })).optional(),
    rules: Joi.array().items(Joi.string()).optional(),
    history: Joi.string().optional()
  }).optional()
});

// AI generation validation schemas
const aiGenerateSchema = Joi.object({
  prompt: Joi.string().min(1).max(500).required(),
  context: Joi.object().optional(),
  options: Joi.object({
    genre: Joi.string().valid('fantasy', 'sci-fi', 'mystery', 'romance', 'horror', 'historical', 'adventure').optional(),
    tone: Joi.string().valid('serious', 'humorous', 'mysterious', 'romantic').optional(),
    length: Joi.string().valid('short', 'medium', 'long').optional(),
    branchingComplexity: Joi.number().min(2).max(10).optional(),
    domain: Joi.string().valid('general', 'gaming', 'education', 'therapy').optional(),
    emotionalState: Joi.string().optional()
  }).optional()
});

// Validation middleware
const validateAuthInput = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: error.details[0].message 
    });
  }
  next();
};

const validateStoryInput = (req, res, next) => {
  const { error } = storySchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: error.details[0].message 
    });
  }
  next();
};

const validateAIGenerateInput = (req, res, next) => {
  const { error } = aiGenerateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: error.details[0].message 
    });
  }
  next();
};

// Sanitize input
const sanitizeInput = (req, res, next) => {
  // Remove potentially dangerous characters
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+\s*=/gi, '');
  };

  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  req.body = sanitizeObject(req.body);
  next();
};

module.exports = {
  validateAuthInput,
  validateStoryInput,
  validateAIGenerateInput,
  sanitizeInput,
  registerSchema,
  loginSchema,
  storySchema,
  aiGenerateSchema
};