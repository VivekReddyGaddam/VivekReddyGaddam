const Sentiment = require('sentiment');
const { aiService } = require('./aiService');

class PersonalizationService {
  constructor() {
    this.sentiment = new Sentiment();
    this.userProfiles = new Map(); // In production, this would be stored in database
    this.isInitialized = false;
  }

  async initialize() {
    try {
      this.isInitialized = true;
      console.log('✅ Personalization Service initialized successfully');
    } catch (error) {
      console.error('❌ Personalization Service initialization failed:', error);
      throw error;
    }
  }

  async analyzeUserSentiment(userInput) {
    try {
      const result = this.sentiment.analyze(userInput);
      
      return {
        score: result.score,
        comparative: result.comparative,
        positive: result.positive,
        negative: result.negative,
        neutral: result.neutral,
        emotionalState: this.determineEmotionalState(result.comparative)
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return {
        score: 0,
        comparative: 0,
        positive: [],
        negative: [],
        neutral: [],
        emotionalState: 'neutral'
      };
    }
  }

  determineEmotionalState(comparative) {
    if (comparative > 0.1) return 'positive';
    if (comparative < -0.1) return 'negative';
    return 'neutral';
  }

  async adaptStoryToUser(storyContent, userProfile, emotionalState, domain = 'general') {
    try {
      const adaptations = {
        gaming: this.adaptForGaming(storyContent, userProfile, emotionalState),
        education: this.adaptForEducation(storyContent, userProfile, emotionalState),
        therapy: this.adaptForTherapy(storyContent, userProfile, emotionalState),
        general: this.adaptForGeneral(storyContent, userProfile, emotionalState)
      };

      return adaptations[domain] || adaptations.general;
    } catch (error) {
      console.error('Story adaptation error:', error);
      return storyContent;
    }
  }

  adaptForGaming(storyContent, userProfile, emotionalState) {
    const adaptations = {
      positive: {
        tone: 'exciting',
        elements: ['victory', 'achievement', 'power', 'success'],
        suggestions: ['Add more action sequences', 'Include character progression', 'Add rewards']
      },
      negative: {
        tone: 'challenging',
        elements: ['struggle', 'overcome', 'perseverance', 'growth'],
        suggestions: ['Add difficulty spikes', 'Include character development', 'Add meaningful choices']
      },
      neutral: {
        tone: 'balanced',
        elements: ['exploration', 'discovery', 'choice', 'agency'],
        suggestions: ['Add exploration opportunities', 'Include multiple paths', 'Add character customization']
      }
    };

    const adaptation = adaptations[emotionalState] || adaptations.neutral;
    
    return {
      content: storyContent,
      adaptations: adaptation,
      gamification: {
        experiencePoints: this.calculateXP(storyContent, emotionalState),
        achievements: this.suggestAchievements(storyContent, emotionalState),
        choices: this.enhanceChoices(storyContent, emotionalState)
      }
    };
  }

  adaptForEducation(storyContent, userProfile, emotionalState) {
    const adaptations = {
      positive: {
        tone: 'encouraging',
        elements: ['learning', 'discovery', 'understanding', 'growth'],
        suggestions: ['Add educational content', 'Include learning objectives', 'Add knowledge checks']
      },
      negative: {
        tone: 'supportive',
        elements: ['guidance', 'help', 'support', 'encouragement'],
        suggestions: ['Add supportive elements', 'Include learning aids', 'Add encouragement']
      },
      neutral: {
        tone: 'informative',
        elements: ['facts', 'information', 'knowledge', 'understanding'],
        suggestions: ['Add factual content', 'Include explanations', 'Add context']
      }
    };

    const adaptation = adaptations[emotionalState] || adaptations.neutral;
    
    return {
      content: storyContent,
      adaptations: adaptation,
      educational: {
        learningObjectives: this.extractLearningObjectives(storyContent),
        difficulty: this.assessDifficulty(storyContent, userProfile),
        assessments: this.suggestAssessments(storyContent)
      }
    };
  }

  adaptForTherapy(storyContent, userProfile, emotionalState) {
    const adaptations = {
      positive: {
        tone: 'celebratory',
        elements: ['success', 'achievement', 'progress', 'healing'],
        suggestions: ['Emphasize positive outcomes', 'Include celebration', 'Add progress markers']
      },
      negative: {
        tone: 'gentle',
        elements: ['support', 'understanding', 'comfort', 'safety'],
        suggestions: ['Use gentle language', 'Add supportive elements', 'Include coping strategies']
      },
      neutral: {
        tone: 'calm',
        elements: ['reflection', 'understanding', 'growth', 'healing'],
        suggestions: ['Add reflective moments', 'Include therapeutic elements', 'Add mindfulness']
      }
    };

    const adaptation = adaptations[emotionalState] || adaptations.neutral;
    
    return {
      content: storyContent,
      adaptations: adaptation,
      therapeutic: {
        copingStrategies: this.suggestCopingStrategies(storyContent, emotionalState),
        triggers: this.identifyTriggers(storyContent),
        progress: this.trackProgress(storyContent, userProfile)
      }
    };
  }

  adaptForGeneral(storyContent, userProfile, emotionalState) {
    const adaptations = {
      positive: {
        tone: 'uplifting',
        elements: ['hope', 'joy', 'success', 'happiness'],
        suggestions: ['Add uplifting elements', 'Include positive outcomes', 'Add joyful moments']
      },
      negative: {
        tone: 'comforting',
        elements: ['comfort', 'support', 'understanding', 'empathy'],
        suggestions: ['Add comforting elements', 'Include supportive characters', 'Add empathy']
      },
      neutral: {
        tone: 'engaging',
        elements: ['interest', 'curiosity', 'engagement', 'entertainment'],
        suggestions: ['Add engaging elements', 'Include interesting details', 'Add entertainment']
      }
    };

    const adaptation = adaptations[emotionalState] || adaptations.neutral;
    
    return {
      content: storyContent,
      adaptations: adaptation
    };
  }

  calculateXP(storyContent, emotionalState) {
    const baseXP = 100;
    const emotionalMultiplier = {
      positive: 1.2,
      negative: 1.0,
      neutral: 1.1
    };
    
    const wordCount = storyContent.split(' ').length;
    const complexityBonus = Math.min(wordCount / 10, 50);
    
    return Math.round(baseXP * emotionalMultiplier[emotionalState] + complexityBonus);
  }

  suggestAchievements(storyContent, emotionalState) {
    const achievements = [];
    
    if (storyContent.toLowerCase().includes('victory')) {
      achievements.push('Victory Achieved');
    }
    
    if (storyContent.toLowerCase().includes('choice')) {
      achievements.push('Decision Maker');
    }
    
    if (emotionalState === 'positive') {
      achievements.push('Optimist');
    }
    
    return achievements;
  }

  enhanceChoices(storyContent, emotionalState) {
    const enhancements = {
      positive: {
        style: 'bold',
        effects: ['positive_outcome', 'character_growth'],
        rewards: ['xp_bonus', 'item_reward']
      },
      negative: {
        style: 'cautious',
        effects: ['risk_assessment', 'consequence_awareness'],
        rewards: ['wisdom_gain', 'experience']
      },
      neutral: {
        style: 'balanced',
        effects: ['exploration', 'discovery'],
        rewards: ['knowledge', 'understanding']
      }
    };
    
    return enhancements[emotionalState] || enhancements.neutral;
  }

  extractLearningObjectives(storyContent) {
    const objectives = [];
    
    // Simple keyword-based extraction
    if (storyContent.toLowerCase().includes('learn')) {
      objectives.push('Knowledge Acquisition');
    }
    
    if (storyContent.toLowerCase().includes('understand')) {
      objectives.push('Comprehension');
    }
    
    if (storyContent.toLowerCase().includes('apply')) {
      objectives.push('Application');
    }
    
    return objectives;
  }

  assessDifficulty(storyContent, userProfile) {
    const wordCount = storyContent.split(' ').length;
    const complexityScore = wordCount / 100;
    
    // Adjust based on user's reading level
    const userLevel = userProfile.readingLevel || 'intermediate';
    const levelMultipliers = {
      beginner: 1.5,
      intermediate: 1.0,
      advanced: 0.7
    };
    
    const adjustedScore = complexityScore * levelMultipliers[userLevel];
    
    if (adjustedScore < 0.5) return 'easy';
    if (adjustedScore < 1.0) return 'medium';
    return 'hard';
  }

  suggestAssessments(storyContent) {
    const assessments = [];
    
    if (storyContent.toLowerCase().includes('character')) {
      assessments.push('Character Analysis');
    }
    
    if (storyContent.toLowerCase().includes('plot')) {
      assessments.push('Plot Comprehension');
    }
    
    if (storyContent.toLowerCase().includes('theme')) {
      assessments.push('Theme Identification');
    }
    
    return assessments;
  }

  suggestCopingStrategies(storyContent, emotionalState) {
    const strategies = [];
    
    if (emotionalState === 'negative') {
      strategies.push('Deep Breathing');
      strategies.push('Positive Self-Talk');
      strategies.push('Mindfulness');
    }
    
    if (storyContent.toLowerCase().includes('stress')) {
      strategies.push('Stress Management');
    }
    
    if (storyContent.toLowerCase().includes('anxiety')) {
      strategies.push('Anxiety Reduction');
    }
    
    return strategies;
  }

  identifyTriggers(storyContent) {
    const triggers = [];
    const triggerKeywords = {
      violence: ['fight', 'battle', 'war', 'violence'],
      trauma: ['death', 'loss', 'trauma', 'pain'],
      anxiety: ['fear', 'worry', 'anxiety', 'panic']
    };
    
    Object.entries(triggerKeywords).forEach(([trigger, keywords]) => {
      if (keywords.some(keyword => storyContent.toLowerCase().includes(keyword))) {
        triggers.push(trigger);
      }
    });
    
    return triggers;
  }

  trackProgress(storyContent, userProfile) {
    const progress = {
      emotionalGrowth: this.assessEmotionalGrowth(storyContent),
      copingSkills: this.assessCopingSkills(storyContent),
      selfAwareness: this.assessSelfAwareness(storyContent)
    };
    
    return progress;
  }

  assessEmotionalGrowth(storyContent) {
    const growthKeywords = ['growth', 'development', 'progress', 'improvement'];
    const growthCount = growthKeywords.filter(keyword => 
      storyContent.toLowerCase().includes(keyword)
    ).length;
    
    return Math.min(growthCount / growthKeywords.length, 1);
  }

  assessCopingSkills(storyContent) {
    const copingKeywords = ['cope', 'handle', 'manage', 'deal'];
    const copingCount = copingKeywords.filter(keyword => 
      storyContent.toLowerCase().includes(keyword)
    ).length;
    
    return Math.min(copingCount / copingKeywords.length, 1);
  }

  assessSelfAwareness(storyContent) {
    const awarenessKeywords = ['understand', 'realize', 'recognize', 'aware'];
    const awarenessCount = awarenessKeywords.filter(keyword => 
      storyContent.toLowerCase().includes(keyword)
    ).length;
    
    return Math.min(awarenessCount / awarenessKeywords.length, 1);
  }

  async updateUserProfile(userId, interactionData) {
    try {
      const profile = this.userProfiles.get(userId) || {
        userId,
        preferences: {},
        emotionalHistory: [],
        readingLevel: 'intermediate',
        interests: [],
        createdAt: new Date()
      };

      // Update preferences based on interactions
      if (interactionData.genre) {
        profile.preferences.favoriteGenres = profile.preferences.favoriteGenres || [];
        if (!profile.preferences.favoriteGenres.includes(interactionData.genre)) {
          profile.preferences.favoriteGenres.push(interactionData.genre);
        }
      }

      if (interactionData.emotionalState) {
        profile.emotionalHistory.push({
          state: interactionData.emotionalState,
          timestamp: new Date(),
          context: interactionData.context || ''
        });
      }

      // Keep only last 100 emotional states
      if (profile.emotionalHistory.length > 100) {
        profile.emotionalHistory = profile.emotionalHistory.slice(-100);
      }

      this.userProfiles.set(userId, profile);
      
      return profile;
    } catch (error) {
      console.error('User profile update error:', error);
      throw error;
    }
  }

  async getUserProfile(userId) {
    return this.userProfiles.get(userId) || {
      userId,
      preferences: {},
      emotionalHistory: [],
      readingLevel: 'intermediate',
      interests: [],
      createdAt: new Date()
    };
  }
}

const personalizationService = new PersonalizationService();

const initializePersonalization = async () => {
  await personalizationService.initialize();
};

module.exports = { personalizationService, initializePersonalization };