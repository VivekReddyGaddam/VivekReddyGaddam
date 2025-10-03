import React from 'react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to StoryForge AI
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Create dynamic, interactive stories powered by artificial intelligence.
          Build branching narratives that adapt in real-time to user choices.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-blue-600 text-3xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">Create Stories</h3>
          <p className="text-gray-600 mb-4">
            Generate interactive narratives with AI-powered branching paths and dynamic content.
          </p>
          <Link
            to="/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors inline-block"
          >
            Start Creating
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-green-600 text-3xl mb-4">🎮</div>
          <h3 className="text-xl font-semibold mb-2">Play Stories</h3>
          <p className="text-gray-600 mb-4">
            Experience immersive storytelling with multiple choice paths and personalized outcomes.
          </p>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
            Browse Stories
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-purple-600 text-3xl mb-4">⚙️</div>
          <h3 className="text-xl font-semibold mb-2">Customize</h3>
          <p className="text-gray-600 mb-4">
            Fine-tune your stories with custom parameters, genres, and emotional adaptations.
          </p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
            Settings
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Features Overview
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered Generation</h3>
            <p className="text-gray-700">
              Advanced language models create coherent, engaging narratives that maintain consistency across branches.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Dynamic Branching</h3>
            <p className="text-gray-700">
              Stories adapt in real-time based on user choices, creating unique experiences for each playthrough.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Multi-Domain Support</h3>
            <p className="text-gray-700">
              Perfect for gaming, education, therapy, and entertainment with domain-specific adaptations.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">World-Building Tools</h3>
            <p className="text-gray-700">
              Maintain narrative consistency with built-in lore management and character tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard