const { z } = require('zod');
const { generateSegment } = require('../services/generator');
const { getLore } = require('../store/memoryStore');

const generateSchema = z.object({
  prompt: z.string().min(1).max(500),
  params: z
    .object({
      genre: z.string().optional(),
      tone: z.string().optional(),
      length: z.enum(['short', 'medium', 'long']).optional(),
      sentiment: z.number().min(-1).max(1).optional(),
    })
    .optional(),
  storyId: z.string().uuid().optional(),
});

function registerGenerateRoutes(app) {
  app.post('/api/generate', (req, res) => {
    const parsed = generateSchema.safeParse(req.body || {});
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });

    const { prompt, params, storyId } = parsed.data;
    const loreIndex = storyId ? getLore(storyId) : null;

    const segment = generateSegment({ prompt, params, loreIndex });
    return res.json(segment);
  });
}

module.exports = { registerGenerateRoutes };
