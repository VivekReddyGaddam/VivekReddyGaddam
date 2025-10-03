const mongoose = require('mongoose');

const choiceSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  action: {
    type: String,
    enum: ['continue', 'combat', 'dialogue', 'explore', 'escape', 'action', 'observe'],
    default: 'continue'
  },
  nextNodeId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  conditions: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  }
});

const nodeSchema = new mongoose.Schema({
  storyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: true
  },
  nodeId: {
    type: String,
    required: true
  },
  parentNodeId: {
    type: String,
    default: null
  },
  text: {
    type: String,
    required: true
  },
  choices: [choiceSchema],
  metadata: {
    genre: {
      type: String,
      enum: ['fantasy', 'sci-fi', 'mystery', 'romance', 'horror', 'historical', 'adventure'],
      default: 'fantasy'
    },
    tone: {
      type: String,
      enum: ['serious', 'humorous', 'mysterious', 'romantic'],
      default: 'serious'
    },
    length: {
      type: String,
      enum: ['short', 'medium', 'long'],
      default: 'medium'
    },
    domain: {
      type: String,
      enum: ['general', 'gaming', 'education', 'therapy'],
      default: 'general'
    },
    emotionalState: {
      type: String,
      default: 'neutral'
    },
    wordCount: {
      type: Number,
      default: 0
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  context: {
    characters: [{
      name: String,
      description: String,
      status: {
        type: String,
        enum: ['alive', 'dead', 'missing', 'unknown'],
        default: 'alive'
      },
      inventory: [String],
      relationships: Map
    }],
    setting: String,
    previousEvents: [String],
    worldState: Map
  },
  isEndNode: {
    type: Boolean,
    default: false
  },
  isStartNode: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  genre: {
    type: String,
    enum: ['fantasy', 'sci-fi', 'mystery', 'romance', 'horror', 'historical', 'adventure'],
    required: true
  },
  tone: {
    type: String,
    enum: ['serious', 'humorous', 'mysterious', 'romantic'],
    required: true
  },
  domain: {
    type: String,
    enum: ['general', 'gaming', 'education', 'therapy'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['private', 'public', 'unlisted'],
    default: 'private'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  coverImage: {
    type: String,
    default: null
  },
  settings: {
    branchingComplexity: {
      type: Number,
      min: 2,
      max: 10,
      default: 3
    },
    maxLength: {
      type: Number,
      min: 100,
      max: 10000,
      default: 1000
    },
    allowUserInput: {
      type: Boolean,
      default: true
    },
    autoGenerate: {
      type: Boolean,
      default: false
    }
  },
  lore: {
    worldBuilding: {
      type: String,
      default: ''
    },
    characterProfiles: [{
      name: String,
      description: String,
      backstory: String,
      traits: [String],
      goals: [String]
    }],
    rules: [String],
    history: String
  },
  stats: {
    totalNodes: {
      type: Number,
      default: 0
    },
    totalChoices: {
      type: Number,
      default: 0
    },
    playCount: {
      type: Number,
      default: 0
    },
    averagePlayTime: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    lastPlayed: {
      type: Date,
      default: null
    }
  },
  startNodeId: {
    type: String,
    default: null
  },
  endNodeIds: [String],
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateCategory: {
    type: String,
    enum: ['adventure', 'mystery', 'romance', 'educational', 'therapeutic'],
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
storySchema.index({ userId: 1, createdAt: -1 });
storySchema.index({ status: 1, visibility: 1 });
storySchema.index({ genre: 1, domain: 1 });
storySchema.index({ tags: 1 });

nodeSchema.index({ storyId: 1, nodeId: 1 });
nodeSchema.index({ storyId: 1, parentNodeId: 1 });

// Virtual for story URL
storySchema.virtual('url').get(function() {
  return `/stories/${this._id}`;
});

// Method to get story tree structure
storySchema.methods.getStoryTree = async function() {
  const nodes = await this.constructor.db.collection('storynodes').find({ storyId: this._id }).toArray();
  
  const buildTree = (parentId = null) => {
    return nodes
      .filter(node => node.parentNodeId === parentId)
      .map(node => ({
        ...node,
        children: buildTree(node.nodeId)
      }));
  };
  
  return buildTree();
};

// Method to update story stats
storySchema.methods.updateStats = async function() {
  const nodeCount = await mongoose.model('StoryNode').countDocuments({ storyId: this._id });
  const choiceCount = await mongoose.model('StoryNode').aggregate([
    { $match: { storyId: this._id } },
    { $project: { choiceCount: { $size: '$choices' } } },
    { $group: { _id: null, total: { $sum: '$choiceCount' } } }
  ]);
  
  this.stats.totalNodes = nodeCount;
  this.stats.totalChoices = choiceCount[0]?.total || 0;
  
  return this.save();
};

// Method to check if story is complete
storySchema.methods.isComplete = function() {
  return this.status === 'completed' && this.endNodeIds.length > 0;
};

// Method to get story summary
storySchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    genre: this.genre,
    tone: this.tone,
    domain: this.domain,
    status: this.status,
    visibility: this.visibility,
    tags: this.tags,
    stats: this.stats,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = {
  Story: mongoose.model('Story', storySchema),
  StoryNode: mongoose.model('StoryNode', nodeSchema)
};