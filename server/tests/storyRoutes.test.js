const request = require('supertest');
const { app } = require('../index');
const { Story, StoryNode } = require('../models/Story');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('Story Routes', () => {
  let testUser;
  let authToken;
  let testStory;

  beforeAll(async () => {
    // Create test user
    testUser = new User({
      email: 'test@example.com',
      password: 'password123',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User'
    });
    await testUser.save();

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: 'test@example.com' });
    await Story.deleteMany({ userId: testUser._id });
    await StoryNode.deleteMany({});
  });

  beforeEach(async () => {
    // Create test story
    testStory = new Story({
      title: 'Test Story',
      description: 'A test story for unit testing',
      genre: 'fantasy',
      tone: 'serious',
      domain: 'general',
      userId: testUser._id,
      visibility: 'private'
    });
    await testStory.save();
  });

  afterEach(async () => {
    // Clean up test story
    await Story.deleteMany({ userId: testUser._id });
    await StoryNode.deleteMany({});
  });

  describe('POST /api/stories', () => {
    it('should create a new story', async () => {
      const storyData = {
        title: 'New Test Story',
        description: 'A new test story',
        genre: 'fantasy',
        tone: 'serious',
        domain: 'general',
        visibility: 'private'
      };

      const response = await request(app)
        .post('/api/stories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(storyData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe(storyData.title);
      expect(response.body.genre).toBe(storyData.genre);
      expect(response.body.userId).toBe(testUser._id.toString());
    });

    it('should require authentication', async () => {
      const storyData = {
        title: 'Unauthorized Story',
        genre: 'fantasy',
        tone: 'serious'
      };

      await request(app)
        .post('/api/stories')
        .send(storyData)
        .expect(401);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        title: '', // Empty title
        genre: 'invalid-genre' // Invalid genre
      };

      const response = await request(app)
        .post('/api/stories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/stories', () => {
    it('should get user stories', async () => {
      const response = await request(app)
        .get('/api/stories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('stories');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.stories)).toBe(true);
      expect(response.body.stories.length).toBeGreaterThan(0);
    });

    it('should filter stories by genre', async () => {
      const response = await request(app)
        .get('/api/stories?genre=fantasy')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.stories.every(story => story.genre === 'fantasy')).toBe(true);
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/stories?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.stories.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /api/stories/:id', () => {
    it('should get a specific story', async () => {
      const response = await request(app)
        .get(`/api/stories/${testStory._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id', testStory._id.toString());
      expect(response.body.title).toBe(testStory.title);
    });

    it('should return 404 for non-existent story', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      await request(app)
        .get(`/api/stories/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should deny access to private stories', async () => {
      // Create another user
      const otherUser = new User({
        email: 'other@example.com',
        password: 'password123',
        username: 'otheruser',
        firstName: 'Other',
        lastName: 'User'
      });
      await otherUser.save();

      const otherToken = jwt.sign(
        { userId: otherUser._id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      await request(app)
        .get(`/api/stories/${testStory._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      await User.deleteOne({ _id: otherUser._id });
    });
  });

  describe('PUT /api/stories/:id', () => {
    it('should update a story', async () => {
      const updateData = {
        title: 'Updated Test Story',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/stories/${testStory._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.description).toBe(updateData.description);
    });

    it('should require story ownership', async () => {
      const otherUser = new User({
        email: 'other@example.com',
        password: 'password123',
        username: 'otheruser',
        firstName: 'Other',
        lastName: 'User'
      });
      await otherUser.save();

      const otherToken = jwt.sign(
        { userId: otherUser._id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const updateData = { title: 'Unauthorized Update' };

      await request(app)
        .put(`/api/stories/${testStory._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(updateData)
        .expect(403);

      await User.deleteOne({ _id: otherUser._id });
    });
  });

  describe('DELETE /api/stories/:id', () => {
    it('should delete a story', async () => {
      await request(app)
        .delete(`/api/stories/${testStory._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify story is deleted
      const deletedStory = await Story.findById(testStory._id);
      expect(deletedStory).toBeNull();
    });

    it('should require story ownership', async () => {
      const otherUser = new User({
        email: 'other@example.com',
        password: 'password123',
        username: 'otheruser',
        firstName: 'Other',
        lastName: 'User'
      });
      await otherUser.save();

      const otherToken = jwt.sign(
        { userId: otherUser._id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      await request(app)
        .delete(`/api/stories/${testStory._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      await User.deleteOne({ _id: otherUser._id });
    });
  });

  describe('GET /api/stories/public', () => {
    it('should get public stories', async () => {
      // Create a public story
      const publicStory = new Story({
        title: 'Public Test Story',
        description: 'A public test story',
        genre: 'fantasy',
        tone: 'serious',
        domain: 'general',
        userId: testUser._id,
        visibility: 'public',
        status: 'active'
      });
      await publicStory.save();

      const response = await request(app)
        .get('/api/stories/public')
        .expect(200);

      expect(response.body).toHaveProperty('stories');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.stories)).toBe(true);

      await Story.deleteOne({ _id: publicStory._id });
    });

    it('should filter public stories by genre', async () => {
      const response = await request(app)
        .get('/api/stories/public?genre=fantasy')
        .expect(200);

      expect(response.body.stories.every(story => story.genre === 'fantasy')).toBe(true);
    });
  });

  describe('POST /api/stories/:id/nodes', () => {
    it('should generate a story node', async () => {
      const nodeData = {
        parentNodeId: null,
        prompt: 'The hero begins their journey',
        choiceId: null
      };

      const response = await request(app)
        .post(`/api/stories/${testStory._id}/nodes`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(nodeData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('storyId', testStory._id.toString());
      expect(response.body).toHaveProperty('text');
      expect(response.body).toHaveProperty('choices');
    });

    it('should require story ownership', async () => {
      const otherUser = new User({
        email: 'other@example.com',
        password: 'password123',
        username: 'otheruser',
        firstName: 'Other',
        lastName: 'User'
      });
      await otherUser.save();

      const otherToken = jwt.sign(
        { userId: otherUser._id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const nodeData = {
        parentNodeId: null,
        prompt: 'Unauthorized node generation'
      };

      await request(app)
        .post(`/api/stories/${testStory._id}/nodes`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(nodeData)
        .expect(403);

      await User.deleteOne({ _id: otherUser._id });
    });
  });

  describe('GET /api/stories/:id/nodes', () => {
    it('should get story nodes', async () => {
      // Create a test node
      const testNode = new StoryNode({
        storyId: testStory._id,
        nodeId: 'test-node-1',
        text: 'Test node content',
        choices: [],
        metadata: {
          genre: 'fantasy',
          tone: 'serious',
          wordCount: 10
        }
      });
      await testNode.save();

      const response = await request(app)
        .get(`/api/stories/${testStory._id}/nodes`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      await StoryNode.deleteOne({ _id: testNode._id });
    });

    it('should filter nodes by parent', async () => {
      const response = await request(app)
        .get(`/api/stories/${testStory._id}/nodes?parentNodeId=test-parent`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/stories/:id/play', () => {
    it('should record play session', async () => {
      const response = await request(app)
        .post(`/api/stories/${testStory._id}/play`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Play session recorded');

      // Verify stats were updated
      const updatedStory = await Story.findById(testStory._id);
      expect(updatedStory.stats.playCount).toBeGreaterThan(0);
    });
  });
});