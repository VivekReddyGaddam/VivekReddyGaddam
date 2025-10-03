const aiService = require('./aiService');
const Story = require('../models/Story');
const { v4: uuidv4 } = require('uuid');

class NarrativeEngine {
  /**
   * Create a new story with initial segment
   */
  async createStory(userId, storyData) {
    try {
      const { initialPrompt, parameters, domain, loreBook } = storyData;

      // Generate initial story segment
      const initialSegment = await aiService.generateStorySegment({
        prompt: initialPrompt,
        genre: parameters.genre,
        tone: parameters.tone,
        emotionalIntensity: parameters.emotionalIntensity,
        worldState: {},
        loreBook: loreBook || '',
        previousText: null,
        branchingComplexity: parameters.branchingComplexity
      });

      // Create initial node
      const initialNode = {
        id: 'node-0',
        text: initialSegment.text,
        choices: initialSegment.choices.map((choice, idx) => ({
          label: choice.label,
          toNodeId: `node-pending-${idx}`
        })),
        metadata: {
          emotionalTone: parameters.tone,
          importance: 10
        }
      };

      // Create story document
      const story = new Story({
        title: this._generateTitle(initialPrompt, parameters.genre),
        author: userId,
        initialPrompt,
        parameters,
        domain,
        nodes: [initialNode],
        currentNodeId: 'node-0',
        worldState: new Map(),
        loreBook: loreBook || '',
        status: 'active'
      });

      await story.save();

      return story;
    } catch (error) {
      console.error('Create Story Error:', error);
      throw new Error('Failed to create story');
    }
  }

  /**
   * Generate next story segment based on choice
   */
  async generateNextSegment(storyId, currentNodeId, choiceIndex, userId) {
    try {
      const story = await Story.findById(storyId);
      
      if (!story) {
        throw new Error('Story not found');
      }

      // Find current node
      const currentNode = story.nodes.find(n => n.id === currentNodeId);
      if (!currentNode) {
        throw new Error('Current node not found');
      }

      // Get selected choice
      const selectedChoice = currentNode.choices[choiceIndex];
      if (!selectedChoice) {
        throw new Error('Invalid choice');
      }

      // Check if target node already exists
      let targetNode = story.nodes.find(n => n.id === selectedChoice.toNodeId);
      
      if (!targetNode) {
        // Generate new segment
        const previousText = currentNode.text;
        const contextPrompt = `The reader chose: "${selectedChoice.label}". Continue the story from this choice.`;

        const newSegment = await aiService.generateStorySegment({
          prompt: contextPrompt,
          genre: story.parameters.genre,
          tone: story.parameters.tone,
          emotionalIntensity: story.parameters.emotionalIntensity,
          worldState: Object.fromEntries(story.worldState),
          loreBook: story.loreBook,
          previousText,
          branchingComplexity: story.parameters.branchingComplexity
        });

        // Check consistency
        const consistencyCheck = await aiService.checkConsistency(
          newSegment.text,
          Object.fromEntries(story.worldState)
        );

        if (!consistencyCheck.isConsistent) {
          console.warn('Consistency issues detected:', consistencyCheck.conflicts);
          // Could implement auto-correction here
        }

        // Create new node
        const newNodeId = `node-${uuidv4()}`;
        targetNode = {
          id: newNodeId,
          text: newSegment.text,
          choices: newSegment.choices.map((choice, idx) => ({
            label: choice.label,
            toNodeId: `node-pending-${newNodeId}-${idx}`
          })),
          metadata: {
            emotionalTone: story.parameters.tone,
            importance: 5
          }
        };

        // Update the choice to point to the new node
        selectedChoice.toNodeId = newNodeId;
        story.nodes.push(targetNode);
      }

      // Update current node and save
      story.currentNodeId = targetNode.id;
      story.updatedAt = Date.now();
      await story.save();

      return {
        node: targetNode,
        story: story
      };
    } catch (error) {
      console.error('Generate Next Segment Error:', error);
      throw new Error('Failed to generate next segment');
    }
  }

  /**
   * Update world state based on story events
   */
  async updateWorldState(storyId, updates) {
    try {
      const story = await Story.findById(storyId);
      if (!story) {
        throw new Error('Story not found');
      }

      // Merge updates into world state
      for (const [key, value] of Object.entries(updates)) {
        story.worldState.set(key, value);
      }

      await story.save();
      return story.worldState;
    } catch (error) {
      console.error('Update World State Error:', error);
      throw error;
    }
  }

  /**
   * Get story tree visualization data
   */
  getStoryTree(story) {
    const nodes = story.nodes.map(node => ({
      id: node.id,
      text: node.text.substring(0, 100) + '...',
      choices: node.choices.length
    }));

    const edges = [];
    story.nodes.forEach(node => {
      node.choices.forEach(choice => {
        edges.push({
          from: node.id,
          to: choice.toNodeId,
          label: choice.label
        });
      });
    });

    return { nodes, edges };
  }

  /**
   * Generate story title from prompt
   */
  _generateTitle(prompt, genre) {
    const words = prompt.split(' ').slice(0, 5);
    const title = words.join(' ');
    return title.length > 50 ? title.substring(0, 47) + '...' : title;
  }
}

module.exports = new NarrativeEngine();
