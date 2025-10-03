import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { storyAPI } from '../utils/api'

const PlayStory = () => {
  const { storyId } = useParams()
  const [currentNode, setCurrentNode] = useState(null)
  const [storyData, setStoryData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await storyAPI.getStory(storyId)
        const story = response.data

        setStoryData(story)
        setCurrentNode(story.nodes[1]) // Start with the first node
      } catch (error) {
        console.error('Error fetching story:', error)
        setError('Failed to load story')
      } finally {
        setIsLoading(false)
      }
    }

    if (storyId) {
      fetchStory()
    }
  }, [storyId])

  const handleChoice = (choiceId) => {
    if (storyData && storyData.nodes[choiceId]) {
      setCurrentNode(storyData.nodes[choiceId])
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!currentNode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Story Not Found</h2>
          <p className="text-gray-600">The requested story could not be loaded.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{storyData.title}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Node {currentNode.id}</span>
          <span>•</span>
          <span>Interactive Story</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-800 leading-relaxed whitespace-pre-line">
            {currentNode.text}
          </p>
        </div>
      </div>

      {currentNode.choices && currentNode.choices.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What do you choose?</h3>
          <div className="grid gap-3">
            {currentNode.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-medium transition-colors text-left block w-full"
              >
                {choice.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {(!currentNode.choices || currentNode.choices.length === 0) && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Story Complete!</h3>
          <p className="text-gray-600 mb-6">You've reached the end of this narrative branch.</p>
          <div className="space-x-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
              Start Over
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
              Save Story
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>StoryForge AI - Interactive Narrative Engine</span>
          <div className="flex space-x-4">
            <button className="hover:text-gray-700">Share</button>
            <button className="hover:text-gray-700">Export</button>
            <button className="hover:text-gray-700">Report Issue</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayStory