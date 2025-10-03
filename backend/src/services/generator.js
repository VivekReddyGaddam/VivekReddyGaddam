// Simple rule-based generator that uses params and optional lore constraints
// to produce a segment with 2-4 choices. This is a placeholder for LLM integration.

function clamp(min, value, max) {
  return Math.max(min, Math.min(max, value));
}

function pick(array, count) {
  const unique = new Set();
  while (unique.size < Math.min(count, array.length)) {
    const idx = Math.floor(Math.random() * array.length);
    unique.add(array[idx]);
  }
  return Array.from(unique);
}

function sentimentTone(adjustedSentiment) {
  if (adjustedSentiment > 0.4) return 'hopeful';
  if (adjustedSentiment < -0.4) return 'somber';
  return 'balanced';
}

function genreScaffolds(genre) {
  switch ((genre || '').toLowerCase()) {
    case 'fantasy':
      return {
        setting: 'an ancient realm of shifting forests and hidden runes',
        motifs: ['prophecy', 'ancient blade', 'mysterious guide', 'forgotten city'],
        verbs: ['venture', 'invoke', 'challenge', 'safeguard'],
      };
    case 'sci-fi':
    case 'science fiction':
      return {
        setting: 'a neon-soaked sprawl under drifting satellites',
        motifs: ['quantum key', 'rogue AI', 'orbital shuttle', 'encrypted beacon'],
        verbs: ['decrypt', 'bypass', 'synchronize', 'pilot'],
      };
    case 'historical':
      return {
        setting: 'a city square where cobblestones echo with distant drums',
        motifs: ['dispatch rider', 'sealed letter', 'curfew', 'whisper network'],
        verbs: ['parley', 'disguise', 'rally', 'escort'],
      };
    default:
      return {
        setting: 'a liminal place between choices, where the air holds its breath',
        motifs: ['faded photo', 'old scar', 'closed door', 'new path'],
        verbs: ['consider', 'accept', 'refuse', 'risk'],
      };
  }
}

function applyLoreConstraints(text, loreIndex) {
  if (!loreIndex) return text;
  // naive enforcement: ensure declared alive characters are not declared dead, etc.
  if (loreIndex.characters) {
    for (const [name, meta] of Object.entries(loreIndex.characters)) {
      if (meta.status === 'alive') {
        text = text.replace(new RegExp(`${name}.*dead`, 'i'), `${name} stands resolute`);
      }
    }
  }
  return text;
}

function buildChoices(verbs) {
  const actionVerbs = pick(verbs, 4);
  const labels = actionVerbs.map((v) => v.charAt(0).toUpperCase() + v.slice(1));
  const uniqueLabels = Array.from(new Set(labels));
  return uniqueLabels.slice(0, clamp(2, uniqueLabels.length, 5)).map((l) => ({ label: l }));
}

function generateSegment({ prompt, params = {}, loreIndex = null }) {
  const { genre = 'general', tone = 'balanced', length = 'short', sentiment = 0 } = params;

  const scaffold = genreScaffolds(genre);

  const lengthTarget = length === 'long' ? 220 : length === 'medium' ? 140 : 90;
  const emo = sentimentTone(sentiment);

  const motifs = pick(scaffold.motifs, 2).join(' and ');
  let text = `In ${scaffold.setting}, the moment hangs ${emo}. ${prompt || 'A choice approaches.'} Echoes of ${motifs} ripple around you.`;
  if (tone && tone !== 'balanced') {
    text += ` The tone is ${tone}.`;
  }
  // naive length control by padding with sensory details
  while (text.length < lengthTarget) {
    text += ` You notice a subtle detail that could matter.`;
  }

  text = applyLoreConstraints(text, loreIndex);

  const choices = buildChoices(scaffold.verbs);
  return { text, choices };
}

module.exports = { generateSegment };
