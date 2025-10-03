import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useStoryStore } from '../stores/storyStore';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  PlusIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { 
    stories, 
    isLoading, 
    fetchStories, 
    deleteStory, 
    playStory 
  } = useStoryStore();

  const [activeTab, setActiveTab] = useState('recent');

  useEffect(() => {
    fetchStories({ limit: 20 });
  }, [fetchStories]);

  const handleDeleteStory = async (storyId) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      await deleteStory(storyId);
    }
  };

  const handlePlayStory = async (storyId) => {
    await playStory(storyId);
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

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      archived: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your stories and track your creative journey.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpenIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Stories</p>
                <p className="text-2xl font-bold text-gray-900">{user?.stats?.storiesCreated || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Play Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((user?.stats?.totalPlayTime || 0) / 60)}m
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <EyeIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stories.reduce((sum, story) => sum + (story.stats?.playCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stories.length > 0 
                    ? Math.round((stories.filter(s => s.status === 'completed').length / stories.length) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/create">
              <Button className="flex items-center">
                <PlusIcon className="w-5 h-5 mr-2" />
                Create New Story
              </Button>
            </Link>
            <Link to="/library">
              <Button variant="outline" className="flex items-center">
                <BookOpenIcon className="w-5 h-5 mr-2" />
                Browse Library
              </Button>
            </Link>
          </div>
        </div>

        {/* Stories Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Your Stories</h2>
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('recent')}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    activeTab === 'recent'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Recent
                </button>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    activeTab === 'active'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    activeTab === 'completed'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {stories.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No stories yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first interactive story.
                </p>
                <div className="mt-6">
                  <Link to="/create">
                    <Button>
                      <PlusIcon className="w-5 h-5 mr-2" />
                      Create Story
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              stories
                .filter(story => {
                  if (activeTab === 'recent') return true;
                  return story.status === activeTab;
                })
                .map((story) => (
                  <div key={story._id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {story.title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGenreColor(story.genre)}`}>
                            {story.genre}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(story.status)}`}>
                            {story.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 truncate">
                          {story.description || 'No description provided'}
                        </p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <EyeIcon className="w-4 h-4 mr-1" />
                            {story.stats?.playCount || 0} plays
                          </span>
                          <span className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {Math.round((story.stats?.averagePlayTime || 0) / 60)}m avg
                          </span>
                          <span>
                            Updated {new Date(story.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Link to={`/story/${story._id}`}>
                          <Button size="sm" variant="outline" className="flex items-center">
                            <PlayIcon className="w-4 h-4 mr-1" />
                            Play
                          </Button>
                        </Link>
                        <Link to={`/story/${story._id}/edit`}>
                          <Button size="sm" variant="outline" className="flex items-center">
                            <PencilIcon className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteStory(story._id)}
                          className="flex items-center"
                        >
                          <TrashIcon className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="px-6 py-4">
            <div className="text-center text-gray-500">
              <p>Activity tracking coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;