import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useStoryStore from '../store/storyStore';
import useAuthStore from '../store/authStore';

const CreateStory = () => {
  const navigate = useNavigate();
  const { createStory, loading } = useStoryStore();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    initialPrompt: '',
    parameters: {
      genre: user?.preferences?.defaultGenre || 'fantasy',
      tone: user?.preferences?.defaultTone || 'serious',
      length: 'medium',
      branchingComplexity: 5,
      emotionalIntensity: user?.preferences?.emotionalIntensity || 5
    },
    domain: 'general',
    loreBook: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('parameters.')) {
      const paramName = name.split('.')[1];
      setFormData({
        ...formData,
        parameters: {
          ...formData.parameters,
          [paramName]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.initialPrompt.length < 10) {
      toast.error('Please provide a more detailed prompt (at least 10 characters)');
      return;
    }

    const result = await createStory(formData);
    
    if (result.success) {
      toast.success('Story created successfully!');
      navigate(`/play/${result.story._id}`);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Story</h1>
          <p className="text-gray-600">Set the stage for your interactive narrative</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Initial Prompt */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Story Beginning</h2>
            <div>
              <label htmlFor="initialPrompt" className="block text-sm font-medium text-gray-700 mb-2">
                Starting Prompt <span className="text-red-500">*</span>
              </label>
              <textarea
                id="initialPrompt"
                name="initialPrompt"
                value={formData.initialPrompt}
                onChange={handleChange}
                required
                rows="4"
                maxLength="500"
                className="input-field"
                placeholder="E.g., A cyberpunk detective story about loss, set in a neon-lit city where memories can be stolen..."
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.initialPrompt.length} / 500 characters
              </p>
            </div>
          </div>

          {/* Story Parameters */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Story Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="parameters.genre" className="block text-sm font-medium text-gray-700 mb-2">
                  Genre
                </label>
                <select
                  id="parameters.genre"
                  name="parameters.genre"
                  value={formData.parameters.genre}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="fantasy">Fantasy</option>
                  <option value="sci-fi">Sci-Fi</option>
                  <option value="historical">Historical</option>
                  <option value="mystery">Mystery</option>
                  <option value="horror">Horror</option>
                  <option value="romance">Romance</option>
                  <option value="cyberpunk">Cyberpunk</option>
                </select>
              </div>

              <div>
                <label htmlFor="parameters.tone" className="block text-sm font-medium text-gray-700 mb-2">
                  Tone
                </label>
                <select
                  id="parameters.tone"
                  name="parameters.tone"
                  value={formData.parameters.tone}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="serious">Serious</option>
                  <option value="humorous">Humorous</option>
                  <option value="dark">Dark</option>
                  <option value="lighthearted">Lighthearted</option>
                </select>
              </div>

              <div>
                <label htmlFor="parameters.length" className="block text-sm font-medium text-gray-700 mb-2">
                  Story Length
                </label>
                <select
                  id="parameters.length"
                  name="parameters.length"
                  value={formData.parameters.length}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="short">Short (Quick read)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="long">Long (Epic tale)</option>
                </select>
              </div>

              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
                  Domain
                </label>
                <select
                  id="domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="general">General</option>
                  <option value="gaming">Gaming (RPG)</option>
                  <option value="education">Education</option>
                  <option value="therapy">Therapy</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="parameters.branchingComplexity" className="block text-sm font-medium text-gray-700 mb-2">
                Branching Complexity: {formData.parameters.branchingComplexity} choices
              </label>
              <input
                type="range"
                id="parameters.branchingComplexity"
                name="parameters.branchingComplexity"
                min="3"
                max="10"
                value={formData.parameters.branchingComplexity}
                onChange={(e) => handleChange({ target: { name: 'parameters.branchingComplexity', value: parseInt(e.target.value) } })}
                className="w-full"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="parameters.emotionalIntensity" className="block text-sm font-medium text-gray-700 mb-2">
                Emotional Intensity: {formData.parameters.emotionalIntensity}/10
              </label>
              <input
                type="range"
                id="parameters.emotionalIntensity"
                name="parameters.emotionalIntensity"
                min="1"
                max="10"
                value={formData.parameters.emotionalIntensity}
                onChange={(e) => handleChange({ target: { name: 'parameters.emotionalIntensity', value: parseInt(e.target.value) } })}
                className="w-full"
              />
            </div>
          </div>

          {/* Lore Book (Optional) */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Lore Book (Optional)</h2>
            <div>
              <label htmlFor="loreBook" className="block text-sm font-medium text-gray-700 mb-2">
                World Rules & Background
              </label>
              <textarea
                id="loreBook"
                name="loreBook"
                value={formData.loreBook}
                onChange={handleChange}
                rows="4"
                className="input-field"
                placeholder="Add any world-building details, character backgrounds, or rules you want the AI to follow..."
              />
              <p className="text-sm text-gray-500 mt-1">
                This helps maintain consistency throughout your story
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Story</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStory;
