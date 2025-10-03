const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  story: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story',
    required: true
  },
  currentNodeId: {
    type: String,
    required: true
  },
  path: [{
    nodeId: String,
    choiceLabel: String,
    timestamp: Date
  }],
  worldState: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  emotionalState: {
    sentiment: {
      type: Number,
      min: -1,
      max: 1,
      default: 0
    },
    lastUpdated: Date
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for active sessions
sessionSchema.index({ user: 1, isActive: 1 });
sessionSchema.index({ story: 1, createdAt: -1 });

module.exports = mongoose.model('Session', sessionSchema);
