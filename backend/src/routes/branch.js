const { z } = require('zod');
const { generateSegment } = require('../services/generator');
const { getLore, getNode, appendChildNode } = require('../store/memoryStore');

const branchSchema = z.object({
  storyId: z.string().uuid(),
  parentNodeId: z.string().uuid(),
  choiceLabel: z.string().min(1).max(64),
  params: z
    .object({
      genre: z.string().optional(),
      tone: z.string().optional(),
      length: z.enum(['short', 'medium', 'long']).optional(),
      sentiment: z.number().min(-1).max(1).optional(),
    })
    .optional(),
});

function registerBranchRoutes(app) {
  app.post('/api/branch', (req, res) => {
    const parsed = branchSchema.safeParse(req.body || {});
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });

    const { storyId, parentNodeId, choiceLabel, params } = parsed.data;
    const parent = getNode(storyId, parentNodeId);
    if (!parent) return res.status(404).json({ error: 'Parent node not found' });

    const loreIndex = getLore(storyId);
    const segment = generateSegment({ prompt: `Continuing: ${parent.text}`, params, loreIndex });
    const { childNodeId } = appendChildNode(storyId, parentNodeId, segment, choiceLabel);

    return res.json({ childNodeId, segment });
  });
}

module.exports = { registerBranchRoutes };
