import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaBrain, FaGamepad, FaGraduationCap, FaHeart } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <FaBook className="text-primary-600 text-6xl mx-auto mb-6" />
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-primary-600">StoryForge AI</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Create dynamic, interactive stories powered by AI. Generate branching narratives that adapt in real-time,
          maintaining consistency in world-building, character development, and emotional arcs.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link to="/register" className="btn-primary text-lg px-8 py-3">
            Get Started Free
          </Link>
          <Link to="/login" className="btn-secondary text-lg px-8 py-3">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Powerful Features for Every Creator
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="card text-center">
            <FaBrain className="text-primary-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered</h3>
            <p className="text-gray-600">
              Advanced AI generates compelling narratives that adapt to your choices
            </p>
          </div>

          <div className="card text-center">
            <FaGamepad className="text-secondary-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Gaming Mode</h3>
            <p className="text-gray-600">
              Create RPG quests and interactive game narratives with ease
            </p>
          </div>

          <div className="card text-center">
            <FaGraduationCap className="text-amber-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Education</h3>
            <p className="text-gray-600">
              Build historical simulations and educational scenarios
            </p>
          </div>

          <div className="card text-center">
            <FaHeart className="text-red-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Therapy</h3>
            <p className="text-gray-600">
              Guided exposure scenarios with psychological safeguards
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create</h3>
              <p className="text-gray-600">
                Start with a prompt and set your story parameters like genre, tone, and complexity
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Interact</h3>
              <p className="text-gray-600">
                Make choices that shape the narrative. AI generates new content based on your decisions
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Share</h3>
              <p className="text-gray-600">
                Export your stories or share them with the community to play
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Ready to Create Your Story?
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of creators using StoryForge AI to bring their narratives to life
        </p>
        <Link to="/register" className="btn-primary text-lg px-8 py-3">
          Start Creating Now
        </Link>
      </section>
    </div>
  );
};

export default Home;
