import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStoryStore } from '../stores/storyStore';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  BookOpenIcon,
  Cog6ToothIcon,
  PlusIcon,
  PlayIcon,
  SaveIcon,
} from '@heroicons/react/24/outline';

const StoryCreator = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    currentStory, 
    isLoading, 
    fetchStory, 
    createStory, 
    updateStory,
    generateStoryNode 
  } = useStoryStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: 'fantasy',
    tone: 'serious',
    domain: 'general',
    visibility: 'private',
    tags: [],
    initialPrompt: '',
    settings: {
      branchingComplexity: 3,
      maxLength: 1000,
      allowUserInput: true,
      autoGenerate: false,
    },
    lore: {
      worldBuilding: '',
      characterProfiles: [],
      rules: [],
      history: '',
    },
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newTag, setNewTag] = useState('');

  const genres = [
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'sci-fi', label: 'Sci-Fi' },
    { value: 'mystery', label: 'Mystery' },
    { value: 'romance', label: 'Romance' },
    { value: 'horror', label: 'Horror' },
    { value: 'historical', label: 'Historical' },
    { value: 'adventure', label: 'Adventure' },
  ];

  const tones = [
    { value: 'serious', label: 'Serious' },
    { value: 'humorous', label: 'Humorous' },
    { value: 'mysterious', label: 'Mysterious' },
    { value: 'romantic', label: 'Romantic' },
  ];

  const domains = [
    { value: 'general', label: 'General' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'education', label: 'Education' },
    { value: 'therapy', label: 'Therapy' },
  ];

  useEffect(() => {
    if (id) {
      fetchStory(id);
    }
  }, [id, fetchStory]);

  useEffect(() => {
    if (currentStory && id) {
      setFormData({
        title: currentStory.title || '',
        description: currentStory.description || '',
        genre: currentStory.genre || 'fantasy',
        tone: currentStory.tone || 'serious',
        domain: currentStory.domain || 'general',
        visibility: currentStory.visibility || 'private',
        tags: currentStory.tags || [],
        initialPrompt: '',
        settings: {
          branchingComplexity: currentStory.settings?.branchingComplexity || 3,
          maxLength: currentStory.settings?.maxLength || 1000,
          allowUserInput: currentStory.settings?.allowUserInput || true,
          autoGenerate: currentStory.settings?.autoGenerate || false,
        },
        lore: {
          worldBuilding: currentStory.lore?.worldBuilding || '',
          characterProfiles: currentStory.lore?.characterProfiles || [],
          rules: currentStory.lore?.rules || [],
          history: currentStory.lore?.history || '',
        },
      });
    }
  }, [currentStory, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleGenerateInitialStory = async () => {
    if (!formData.title || !formData.initialPrompt) {
      toast.error('Please provide a title and initial prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const storyData = {
        ...formData,
        initialPrompt: formData.initialPrompt,
      };

      let result;
      if (id) {
        result = await updateStory(id, storyData);
      } else {
        result = await createStory(storyData);
      }

      if (result.success) {
        toast.success('Story created successfully!');
        navigate(`/story/${result.story._id}`);
      }
    } catch (error) {
      toast.error('Failed to create story');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.title) {
      toast.error('Please provide a title');
      return;
    }

    try {
      const storyData = {
        ...formData,
        status: 'draft',
      };

      let result;
      if (id) {
        result = await updateStory(id, storyData);
      } else {
        result = await createStory(storyData);
      }

      if (result.success) {
        toast.success('Draft saved successfully!');
        if (!id) {
          navigate(`/story/${result.story._id}/edit`);
        }
      }
    } catch (error) {
      toast.error('Failed to save draft');
    }
  };

  const steps = [
    { id: 1, name: 'Basic Info', description: 'Title, genre, and description' },
    { id: 2, name: 'Settings', description: 'Story parameters and preferences' },
    { id: 3, name: 'World Building', description: 'Characters, lore, and rules' },
    { id: 4, name: 'Generate', description: 'Create your initial story' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {id ? 'Edit Story' : 'Create New Story'}
              </h1>
              <p className="mt-2 text-gray-600">
                Build an interactive narrative with AI-powered generation.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleSaveDraft}>
                <SaveIcon className="w-5 h-5 mr-2" />
                Save Draft
              </Button>
              {id && (
                <Button variant="outline" onClick={() => navigate(`/story/${id}`)}>
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Preview
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <nav aria-label="Progress">
            <ol className="flex items-center justify-center space-x-8">
              {steps.map((step, stepIdx) => (
                <li key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        currentStep >= step.id
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'border-gray-300 text-gray-500'
                      }`}
                    >
                      {step.id}
                    </div>
                    <div className="ml-4 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          currentStep >= step.id ? 'text-purple-600' : 'text-gray-500'
                        }`}
                      >
                        {step.name}
                      </p>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                  </div>
                  {stepIdx < steps.length - 1 && (
                    <div className="ml-8 w-16 h-0.5 bg-gray-300" />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                {steps[currentStep - 1].name}
              </h2>
              <div className="flex space-x-2">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    Previous
                  </Button>
                )}
                {currentStep < steps.length && (
                  <Button onClick={() => setCurrentStep(currentStep + 1)}>
                    Next
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter your story title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Brief description of your story"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Genre *
                    </label>
                    <select
                      name="genre"
                      value={formData.genre}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    >
                      {genres.map(genre => (
                        <option key={genre.value} value={genre.value}>
                          {genre.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tone *
                    </label>
                    <select
                      name="tone"
                      value={formData.tone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    >
                      {tones.map(tone => (
                        <option key={tone.value} value={tone.value}>
                          {tone.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Domain
                    </label>
                    <select
                      name="domain"
                      value={formData.domain}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    >
                      {domains.map(domain => (
                        <option key={domain.value} value={domain.value}>
                          {domain.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500"
                        >
                          <span className="sr-only">Remove</span>
                          <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                            <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6-6 6" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Add a tag"
                    />
                    <Button onClick={handleAddTag} variant="outline" className="rounded-l-none">
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Settings */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branching Complexity
                    </label>
                    <input
                      type="range"
                      name="settings.branchingComplexity"
                      min="2"
                      max="10"
                      value={formData.settings.branchingComplexity}
                      onChange={handleChange}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>Simple</span>
                      <span>{formData.settings.branchingComplexity} choices</span>
                      <span>Complex</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Length (words)
                    </label>
                    <input
                      type="number"
                      name="settings.maxLength"
                      min="100"
                      max="10000"
                      value={formData.settings.maxLength}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="settings.allowUserInput"
                      checked={formData.settings.allowUserInput}
                      onChange={handleChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Allow user input for story customization
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="settings.autoGenerate"
                      checked={formData.settings.autoGenerate}
                      onChange={handleChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Auto-generate story branches
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibility
                  </label>
                  <select
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: World Building */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    World Building
                  </label>
                  <textarea
                    name="lore.worldBuilding"
                    value={formData.lore.worldBuilding}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Describe your story world, setting, and atmosphere..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story History
                  </label>
                  <textarea
                    name="lore.history"
                    value={formData.lore.history}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Background history and events that led to your story..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Rules
                  </label>
                  <div className="space-y-2">
                    {formData.lore.rules.map((rule, index) => (
                      <div key={index} className="flex">
                        <input
                          type="text"
                          value={rule}
                          onChange={(e) => {
                            const newRules = [...formData.lore.rules];
                            newRules[index] = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              lore: { ...prev.lore, rules: newRules }
                            }));
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Enter a story rule or constraint"
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            const newRules = formData.lore.rules.filter((_, i) => i !== index);
                            setFormData(prev => ({
                              ...prev,
                              lore: { ...prev.lore, rules: newRules }
                            }));
                          }}
                          className="ml-2"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          lore: { ...prev.lore, rules: [...prev.lore.rules, ''] }
                        }));
                      }}
                    >
                      Add Rule
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Generate */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Story Prompt *
                  </label>
                  <textarea
                    name="initialPrompt"
                    value={formData.initialPrompt}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Describe the beginning of your story. What happens first? Who are the main characters? What is the setting?"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Story Summary</h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>Title:</strong> {formData.title || 'Untitled'}</p>
                    <p><strong>Genre:</strong> {genres.find(g => g.value === formData.genre)?.label}</p>
                    <p><strong>Tone:</strong> {tones.find(t => t.value === formData.tone)?.label}</p>
                    <p><strong>Domain:</strong> {domains.find(d => d.value === formData.domain)?.label}</p>
                    <p><strong>Complexity:</strong> {formData.settings.branchingComplexity} choices per branch</p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={handleGenerateInitialStory}
                    loading={isGenerating}
                    disabled={!formData.title || !formData.initialPrompt}
                    className="flex items-center"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Generate Story
                  </Button>
                  <Button variant="outline" onClick={handleSaveDraft}>
                    <SaveIcon className="w-5 h-5 mr-2" />
                    Save as Draft
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryCreator;