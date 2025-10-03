const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { registerGenerateRoutes } = require('./routes/generate');
const { registerBranchRoutes } = require('./routes/branch');
const { registerStoryRoutes } = require('./routes/story');
const { registerLoreRoutes } = require('./routes/lore');
const { registerExportImportRoutes } = require('./routes/exportImport');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.text({ type: 'text/*', limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get('/health', (_req, res) => res.json({ ok: true }));

registerGenerateRoutes(app);
registerBranchRoutes(app);
registerStoryRoutes(app);
registerLoreRoutes(app);
registerExportImportRoutes(app);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on ${port}`);
});
