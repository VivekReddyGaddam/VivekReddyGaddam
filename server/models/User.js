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
    required: function() {
      return !this.oauthProvider;
    }
  },
  name: {
    type: String,
    required: true
  },
  oauthProvider: {
    type: String,
    enum: ['google', 'apple', null],
    default: null
  },
  oauthId: {
    type: String,
    sparse: true
  },
  subscription: {
    tier: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    storiesPerMonth: {
      type: Number,
      default: 5
    },
    storiesUsed: {
      type: Number,
      default: 0
    },
    resetDate: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  },
  preferences: {
    defaultGenre: {
      type: String,
      enum: ['fantasy', 'sci-fi', 'historical', 'mystery', 'horror', 'romance'],
      default: 'fantasy'
    },
    defaultTone: {
      type: String,
      enum: ['serious', 'humorous', 'dark', 'lighthearted'],
      default: 'serious'
    },
    emotionalIntensity: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Reset monthly story limit
userSchema.methods.resetMonthlyLimit = function() {
  const now = new Date();
  if (now > this.subscription.resetDate) {
    this.subscription.storiesUsed = 0;
    this.subscription.resetDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return this.save();
  }
};

module.exports = mongoose.model('User', userSchema);
