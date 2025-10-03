const { HfInference } = require('@huggingface/inference');
const { getRedisClient } = require('../config/redis');

class AIService {
  constructor() {
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    this.redis = null;
  }

  async initialize() {
    this.redis = getRedisClient();
  }

  /**
   * Generate story segment using chain-of-thought prompting
   * @param {Object} params - Generation parameters
   * @returns {Object} Generated text and choices
   */
  async generateStorySegment(params) {
    const {
      prompt,
      genre,
      tone,
      emotionalIntensity,
      worldState,
      loreBook,
      previousText,
      branchingComplexity
    } = params;

    try {
      // Build context-aware prompt with chain-of-thought
      const systemPrompt = this._buildSystemPrompt(genre, tone, emotionalIntensity, loreBook);
      const contextPrompt = this._buildContextPrompt(worldState, previousText);
      const fullPrompt = `${systemPrompt}\n\n${contextPrompt}\n\n${prompt}\n\nGenerate a story segment (200-500 words) with ${branchingComplexity} choice points at the end.`;

      // Check cache
      const cacheKey = `story:${this._hashPrompt(fullPrompt)}`;
      if (this.redis) {
        const cached = await this.redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      // Generate with Hugging Face
      const response = await this.hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 600,
          temperature: 0.7,
          top_p: 0.9,
          return_full_text: false
        }
      });

      // Parse response and extract choices
      const result = this._parseGeneratedText(response.generated_text, branchingComplexity);

      // Cache result
      if (this.redis) {
        await this.redis.setEx(cacheKey, 3600, JSON.stringify(result));
      }

      return result;
    } catch (error) {
      console.error('AI Generation Error:', error);
      throw new Error('Failed to generate story segment');
    }
  }

  /**
   * Check for narrative consistency
   * @param {String} newText - New story segment
   * @param {Object} worldState - Current world state
   * @returns {Object} Consistency check result
   */
  async checkConsistency(newText, worldState) {
    try {
      const entities = this._extractEntities(worldState);
      const conflicts = [];

      // Check for basic conflicts
      for (const [key, value] of Object.entries(entities)) {
        if (value.status === 'dead' && newText.toLowerCase().includes(key.toLowerCase())) {
          const context = newText.match(new RegExp(`.{0,50}${key}.{0,50}`, 'i'));
          if (context && !context[0].toLowerCase().includes('memory') && 
              !context[0].toLowerCase().includes('ghost') &&
              !context[0].toLowerCase().includes('past')) {
            conflicts.push({
              type: 'character_state',
              entity: key,
              issue: `${key} is marked as dead but appears in the text`,
              severity: 'high'
            });
          }
        }
      }

      return {
        isConsistent: conflicts.length === 0,
        conflicts,
        confidence: conflicts.length === 0 ? 1.0 : 0.5
      };
    } catch (error) {
      console.error('Consistency Check Error:', error);
      return { isConsistent: true, conflicts: [], confidence: 0.8 };
    }
  }

  /**
   * Analyze sentiment for emotional adaptation
   * @param {String} text - User input text
   * @returns {Object} Sentiment analysis result
   */
  async analyzeSentiment(text) {
    try {
      const result = await this.hf.textClassification({
        model: 'distilbert-base-uncased-finetuned-sst-2-english',
        inputs: text
      });

      const sentiment = result[0].label === 'POSITIVE' ? result[0].score : -result[0].score;
      
      return {
        sentiment,
        label: result[0].label,
        confidence: result[0].score
      };
    } catch (error) {
      console.error('Sentiment Analysis Error:', error);
      return { sentiment: 0, label: 'NEUTRAL', confidence: 0.5 };
    }
  }

  /**
   * Build system prompt based on story parameters
   */
  _buildSystemPrompt(genre, tone, emotionalIntensity, loreBook) {
    let prompt = `You are a master storyteller creating an interactive ${genre} story with a ${tone} tone.`;
    
    if (emotionalIntensity > 7) {
      prompt += ' Create intense, emotionally charged scenes.';
    } else if (emotionalIntensity < 4) {
      prompt += ' Keep the emotional tone subdued and contemplative.';
    }

    if (loreBook) {
      prompt += `\n\nIMPORTANT LORE:\n${loreBook.substring(0, 500)}`;
    }

    prompt += '\n\nFollow these rules:\n';
    prompt += '1. Recall existing lore and maintain consistency\n';
    prompt += '2. Generate plot developments that feel natural\n';
    prompt += '3. Ensure emotional alignment with the established tone\n';
    prompt += '4. End with clear choice points for the reader\n';

    return prompt;
  }

  /**
   * Build context from world state and previous text
   */
  _buildContextPrompt(worldState, previousText) {
    let context = '';

    if (previousText) {
      context += `Previous scene:\n${previousText.substring(previousText.length - 300)}\n\n`;
    }

    if (worldState && Object.keys(worldState).length > 0) {
      context += 'Current world state:\n';
      for (const [key, value] of Object.entries(worldState)) {
        if (typeof value === 'object') {
          context += `- ${key}: ${JSON.stringify(value)}\n`;
        } else {
          context += `- ${key}: ${value}\n`;
        }
      }
    }

    return context;
  }

  /**
   * Parse generated text and extract choices
   */
  _parseGeneratedText(text, branchingComplexity) {
    // Find choice markers
    const choicePatterns = [
      /What do you do\?\s*([\s\S]*?)(?=\n\n|$)/i,
      /Choose:\s*([\s\S]*?)(?=\n\n|$)/i,
      /Options:\s*([\s\S]*?)(?=\n\n|$)/i,
      /\[Option \d+:(.*?)\]/gi
    ];

    let storyText = text;
    let choices = [];

    // Try to extract choices
    for (const pattern of choicePatterns) {
      const match = text.match(pattern);
      if (match) {
        const choiceText = match[0];
        storyText = text.replace(choiceText, '').trim();
        
        // Extract individual choices
        const optionMatches = choiceText.matchAll(/(?:Option \d+:|[\d]+\.|-)\s*(.+?)(?=(?:Option \d+:|\d+\.|-|$))/gi);
        for (const optionMatch of optionMatches) {
          if (optionMatch[1] && optionMatch[1].trim()) {
            choices.push(optionMatch[1].trim());
          }
        }
        break;
      }
    }

    // If no choices found, generate default ones
    if (choices.length < 2) {
      choices = [
        'Continue forward',
        'Look around carefully',
        'Talk to someone nearby'
      ];
    }

    // Limit to branchingComplexity
    choices = choices.slice(0, Math.min(branchingComplexity, 5));

    return {
      text: storyText.trim(),
      choices: choices.map((choice, idx) => ({
        id: `choice-${idx}`,
        label: choice
      }))
    };
  }

  /**
   * Extract entities from world state
   */
  _extractEntities(worldState) {
    const entities = {};
    
    if (worldState && typeof worldState === 'object') {
      for (const [key, value] of Object.entries(worldState)) {
        if (typeof value === 'object' && value !== null) {
          entities[key] = value;
        }
      }
    }

    return entities;
  }

  /**
   * Simple hash function for caching
   */
  _hashPrompt(prompt) {
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

module.exports = new AIService();
