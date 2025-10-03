const { v4: uuidv4 } = require('uuid')
const { consistencyChecker } = require('./consistencyChecker')

// Story templates for different genres
const storyTemplates = {
  fantasy: {
    settings: [
      "a mystical forest filled with ancient magic",
      "a medieval kingdom on the brink of war",
      "a floating city in the clouds",
      "an underground dwarven stronghold",
      "a wizard's tower overlooking a stormy sea"
    ],
    characters: [
      "a young wizard apprentice",
      "a rogue elf archer",
      "a brave knight",
      "a wise old sage",
      "a mischievous fairy"
    ],
    conflicts: [
      "an ancient dragon threatening the realm",
      "a dark sorcerer seeking ultimate power",
      "a cursed artifact causing chaos",
      "rival kingdoms on the verge of war",
      "a mysterious plague affecting the land"
    ]
  },
  'sci-fi': {
    settings: [
      "a sprawling megacity in the year 2147",
      "a space station orbiting a distant planet",
      "an underground resistance bunker",
      "a corporate headquarters in the clouds",
      "a research facility on Mars"
    ],
    characters: [
      "a cybernetic detective",
      "an AI companion unit",
      "a rogue hacker",
      "a corporate executive",
      "a rebel leader"
    ],
    conflicts: [
      "a rogue AI threatening humanity",
      "corporate espionage in a dystopian future",
      "an alien invasion force",
      "a mysterious virus affecting cybernetic implants",
      "a rebellion against oppressive AI overlords"
    ]
  },
  mystery: {
    settings: [
      "a foggy Victorian mansion",
      "a bustling 1920s detective agency",
      "a quiet suburban neighborhood",
      "an abandoned warehouse district",
      "a luxury ocean liner"
    ],
    characters: [
      "a hard-boiled detective",
      "a brilliant forensic scientist",
      "a skeptical police captain",
      "a mysterious informant",
      "a wealthy socialite"
    ],
    conflicts: [
      "a series of impossible murders",
      "a priceless artifact theft",
      "corporate corruption scandal",
      "a kidnapping with ransom demands",
      "political assassination plot"
    ]
  }
}

// Generate story content based on parameters
function generateStoryContent(params) {
  const { prompt, genre, tone, length } = params
  const template = storyTemplates[genre] || storyTemplates.fantasy

  // Extract key elements from prompt or use defaults
  const setting = template.settings[Math.floor(Math.random() * template.settings.length)]
  const character = template.characters[Math.floor(Math.random() * template.characters.length)]
  const conflict = template.conflicts[Math.floor(Math.random() * template.conflicts.length)]

  // Generate opening scene
  const opening = `You find yourself in ${setting}. As ${character}, you discover ${conflict}.`

  // Generate story nodes based on length
  const numNodes = length === 'short' ? 5 : length === 'medium' ? 8 : 12
  const nodes = {}

  // Create root node
  nodes[1] = {
    id: 1,
    text: `${opening} ${prompt ? `Your mission: ${prompt}` : 'What do you do?'}`,
    choices: []
  }

  // Generate branching story
  for (let i = 2; i <= numNodes; i++) {
    const isChoiceNode = i % 2 === 0 // Even nodes are choice points
    const parentNode = Math.floor((i - 1) / 2) + 1

    if (isChoiceNode) {
      // This is a choice node
      const numChoices = Math.min(3, Math.max(2, Math.floor(Math.random() * 3) + 2))
      const choices = []

      for (let j = 1; j <= numChoices; j++) {
        choices.push({
          id: i + j,
          label: `Option ${j}: ${generateChoiceText(genre, tone)}`
        })
      }

      nodes[i] = {
        id: i,
        text: generateStorySegment(genre, tone, i),
        choices: choices
      }
    } else {
      // This is a story continuation node
      nodes[i] = {
        id: i,
        text: generateStorySegment(genre, tone, i),
        choices: []
      }
    }
  }

  return nodes
}

// Generate choice text based on genre and tone
function generateChoiceText(genre, tone) {
  const choices = {
    fantasy: [
      "Use magic to investigate",
      "Confront the threat directly",
      "Seek help from allies",
      "Search for clues in the area"
    ],
    'sci-fi': [
      "Hack the system",
      "Confront the suspect",
      "Analyze the evidence",
      "Call for backup"
    ],
    mystery: [
      "Investigate the crime scene",
      "Interview the witnesses",
      "Analyze the evidence",
      "Follow a lead"
    ]
  }

  const genreChoices = choices[genre] || choices.fantasy
  return genreChoices[Math.floor(Math.random() * genreChoices.length)]
}

// Generate story segment text
function generateStorySegment(genre, tone, nodeId) {
  const segments = {
    fantasy: [
      "Magic swirls around you as you make your decision. The ancient forest whispers secrets as you press forward.",
      "Your sword gleams in the moonlight as you face the unknown threat. Allies gather at your call.",
      "Ancient runes glow on the cavern walls, revealing hints of the greater mystery that lies ahead.",
      "The dragon's shadow passes overhead as you navigate the treacherous mountain path."
    ],
    'sci-fi': [
      "Data streams flicker across your augmented reality display as you analyze the situation.",
      "The corporate enforcers are closing in. You activate your cloaking device and slip into the shadows.",
      "Neural implants buzz with incoming data. A breakthrough revelation changes everything.",
      "The AI companion processes the information, suggesting three possible courses of action."
    ],
    mystery: [
      "Clues begin to form a pattern as you piece together the fragments of evidence.",
      "The suspect's alibi crumbles under scrutiny. A new lead opens up in the investigation.",
      "Dark secrets from the past resurface, complicating the current case.",
      "Your instincts tell you something's not right. Time to dig deeper into the mystery."
    ]
  }

  const genreSegments = segments[genre] || segments.fantasy
  const baseText = genreSegments[Math.floor(Math.random() * genreSegments.length)]

  // Adjust tone
  if (tone === 'dark') {
    return baseText + " The situation grows more dire with each passing moment."
  } else if (tone === 'light') {
    return baseText + " But there's still hope and humor to be found in this adventure."
  }

  return baseText
}

// Main story generation function
async function generateStory(params) {
  const storyId = uuidv4()
  const nodes = generateStoryContent(params)

  const story = {
    id: storyId,
    title: `Generated Story - ${new Date().toLocaleDateString()}`,
    genre: params.genre,
    tone: params.tone,
    length: params.length,
    nodes: nodes,
    createdAt: new Date().toISOString(),
    status: 'active'
  }

  // In a real implementation, this would save to database
  // For now, we'll return the generated story
  return story
}

// Get story by ID (placeholder)
async function getStory(storyId) {
  // In a real implementation, this would fetch from database
  return null
}

// Save story (placeholder)
async function saveStory(storyId, storyData) {
  // In a real implementation, this would save to database
  return { ...storyData, id: storyId, updatedAt: new Date().toISOString() }
}

// Get user's stories (placeholder)
async function getUserStories(userId) {
  // In a real implementation, this would fetch from database
  return []
}

module.exports = {
  generateStory,
  getStory,
  saveStory,
  getUserStories
}