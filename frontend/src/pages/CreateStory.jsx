import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { storyAPI } from '../utils/api'

const CreateStory = () => {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [genre, setGenre] = useState('fantasy')
  const [tone, setTone] = useState('neutral')
  const [length, setLength] = useState('medium')
  const [branchingComplexity, setBranchingComplexity] = useState(3)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsGenerating(true)
    setError('')

    try {
      const response = await storyAPI.generateStory({
        prompt,
        genre,
        tone,
        length,
        branchingComplexity
      })

      // Redirect to play the generated story
      navigate(`/play/${response.data.id}`)
    } catch (error) {
      console.error('Error generating story:', error)
      setError(error.response?.data?.error || 'Failed to generate story. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Story</h1>
        <p className="text-gray-600">
          Describe your story concept and customize the parameters below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Story Prompt</h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your story prompt here... e.g., 'A cyberpunk detective story about a mysterious AI companion'"
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            required
          />
          <p className="text-sm text-gray-500 mt-2">
            Describe the setting, characters, and main conflict to get started.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Story Parameters</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="fantasy">Fantasy</option>
                <option value="sci-fi">Science Fiction</option>
                <option value="mystery">Mystery</option>
                <option value="romance">Romance</option>
                <option value="horror">Horror</option>
                <option value="historical">Historical</option>
                <option value="adventure">Adventure</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="light">Light & Fun</option>
                <option value="neutral">Neutral</option>
                <option value="serious">Serious</option>
                <option value="dark">Dark & Intense</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Length
              </label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="short">Short (5-10 segments)</option>
                <option value="medium">Medium (10-20 segments)</option>
                <option value="long">Long (20+ segments)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branching Complexity (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={branchingComplexity}
                onChange={(e) => setBranchingComplexity(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>Simple</span>
                <span className="font-medium">{branchingComplexity}</span>
                <span>Complex</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-md font-medium transition-colors flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating Story...</span>
              </>
            ) : (
              <>
                <span>Generate Story</span>
                <span className="text-lg">🚀</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateStory