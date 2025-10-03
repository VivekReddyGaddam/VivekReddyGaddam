// Minimal consistency checker using a simple lore index
// Lore format example:
// {
//   characters: {
//     Elara: { status: 'alive', inventory: ['sword'] }
//   },
//   world: { rules: ['no magic after dusk'] }
// }

function buildLoreIndexFromMarkdown(markdown) {
  // Extremely naive: extract lines like "- Character: Name (alive)"
  const lines = String(markdown || '').split(/\r?\n/);
  const characters = {};
  for (const line of lines) {
    const m = line.match(/character\s*:\s*([A-Za-z0-9_\- ]+)\s*\((alive|dead)\)/i);
    if (m) {
      const name = m[1].trim();
      const status = m[2].toLowerCase();
      characters[name] = { status };
    }
  }
  return { characters };
}

function detectConflicts({ text, loreIndex }) {
  if (!loreIndex || !loreIndex.characters) return [];
  const conflicts = [];
  const lowered = String(text || '').toLowerCase();
  for (const [name, meta] of Object.entries(loreIndex.characters)) {
    if (meta.status === 'alive' && lowered.includes(`${name.toLowerCase()} is dead`)) {
      conflicts.push({ type: 'character_status', name, expected: 'alive' });
    }
  }
  return conflicts;
}

module.exports = { buildLoreIndexFromMarkdown, detectConflicts };
