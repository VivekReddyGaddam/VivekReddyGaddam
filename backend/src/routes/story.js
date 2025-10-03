const { z } = require('zod');
const { createStory, getStory } = require('../store/memoryStore');
const { generateSegment } = require('../services/generator');

const createSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  prompt: z.string().min(1).max(500),
  params: z
    .object({
      genre: z.string().optional(),
      tone: z.string().optional(),
      length: z.enum(['short', 'medium', 'long']).optional(),
      sentiment: z.number().min(-1).max(1).optional(),
    })
    .optional(),
});

function registerStoryRoutes(app) {
  app.post('/api/stories', (req, res) => {
    const parsed = createSchema.safeParse(req.body || {});
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });

    const { title, prompt, params } = parsed.data;
    const segment = generateSegment({ prompt, params });
    const { storyId, rootNodeId } = createStory({ title, prompt, params, rootSegment: segment });
    return res.json({ storyId, rootNodeId, segment });
  });

  app.get('/api/stories/:storyId', (req, res) => {
    const story = getStory(req.params.storyId);
    if (!story) return res.status(404).json({ error: 'Not found' });
    const nodes = Array.from(story.nodes.values());
    return res.json({
      id: story.id,
      title: story.title,
      prompt: story.prompt,
      params: story.params,
      rootNodeId: story.rootNodeId,
      nodes,
      createdAt: story.createdAt,
      updatedAt: story.updatedAt,
    });
  });
}

module.exports = { registerStoryRoutes };
