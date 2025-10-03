const { OpenAI } = require('openai');
const { HuggingFaceApi } = require('huggingface');
const { Pinecone } = require('@pinecone-database/pinecone');
const Sentiment = require('sentiment');

class AIService {
  constructor() {
    this.openai = null;
    this.huggingface = null;
    this.pinecone = null;
    this.sentiment = new Sentiment();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Initialize OpenAI
      if (process.env.OPENAI_API_KEY) {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        console.log('🤖 OpenAI initialized');
      }

      // Initialize Hugging Face
      if (process.env.HUGGINGFACE_API_KEY) {
        this.huggingface = new HuggingFaceApi({
          apiKey: process.env.HUGGINGFACE_API_KEY,
        });
        console.log('🤗 Hugging Face initialized');
      }

      // Initialize Pinecone
      if (process.env.PINECONE_API_KEY) {
        this.pinecone = new Pinecone({
          apiKey: process.env.PINECONE_API_KEY,
        });
        console.log('🌲 Pinecone initialized');
      }

      this.isInitialized = true;
      console.log('✅ AI Service initialized successfully');
    } catch (error) {
      console.error('❌ AI Service initialization failed:', error);
      throw error;
    }
  }

  async generateStorySegment(prompt, context = {}, options = {}) {
    if (!this.isInitialized) {
      throw new Error('AI Service not initialized');
    }

    const {
      genre = 'fantasy',
      tone = 'serious',
      length = 'medium',
      branchingComplexity = 3,
      domain = 'general',
      emotionalState = 'neutral'
    } = options;

    try {
      // Build the system prompt based on domain and context
      const systemPrompt = this.buildSystemPrompt(genre, tone, domain, context);
      
      // Build the user prompt with context
      const userPrompt = this.buildUserPrompt(prompt, context, emotionalState);

      let generatedText = '';
      
      if (this.openai) {
        generatedText = await this.generateWithOpenAI(systemPrompt, userPrompt, length);
      } else if (this.huggingface) {
        generatedText = await this.generateWithHuggingFace(userPrompt, length);
      } else {
        // Fallback to mock generation for development
        generatedText = this.generateMockStory(prompt, context);
      }

      // Extract choices from the generated text
      const choices = this.extractChoices(generatedText, branchingComplexity);
      
      // Clean the text (remove choice markers)
      const cleanText = this.cleanGeneratedText(generatedText);

      return {
        text: cleanText,
        choices: choices,
        metadata: {
          genre,
          tone,
          length,
          domain,
          emotionalState,
          timestamp: new Date().toISOString(),
          wordCount: cleanText.split(' ').length
        }
      };
    } catch (error) {
      console.error('Story generation error:', error);
      throw new Error('Failed to generate story segment');
    }
  }

  buildSystemPrompt(genre, tone, domain, context) {
    const basePrompt = `You are an expert storyteller creating interactive narrative content.`;
    
    const domainPrompts = {
      gaming: `Focus on action, adventure, and player agency. Include RPG elements like character stats, inventory, and quest objectives.`,
      education: `Ensure historical accuracy and educational value. Include factual information and learning objectives.`,
      therapy: `Use gentle, supportive language. Focus on emotional growth, coping strategies, and positive outcomes.`,
      general: `Create engaging, well-structured narratives with compelling characters and plot development.`
    };

    const tonePrompts = {
      serious: `Maintain a serious, dramatic tone throughout.`,
      humorous: `Include wit, humor, and light-hearted moments while maintaining narrative quality.`,
      mysterious: `Build suspense and intrigue with subtle hints and foreshadowing.`,
      romantic: `Focus on relationships, emotions, and character connections.`
    };

    return `${basePrompt}
    
Genre: ${genre}
Tone: ${tone}
Domain: ${domainPrompts[domain] || domainPrompts.general}
Style: ${tonePrompts[tone] || tonePrompts.serious}

Guidelines:
- Generate 200-500 words per segment
- End with 2-5 clear choice options in [Option 1: Description] format
- Maintain consistency with previous context
- Create engaging, immersive content
- Ensure choices lead to meaningful story branches`;
  }

  buildUserPrompt(prompt, context, emotionalState) {
    let userPrompt = `Create a story segment based on: "${prompt}"`;
    
    if (context.characters && context.characters.length > 0) {
      userPrompt += `\n\nCharacters: ${context.characters.map(c => `${c.name}: ${c.description}`).join(', ')}`;
    }
    
    if (context.setting) {
      userPrompt += `\n\nSetting: ${context.setting}`;
    }
    
    if (context.previousEvents && context.previousEvents.length > 0) {
      userPrompt += `\n\nPrevious events: ${context.previousEvents.join(', ')}`;
    }
    
    if (emotionalState !== 'neutral') {
      userPrompt += `\n\nEmotional tone: ${emotionalState}`;
    }
    
    return userPrompt;
  }

  async generateWithOpenAI(systemPrompt, userPrompt, length) {
    const maxTokens = length === 'short' ? 300 : length === 'long' ? 800 : 500;
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: maxTokens,
      temperature: 0.8,
      top_p: 0.9,
    });

    return response.choices[0].message.content;
  }

  async generateWithHuggingFace(prompt, length) {
    // This would use Hugging Face's text generation API
    // For now, return a placeholder
    return this.generateMockStory(prompt, {});
  }

  generateMockStory(prompt, context) {
    const mockStories = [
      `You find yourself standing at the edge of a mysterious forest. The ancient trees seem to whisper secrets in the wind, and you notice three distinct paths ahead. Each path promises adventure, but also danger.

The first path leads deeper into the dark woods, where shadows dance between the trees. The second path follows a winding stream that glistens in the moonlight. The third path climbs up a rocky hillside toward what appears to be an old tower.

[Option 1: Venture into the dark forest]
[Option 2: Follow the stream]
[Option 3: Climb toward the tower]
[Option 4: Turn back and return home]`,

      `The cyberpunk city sprawls before you, neon lights reflecting off the rain-soaked streets. You're a detective investigating a series of mysterious disappearances in the tech district. Your neural implant buzzes with incoming data, and you spot three potential leads.

A corporate security guard approaches, offering information in exchange for credits. A street vendor claims to have seen something suspicious near the old data center. Your contact at the police station has new evidence waiting for analysis.

[Option 1: Talk to the security guard]
[Option 2: Question the street vendor]
[Option 3: Visit the police station]
[Option 4: Investigate the data center directly]`,

      `In the magical academy, you're a student learning to master elemental magic. Today's lesson involves summoning creatures from other realms. Your instructor, Professor Elara, demonstrates a complex ritual, but something goes wrong.

The summoning circle begins to glow with an unstable energy, and three different magical creatures start to materialize. A fire elemental, a water spirit, and a wind sylph all appear simultaneously, creating chaos in the classroom.

[Option 1: Try to stabilize the fire elemental]
[Option 2: Focus on controlling the water spirit]
[Option 3: Attempt to calm the wind sylph]
[Option 4: Call for help from Professor Elara]`
    ];

    return mockStories[Math.floor(Math.random() * mockStories.length)];
  }

  extractChoices(text, maxChoices = 5) {
    const choiceRegex = /\[Option \d+: ([^\]]+)\]/g;
    const choices = [];
    let match;

    while ((match = choiceRegex.exec(text)) !== null && choices.length < maxChoices) {
      choices.push({
        id: choices.length + 1,
        text: match[1].trim(),
        action: this.generateActionFromChoice(match[1])
      });
    }

    // If no choices found, generate default ones
    if (choices.length === 0) {
      choices.push(
        { id: 1, text: "Continue the story", action: "continue" },
        { id: 2, text: "Explore further", action: "explore" }
      );
    }

    return choices;
  }

  generateActionFromChoice(choiceText) {
    const actionMap = {
      'fight': 'combat',
      'run': 'escape',
      'talk': 'dialogue',
      'investigate': 'explore',
      'use': 'action',
      'wait': 'observe'
    };

    const lowerText = choiceText.toLowerCase();
    for (const [keyword, action] of Object.entries(actionMap)) {
      if (lowerText.includes(keyword)) {
        return action;
      }
    }
    return 'continue';
  }

  cleanGeneratedText(text) {
    // Remove choice markers from the main text
    return text.replace(/\[Option \d+: [^\]]+\]/g, '').trim();
  }

  async analyzeSentiment(text) {
    const result = this.sentiment.analyze(text);
    return {
      score: result.score,
      comparative: result.comparative,
      positive: result.positive,
      negative: result.negative,
      neutral: result.neutral
    };
  }

  async checkConsistency(storyId, newContent, existingContext) {
    // This would implement consistency checking using vector similarity
    // For now, return a basic check
    return {
      isConsistent: true,
      conflicts: [],
      suggestions: []
    };
  }

  async storeInVectorDB(storyId, content, metadata) {
    if (!this.pinecone) return;
    
    try {
      // This would store content embeddings in Pinecone
      // For now, just log the action
      console.log(`Storing content in vector DB for story ${storyId}`);
    } catch (error) {
      console.error('Vector DB storage error:', error);
    }
  }
}

const aiService = new AIService();

const initializeAI = async () => {
  await aiService.initialize();
};

module.exports = { aiService, initializeAI };