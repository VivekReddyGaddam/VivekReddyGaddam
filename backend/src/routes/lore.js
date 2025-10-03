const { z } = require('zod');
const { setLore, getLore } = require('../store/memoryStore');
const { buildLoreIndexFromMarkdown, detectConflicts } = require('../services/consistency');

const loreSchema = z.object({
  storyId: z.string().uuid(),
  markdown: z.string().min(1).max(20000),
});

function registerLoreRoutes(app) {
  app.post('/api/lore', (req, res) => {
    const parsed = loreSchema.safeParse(req.body || {});
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });

    const { storyId, markdown } = parsed.data;
    const loreIndex = buildLoreIndexFromMarkdown(markdown);
    setLore(storyId, loreIndex);
    return res.json({ ok: true, loreIndex });
  });

  app.post('/api/lore/check', (req, res) => {
    const { text, storyId } = req.body || {};
    const loreIndex = storyId ? getLore(storyId) : null;
    const conflicts = detectConflicts({ text, loreIndex });
    return res.json({ conflicts });
  });
}

module.exports = { registerLoreRoutes };
