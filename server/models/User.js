const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  preferences: {
    defaultGenre: {
      type: String,
      enum: ['fantasy', 'sci-fi', 'mystery', 'romance', 'horror', 'historical', 'adventure'],
      default: 'fantasy'
    },
    defaultTone: {
      type: String,
      enum: ['serious', 'humorous', 'mysterious', 'romantic'],
      default: 'serious'
    },
    defaultLength: {
      type: String,
      enum: ['short', 'medium', 'long'],
      default: 'medium'
    },
    voiceEnabled: {
      type: Boolean,
      default: false
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: false
      }
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: null
    },
    features: {
      maxStories: {
        type: Number,
        default: 5
      },
      maxBranches: {
        type: Number,
        default: 10
      },
      voiceGeneration: {
        type: Boolean,
        default: false
      },
      customDomains: {
        type: Boolean,
        default: false
      },
      apiAccess: {
        type: Boolean,
        default: false
      }
    }
  },
  stats: {
    storiesCreated: {
      type: Number,
      default: 0
    },
    totalPlayTime: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    default: null
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
    avatar: this.avatar,
    preferences: this.preferences,
    subscription: this.subscription,
    stats: this.stats,
    createdAt: this.createdAt
  };
};

// Check if user can create more stories
userSchema.methods.canCreateStory = function() {
  return this.stats.storiesCreated < this.subscription.features.maxStories;
};

// Update last active
userSchema.methods.updateLastActive = function() {
  this.stats.lastActive = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);