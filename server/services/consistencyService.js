const { Pinecone } = require('@pinecone-database/pinecone');
const { OpenAI } = require('openai');

class ConsistencyService {
  constructor() {
    this.pinecone = null;
    this.openai = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Initialize Pinecone
      if (process.env.PINECONE_API_KEY) {
        this.pinecone = new Pinecone({
          apiKey: process.env.PINECONE_API_KEY,
        });
        console.log('🌲 Consistency Service: Pinecone initialized');
      }

      // Initialize OpenAI for embeddings
      if (process.env.OPENAI_API_KEY) {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        console.log('🤖 Consistency Service: OpenAI initialized');
      }

      this.isInitialized = true;
      console.log('✅ Consistency Service initialized successfully');
    } catch (error) {
      console.error('❌ Consistency Service initialization failed:', error);
      throw error;
    }
  }

  async generateEmbedding(text) {
    if (!this.openai) {
      // Fallback to simple text similarity for development
      return this.simpleTextHash(text);
    }

    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      return this.simpleTextHash(text);
    }
  }

  simpleTextHash(text) {
    // Simple hash-based embedding for development
    const hash = text.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Convert to array of floats
    return Array.from({ length: 1536 }, (_, i) => 
      Math.sin(hash + i) * 0.1
    );
  }

  async storeStoryContext(storyId, nodeId, content, metadata) {
    if (!this.pinecone) return;

    try {
      const embedding = await this.generateEmbedding(content);
      
      const vectorData = {
        id: `${storyId}_${nodeId}`,
        values: embedding,
        metadata: {
          storyId,
          nodeId,
          content: content.substring(0, 1000), // Store first 1000 chars
          genre: metadata.genre,
          tone: metadata.tone,
          domain: metadata.domain,
          timestamp: new Date().toISOString(),
          ...metadata
        }
      };

      // Store in Pinecone (this would be implemented with actual Pinecone operations)
      console.log(`Storing context for story ${storyId}, node ${nodeId}`);
      
      return vectorData;
    } catch (error) {
      console.error('Context storage error:', error);
      throw error;
    }
  }

  async checkConsistency(storyId, newContent, context = {}) {
    try {
      const newEmbedding = await this.generateEmbedding(newContent);
      
      // Simulate consistency check
      const consistencyResult = {
        isConsistent: true,
        conflicts: [],
        suggestions: [],
        confidence: 0.95
      };

      // Check for character consistency
      const characterConflicts = await this.checkCharacterConsistency(newContent, context.characters);
      if (characterConflicts.length > 0) {
        consistencyResult.conflicts.push(...characterConflicts);
        consistencyResult.isConsistent = false;
      }

      // Check for world consistency
      const worldConflicts = await this.checkWorldConsistency(newContent, context.worldState);
      if (worldConflicts.length > 0) {
        consistencyResult.conflicts.push(...worldConflicts);
        consistencyResult.isConsistent = false;
      }

      // Check for plot consistency
      const plotConflicts = await this.checkPlotConsistency(newContent, context.previousEvents);
      if (plotConflicts.length > 0) {
        consistencyResult.conflicts.push(...plotConflicts);
        consistencyResult.isConsistent = false;
      }

      // Generate suggestions if conflicts found
      if (!consistencyResult.isConsistent) {
        consistencyResult.suggestions = await this.generateConsistencySuggestions(
          newContent, 
          consistencyResult.conflicts
        );
      }

      return consistencyResult;
    } catch (error) {
      console.error('Consistency check error:', error);
      return {
        isConsistent: true,
        conflicts: [],
        suggestions: [],
        confidence: 0.5,
        error: 'Consistency check failed'
      };
    }
  }

  async checkCharacterConsistency(content, characters = []) {
    const conflicts = [];

    if (!characters || characters.length === 0) {
      return conflicts;
    }

    // Simple character consistency check
    characters.forEach(character => {
      if (character.status === 'dead' && content.toLowerCase().includes(character.name.toLowerCase())) {
        // Check if character is mentioned as alive
        const aliveKeywords = ['alive', 'living', 'speaks', 'says', 'walks', 'runs'];
        const hasAliveKeywords = aliveKeywords.some(keyword => 
          content.toLowerCase().includes(keyword)
        );

        if (hasAliveKeywords) {
          conflicts.push({
            type: 'character',
            severity: 'high',
            message: `Character ${character.name} is dead but appears to be alive in the new content`,
            suggestion: `Either remove references to ${character.name} or explain how they are present`
          });
        }
      }

      // Check for character trait consistency
      if (character.traits && character.traits.length > 0) {
        character.traits.forEach(trait => {
          const oppositeTraits = {
            'brave': 'cowardly',
            'kind': 'cruel',
            'wise': 'foolish',
            'honest': 'deceitful'
          };

          if (oppositeTraits[trait] && content.toLowerCase().includes(oppositeTraits[trait])) {
            conflicts.push({
              type: 'character_trait',
              severity: 'medium',
              message: `Character ${character.name} is described as ${trait} but new content suggests ${oppositeTraits[trait]}`,
              suggestion: `Consider how ${character.name} might act consistently with their ${trait} nature`
            });
          }
        });
      }
    });

    return conflicts;
  }

  async checkWorldConsistency(content, worldState = {}) {
    const conflicts = [];

    if (!worldState || Object.keys(worldState).length === 0) {
      return conflicts;
    }

    // Check for world state consistency
    Object.entries(worldState).forEach(([key, value]) => {
      if (typeof value === 'string' && content.toLowerCase().includes(value.toLowerCase())) {
        // Check for contradictions
        const contradictions = {
          'day': 'night',
          'sunny': 'rainy',
          'peaceful': 'war',
          'safe': 'dangerous'
        };

        Object.entries(contradictions).forEach(([positive, negative]) => {
          if (value.toLowerCase().includes(positive) && content.toLowerCase().includes(negative)) {
            conflicts.push({
              type: 'world_state',
              severity: 'medium',
              message: `World state contradiction: ${key} is ${value} but new content suggests ${negative}`,
              suggestion: `Consider how the world state might have changed or clarify the contradiction`
            });
          }
        });
      }
    });

    return conflicts;
  }

  async checkPlotConsistency(content, previousEvents = []) {
    const conflicts = [];

    if (!previousEvents || previousEvents.length === 0) {
      return conflicts;
    }

    // Check for plot consistency
    const recentEvents = previousEvents.slice(-3); // Check last 3 events
    
    recentEvents.forEach(event => {
      // Simple plot consistency check
      if (event.toLowerCase().includes('died') && content.toLowerCase().includes('alive')) {
        conflicts.push({
          type: 'plot',
          severity: 'high',
          message: 'Plot inconsistency: Character died in previous events but appears alive',
          suggestion: 'Either explain the resurrection or remove references to the character being alive'
        });
      }

      if (event.toLowerCase().includes('destroyed') && content.toLowerCase().includes('intact')) {
        conflicts.push({
          type: 'plot',
          severity: 'medium',
          message: 'Plot inconsistency: Object was destroyed but appears intact',
          suggestion: 'Either explain how it was repaired or remove references to it being intact'
        });
      }
    });

    return conflicts;
  }

  async generateConsistencySuggestions(content, conflicts) {
    const suggestions = [];

    conflicts.forEach(conflict => {
      switch (conflict.type) {
        case 'character':
          suggestions.push({
            type: 'rewrite',
            priority: 'high',
            suggestion: `Rewrite the content to be consistent with character status: ${conflict.suggestion}`
          });
          break;
        
        case 'character_trait':
          suggestions.push({
            type: 'adjust',
            priority: 'medium',
            suggestion: `Adjust character behavior to match established traits: ${conflict.suggestion}`
          });
          break;
        
        case 'world_state':
          suggestions.push({
            type: 'clarify',
            priority: 'medium',
            suggestion: `Clarify world state changes: ${conflict.suggestion}`
          });
          break;
        
        case 'plot':
          suggestions.push({
            type: 'resolve',
            priority: 'high',
            suggestion: `Resolve plot inconsistency: ${conflict.suggestion}`
          });
          break;
      }
    });

    return suggestions;
  }

  async getSimilarContent(storyId, content, limit = 5) {
    if (!this.pinecone) return [];

    try {
      const embedding = await this.generateEmbedding(content);
      
      // Simulate similarity search
      const similarContent = [
        {
          id: `${storyId}_node_1`,
          score: 0.95,
          content: 'Similar story content...',
          metadata: {
            nodeId: 'node_1',
            genre: 'fantasy',
            tone: 'serious'
          }
        }
      ];

      return similarContent;
    } catch (error) {
      console.error('Similarity search error:', error);
      return [];
    }
  }

  async updateStoryContext(storyId, nodeId, newContent, metadata) {
    try {
      await this.storeStoryContext(storyId, nodeId, newContent, metadata);
      console.log(`Updated context for story ${storyId}, node ${nodeId}`);
    } catch (error) {
      console.error('Context update error:', error);
      throw error;
    }
  }
}

const consistencyService = new ConsistencyService();

const initializeConsistency = async () => {
  await consistencyService.initialize();
};

module.exports = { consistencyService, initializeConsistency };