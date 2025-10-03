import React, { useState, useEffect } from 'react';
import { useStoryStore } from '../../stores/storyStore';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  SaveIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const StoryEditor = ({ storyId, currentNode, onNodeUpdate, onNodeDelete }) => {
  const { generateStoryNode, isLoading } = useStoryStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editData, setEditData] = useState({
    text: '',
    choices: []
  });

  useEffect(() => {
    if (currentNode) {
      setEditData({
        text: currentNode.text || '',
        choices: currentNode.choices || []
      });
    }
  }, [currentNode]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // In a real implementation, this would call an API to update the node
    toast.success('Node updated successfully');
    setIsEditing(false);
    if (onNodeUpdate) {
      onNodeUpdate({ ...currentNode, ...editData });
    }
  };

  const handleCancel = () => {
    setEditData({
      text: currentNode.text || '',
      choices: currentNode.choices || []
    });
    setIsEditing(false);
  };

  const handleTextChange = (e) => {
    setEditData(prev => ({
      ...prev,
      text: e.target.value
    }));
  };

  const handleChoiceChange = (index, field, value) => {
    setEditData(prev => ({
      ...prev,
      choices: prev.choices.map((choice, i) => 
        i === index ? { ...choice, [field]: value } : choice
      )
    }));
  };

  const addChoice = () => {
    setEditData(prev => ({
      ...prev,
      choices: [...prev.choices, {
        id: prev.choices.length + 1,
        text: '',
        action: 'continue'
      }]
    }));
  };

  const removeChoice = (index) => {
    setEditData(prev => ({
      ...prev,
      choices: prev.choices.filter((_, i) => i !== index)
    }));
  };

  const generateNextSegment = async () => {
    if (!currentNode) return;

    setIsGenerating(true);
    try {
      const prompt = `Continue the story from "${currentNode.text.substring(0, 100)}..."`;
      
      await generateStoryNode(storyId, {
        parentNodeId: currentNode.nodeId,
        prompt,
        choiceId: null
      });
      
      toast.success('New story segment generated');
    } catch (error) {
      toast.error('Failed to generate story segment');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!currentNode) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <EyeIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No node selected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Select a node from the story tree to edit it.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {currentNode.isStartNode ? 'Start Node' : 
               currentNode.isEndNode ? 'End Node' : 
               `Node ${currentNode.nodeId.split('_')[1]}`}
            </h3>
            <p className="text-sm text-gray-600">
              Created {new Date(currentNode.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <>
                <Button variant="outline" onClick={handleEdit}>
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" onClick={generateNextSegment} loading={isGenerating}>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Generate Next
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <SaveIcon className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        {isEditing ? (
          <div className="space-y-6">
            {/* Story Text Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Text
              </label>
              <textarea
                value={editData.text}
                onChange={handleTextChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter the story text for this node..."
              />
            </div>

            {/* Choices Editor */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Choices
                </label>
                <Button size="sm" onClick={addChoice}>
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Choice
                </Button>
              </div>
              
              <div className="space-y-3">
                {editData.choices.map((choice, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={choice.text}
                        onChange={(e) => handleChoiceChange(index, 'text', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Choice text..."
                      />
                    </div>
                    <div className="w-32">
                      <select
                        value={choice.action}
                        onChange={(e) => handleChoiceChange(index, 'action', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="continue">Continue</option>
                        <option value="combat">Combat</option>
                        <option value="dialogue">Dialogue</option>
                        <option value="explore">Explore</option>
                        <option value="escape">Escape</option>
                        <option value="action">Action</option>
                        <option value="observe">Observe</option>
                      </select>
                    </div>
                    <button
                      onClick={() => removeChoice(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {editData.choices.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <p>No choices yet. Add choices to create story branches.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Story Text Display */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Story Text</h4>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {currentNode.text}
                </p>
              </div>
            </div>

            {/* Choices Display */}
            {currentNode.choices && currentNode.choices.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Choices</h4>
                <div className="space-y-2">
                  {currentNode.choices.map((choice, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-gray-900">{choice.text}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        {choice.action}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Metadata</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Genre:</span>
                  <span className="ml-2 text-gray-900 capitalize">{currentNode.metadata?.genre}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tone:</span>
                  <span className="ml-2 text-gray-900 capitalize">{currentNode.metadata?.tone}</span>
                </div>
                <div>
                  <span className="text-gray-600">Domain:</span>
                  <span className="ml-2 text-gray-900 capitalize">{currentNode.metadata?.domain}</span>
                </div>
                <div>
                  <span className="text-gray-600">Word Count:</span>
                  <span className="ml-2 text-gray-900">{currentNode.metadata?.wordCount}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryEditor;