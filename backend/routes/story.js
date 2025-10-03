const express = require('express')
const { generateStory, getStory, saveStory, getUserStories } = require('../utils/storyGenerator')

const router = express.Router()

// Generate a new story
router.post('/generate', async (req, res) => {
  try {
    const { prompt, genre, tone, length, branchingComplexity } = req.body

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' })
    }

    const story = await generateStory({
      prompt,
      genre: genre || 'fantasy',
      tone: tone || 'neutral',
      length: length || 'medium',
      branchingComplexity: branchingComplexity || 3
    })

    res.json(story)
  } catch (error) {
    console.error('Error generating story:', error)
    res.status(500).json({ error: 'Failed to generate story' })
  }
})

// Get a specific story
router.get('/:storyId', async (req, res) => {
  try {
    const { storyId } = req.params
    const story = await getStory(storyId)

    if (!story) {
      return res.status(404).json({ error: 'Story not found' })
    }

    res.json(story)
  } catch (error) {
    console.error('Error fetching story:', error)
    res.status(500).json({ error: 'Failed to fetch story' })
  }
})

// Save/update a story
router.post('/:storyId/save', async (req, res) => {
  try {
    const { storyId } = req.params
    const storyData = req.body

    const savedStory = await saveStory(storyId, storyData)
    res.json(savedStory)
  } catch (error) {
    console.error('Error saving story:', error)
    res.status(500).json({ error: 'Failed to save story' })
  }
})

// Get user's stories (placeholder for now)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const stories = await getUserStories(userId)
    res.json(stories)
  } catch (error) {
    console.error('Error fetching user stories:', error)
    res.status(500).json({ error: 'Failed to fetch user stories' })
  }
})

module.exports = router