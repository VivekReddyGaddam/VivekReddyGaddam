import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStoryStore } from '../stores/storyStore';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  BookOpenIcon,
  ClockIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

const StoryPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    currentStory, 
    isLoading, 
    fetchStory, 
    playStory 
  } = useStoryStore();

  const [currentNode, setCurrentNode] = useState(null);
  const [storyPath, setStoryPath] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchStory(id);
    }
  }, [id, fetchStory]);

  useEffect(() => {
    if (currentStory && currentStory.tree && currentStory.tree.length > 0) {
      // Find the start node
      const startNode = currentStory.tree.find(node => node.isStartNode) || currentStory.tree[0];
      setCurrentNode(startNode);
      setStoryPath([startNode]);
    }
  }, [currentStory]);

  const handleChoiceSelect = async (choice) => {
    if (isGenerating) return;

    setSelectedChoice(choice);
    setIsGenerating(true);

    try {
      // Record play session
      await playStory(id);

      // For now, we'll simulate generating a new node
      // In a real implementation, this would call the AI generation API
      setTimeout(() => {
        const newNode = {
          nodeId: `node_${Date.now()}`,
          text: `You chose to ${choice.text.toLowerCase()}. This leads to an exciting new development in your story...`,
          choices: [
            { id: 1, text: "Continue the adventure", action: "continue" },
            { id: 2, text: "Explore further", action: "explore" },
            { id: 3, text: "Take a different approach", action: "alternative" }
          ],
          metadata: {
            genre: currentStory.genre,
            tone: currentStory.tone,
            domain: currentStory.domain,
            wordCount: 50
          }
        };

        setCurrentNode(newNode);
        setStoryPath(prev => [...prev, newNode]);
        setIsGenerating(false);
        setSelectedChoice(null);
      }, 2000);

    } catch (error) {
      console.error('Error generating next node:', error);
      toast.error('Failed to generate next part of the story');
      setIsGenerating(false);
      setSelectedChoice(null);
    }
  };

  const handleRestart = () => {
    if (currentStory && currentStory.tree && currentStory.tree.length > 0) {
      const startNode = currentStory.tree.find(node => node.isStartNode) || currentStory.tree[0];
      setCurrentNode(startNode);
      setStoryPath([startNode]);
      setIsPlaying(false);
    }
  };

  const handleGoBack = () => {
    if (storyPath.length > 1) {
      const newPath = storyPath.slice(0, -1);
      setStoryPath(newPath);
      setCurrentNode(newPath[newPath.length - 1]);
    }
  };

  const getGenreColor = (genre) => {
    const colors = {
      fantasy: 'bg-purple-100 text-purple-800',
      'sci-fi': 'bg-blue-100 text-blue-800',
      mystery: 'bg-gray-100 text-gray-800',
      romance: 'bg-pink-100 text-pink-800',
      horror: 'bg-red-100 text-red-800',
      historical: 'bg-yellow-100 text-yellow-800',
      adventure: 'bg-green-100 text-green-800',
    };
    return colors[genre] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (!currentStory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Story not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The story you're looking for doesn't exist or has been removed.
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex items-center"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{currentStory.title}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGenreColor(currentStory.genre)}`}>
                    {currentStory.genre}
                  </span>
                  <span className="text-sm text-gray-500">
                    by {currentStory.userId?.username || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleRestart}
                className="flex items-center"
              >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Restart
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center"
              >
                {isPlaying ? (
                  <>
                    <PauseIcon className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-5 h-5 mr-2" />
                    Play
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Story Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <EyeIcon className="w-5 h-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Views</p>
                <p className="text-lg font-bold text-gray-900">{currentStory.stats?.playCount || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <ClockIcon className="w-5 h-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                <p className="text-lg font-bold text-gray-900">
                  {Math.round((currentStory.stats?.averagePlayTime || 0) / 60)}m
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <BookOpenIcon className="w-5 h-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Nodes</p>
                <p className="text-lg font-bold text-gray-900">{currentStory.stats?.totalNodes || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-100 rounded-full mr-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-lg font-bold text-gray-900">
                  {storyPath.length} / {currentStory.stats?.totalNodes || 1}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Story Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Story</h2>
              {storyPath.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGoBack}
                >
                  Go Back
                </Button>
              )}
            </div>
          </div>

          <div className="px-6 py-6">
            {currentNode ? (
              <div className="space-y-6">
                {/* Story Text */}
                <div className="prose max-w-none">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {currentNode.text}
                  </p>
                </div>

                {/* Choices */}
                {currentNode.choices && currentNode.choices.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium text-gray-900">What do you do?</h3>
                    <div className="space-y-2">
                      {currentNode.choices.map((choice) => (
                        <button
                          key={choice.id}
                          onClick={() => handleChoiceSelect(choice)}
                          disabled={isGenerating || selectedChoice?.id === choice.id}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                            selectedChoice?.id === choice.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                          } ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-900 font-medium">
                              {choice.text}
                            </span>
                            {selectedChoice?.id === choice.id && isGenerating && (
                              <LoadingSpinner size="sm" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generating Indicator */}
                {isGenerating && (
                  <div className="text-center py-8">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-gray-600">
                      Generating the next part of your story...
                    </p>
                  </div>
                )}

                {/* End of Story */}
                {currentNode.isEndNode && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Story Complete!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      You've reached the end of this story. Thank you for playing!
                    </p>
                    <div className="flex justify-center space-x-4">
                      <Button onClick={handleRestart}>
                        Play Again
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/library')}>
                        Find More Stories
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Loading story...</p>
              </div>
            )}
          </div>
        </div>

        {/* Story Path */}
        {storyPath.length > 1 && (
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Your Journey</h3>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center space-x-2 overflow-x-auto">
                {storyPath.map((node, index) => (
                  <div key={node.nodeId} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index === storyPath.length - 1
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    {index < storyPath.length - 1 && (
                      <div className="w-8 h-0.5 bg-gray-300 mx-2"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryPlayer;