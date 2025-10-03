const { z } = require('zod');
const { exportStory, importStory } = require('../store/memoryStore');

const importSchema = z.object({
  story: z.object({}).passthrough(),
});

function registerExportImportRoutes(app) {
  app.get('/api/export/:storyId', (req, res) => {
    const data = exportStory(req.params.storyId);
    if (!data) return res.status(404).json({ error: 'Not found' });
    return res.json(data);
  });

  app.post('/api/import', (req, res) => {
    const parsed = importSchema.safeParse(req.body || {});
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
    const { story } = parsed.data;
    const result = importStory(story);
    return res.json(result);
  });
}

module.exports = { registerExportImportRoutes };
