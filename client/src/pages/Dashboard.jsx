import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useStoryStore from '../store/storyStore';
import useAuthStore from '../store/authStore';
import StoryCard from '../components/StoryCard';

const Dashboard = () => {
  const { stories, fetchStories, deleteStory, exportStory, loading } = useStoryStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState({ genre: '', status: '' });

  useEffect(() => {
    fetchStories(filter);
  }, [filter]);

  const handleDelete = async (storyId) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      const result = await deleteStory(storyId);
      if (result.success) {
        toast.success('Story deleted successfully');
      } else {
        toast.error(result.error);
      }
    }
  };

  const handleExport = async (storyId) => {
    const result = await exportStory(storyId);
    if (result.success) {
      const dataStr = JSON.stringify(result.data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `story-${storyId}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Story exported successfully');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Stories</h1>
          <p className="text-gray-600">
            {user?.subscription.tier === 'free' && (
              <>Stories: {user?.subscription.storiesUsed} / {user?.subscription.storiesPerMonth} this month</>
            )}
            {user?.subscription.tier !== 'free' && 'Unlimited stories'}
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-500" />
              <select
                value={filter.genre}
                onChange={(e) => setFilter({ ...filter, genre: e.target.value })}
                className="input-field py-2"
              >
                <option value="">All Genres</option>
                <option value="fantasy">Fantasy</option>
                <option value="sci-fi">Sci-Fi</option>
                <option value="historical">Historical</option>
                <option value="mystery">Mystery</option>
                <option value="horror">Horror</option>
                <option value="romance">Romance</option>
              </select>
            </div>

            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="input-field py-2"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <button
            onClick={() => navigate('/create')}
            className="btn-primary flex items-center space-x-2"
          >
            <FaPlus />
            <span>Create New Story</span>
          </button>
        </div>

        {/* Stories Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : stories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <StoryCard
                key={story._id}
                story={story}
                onDelete={handleDelete}
                onExport={handleExport}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FaPlus className="text-gray-300 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No stories yet</h3>
            <p className="text-gray-500 mb-6">Create your first interactive story to get started</p>
            <button
              onClick={() => navigate('/create')}
              className="btn-primary"
            >
              Create Story
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
