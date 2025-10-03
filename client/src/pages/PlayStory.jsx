import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBook } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useStoryStore from '../store/storyStore';

const PlayStory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentStory, currentNode, fetchStory, continueStory, loading } = useStoryStore();
  const [storyHistory, setStoryHistory] = useState([]);

  useEffect(() => {
    fetchStory(id);
  }, [id]);

  useEffect(() => {
    if (currentNode && !storyHistory.find(h => h.id === currentNode.id)) {
      setStoryHistory([...storyHistory, currentNode]);
    }
  }, [currentNode]);

  const handleChoice = async (choiceIndex) => {
    const result = await continueStory(id, currentNode.id, choiceIndex);
    
    if (!result.success) {
      toast.error(result.error || 'Failed to continue story');
    }
  };

  if (!currentStory || !currentNode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center space-x-2 text-gray-600">
              <FaBook />
              <span className="font-medium">{currentStory.title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Story Text */}
          <div className="card fade-in">
            <div className="story-text whitespace-pre-wrap">
              {currentNode.text}
            </div>
          </div>

          {/* Choices */}
          {currentNode.choices && currentNode.choices.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">What do you do?</h3>
              <div className="grid grid-cols-1 gap-3">
                {currentNode.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleChoice(index)}
                    disabled={loading}
                    className="card hover:shadow-lg transition-all duration-200 text-left group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800 group-hover:text-primary-600 transition-colors">
                        {choice.label}
                      </span>
                      <span className="text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3 text-primary-600">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="text-lg">Generating next chapter...</span>
              </div>
            </div>
          )}

          {/* Story Complete */}
          {!loading && (!currentNode.choices || currentNode.choices.length === 0) && (
            <div className="card text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">The End</h3>
              <p className="text-gray-600 mb-6">
                Thank you for experiencing this story. Your journey has come to a close.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Story Progress */}
        <div className="mt-8 card bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Nodes explored: {storyHistory.length}</span>
            <span>Genre: {currentStory.parameters.genre}</span>
            <span>Tone: {currentStory.parameters.tone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayStory;
