const { aiService } = require('../services/aiService');

describe('AI Service', () => {
  beforeEach(() => {
    // Mock console.log to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateStorySegment', () => {
    it('should generate a story segment with valid structure', async () => {
      const prompt = 'A brave knight enters a dark forest';
      const context = {
        characters: [{ name: 'Knight', traits: ['brave', 'noble'] }],
        setting: 'Dark forest'
      };
      const options = {
        genre: 'fantasy',
        tone: 'serious',
        length: 'medium'
      };

      const result = await aiService.generateStorySegment(prompt, context, options);

      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('choices');
      expect(result).toHaveProperty('metadata');
      expect(result.text).toBeTruthy();
      expect(Array.isArray(result.choices)).toBe(true);
      expect(result.metadata).toHaveProperty('genre', 'fantasy');
      expect(result.metadata).toHaveProperty('tone', 'serious');
    });

    it('should handle empty prompt gracefully', async () => {
      const prompt = '';
      const result = await aiService.generateStorySegment(prompt);

      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('choices');
      expect(result.text).toBeTruthy();
    });

    it('should generate appropriate number of choices', async () => {
      const prompt = 'The hero faces a difficult decision';
      const options = { branchingComplexity: 4 };

      const result = await aiService.generateStorySegment(prompt, {}, options);

      expect(result.choices.length).toBeLessThanOrEqual(4);
      expect(result.choices.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('analyzeSentiment', () => {
    it('should analyze positive sentiment correctly', async () => {
      const text = 'I am so happy and excited about this amazing adventure!';
      const result = await aiService.analyzeSentiment(text);

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('comparative');
      expect(result).toHaveProperty('positive');
      expect(result).toHaveProperty('negative');
      expect(result.score).toBeGreaterThan(0);
    });

    it('should analyze negative sentiment correctly', async () => {
      const text = 'I am sad and disappointed about this terrible situation.';
      const result = await aiService.analyzeSentiment(text);

      expect(result).toHaveProperty('score');
      expect(result.score).toBeLessThan(0);
    });

    it('should handle neutral sentiment', async () => {
      const text = 'The weather is okay today.';
      const result = await aiService.analyzeSentiment(text);

      expect(result).toHaveProperty('score');
      expect(Math.abs(result.score)).toBeLessThan(1);
    });
  });

  describe('checkConsistency', () => {
    it('should check story consistency', async () => {
      const storyId = 'test-story-1';
      const content = 'The brave knight enters the castle';
      const context = {
        characters: [{ name: 'Knight', status: 'alive' }],
        worldState: { location: 'castle' }
      };

      const result = await aiService.checkConsistency(storyId, content, context);

      expect(result).toHaveProperty('isConsistent');
      expect(result).toHaveProperty('conflicts');
      expect(result).toHaveProperty('suggestions');
      expect(typeof result.isConsistent).toBe('boolean');
      expect(Array.isArray(result.conflicts)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should detect character inconsistencies', async () => {
      const storyId = 'test-story-2';
      const content = 'The brave knight speaks to the king';
      const context = {
        characters: [{ name: 'Knight', status: 'dead' }]
      };

      const result = await aiService.checkConsistency(storyId, content, context);

      expect(result.conflicts.length).toBeGreaterThan(0);
      expect(result.isConsistent).toBe(false);
    });
  });

  describe('extractChoices', () => {
    it('should extract choices from generated text', () => {
      const text = 'You stand at a crossroads. [Option 1: Go left] [Option 2: Go right] [Option 3: Go straight]';
      const choices = aiService.extractChoices(text, 3);

      expect(choices.length).toBe(3);
      expect(choices[0]).toHaveProperty('id');
      expect(choices[0]).toHaveProperty('text');
      expect(choices[0]).toHaveProperty('action');
    });

    it('should generate default choices when none found', () => {
      const text = 'This is a story without choices.';
      const choices = aiService.extractChoices(text, 3);

      expect(choices.length).toBeGreaterThan(0);
      expect(choices[0]).toHaveProperty('id');
      expect(choices[0]).toHaveProperty('text');
    });
  });

  describe('buildSystemPrompt', () => {
    it('should build appropriate system prompt for gaming domain', () => {
      const prompt = aiService.buildSystemPrompt('fantasy', 'serious', 'gaming', {});
      
      expect(prompt).toContain('gaming');
      expect(prompt).toContain('RPG');
      expect(prompt).toContain('player agency');
    });

    it('should build appropriate system prompt for education domain', () => {
      const prompt = aiService.buildSystemPrompt('historical', 'serious', 'education', {});
      
      expect(prompt).toContain('education');
      expect(prompt).toContain('historical accuracy');
      expect(prompt).toContain('learning objectives');
    });

    it('should build appropriate system prompt for therapy domain', () => {
      const prompt = aiService.buildSystemPrompt('general', 'serious', 'therapy', {});
      
      expect(prompt).toContain('therapy');
      expect(prompt).toContain('gentle');
      expect(prompt).toContain('supportive');
    });
  });
});