const mongoose = require('mongoose');

const choiceSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true
  },
  toNodeId: {
    type: String,
    required: true
  }
});

const nodeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000
  },
  choices: [choiceSchema],
  metadata: {
    emotionalTone: String,
    importance: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    }
  }
});

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  initialPrompt: {
    type: String,
    required: true,
    maxlength: 500
  },
  parameters: {
    genre: {
      type: String,
      enum: ['fantasy', 'sci-fi', 'historical', 'mystery', 'horror', 'romance', 'cyberpunk'],
      required: true
    },
    tone: {
      type: String,
      enum: ['serious', 'humorous', 'dark', 'lighthearted'],
      required: true
    },
    length: {
      type: String,
      enum: ['short', 'medium', 'long'],
      default: 'medium'
    },
    branchingComplexity: {
      type: Number,
      min: 3,
      max: 10,
      default: 5
    },
    emotionalIntensity: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    }
  },
  domain: {
    type: String,
    enum: ['gaming', 'education', 'therapy', 'general'],
    default: 'general'
  },
  nodes: [nodeSchema],
  currentNodeId: {
    type: String,
    default: 'node-0'
  },
  worldState: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  loreBook: {
    type: String,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  plays: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
storySchema.index({ author: 1, createdAt: -1 });
storySchema.index({ isPublic: 1, plays: -1 });
storySchema.index({ 'parameters.genre': 1 });

// Export story as JSON
storySchema.methods.exportJSON = function() {
  return {
    title: this.title,
    initialPrompt: this.initialPrompt,
    parameters: this.parameters,
    nodes: this.nodes,
    loreBook: this.loreBook,
    worldState: Object.fromEntries(this.worldState)
  };
};

module.exports = mongoose.model('Story', storySchema);
