import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const useStoryStore = create((set, get) => ({
  stories: [],
  currentStory: null,
  currentNode: null,
  loading: false,
  error: null,
  pagination: null,

  // Fetch user's stories
  fetchStories: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/stories`, { params });
      set({ 
        stories: response.data.stories,
        pagination: response.data.pagination,
        loading: false 
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch stories';
      set({ error: message, loading: false });
    }
  },

  // Create new story
  createStory: async (storyData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/stories`, storyData);
      const newStory = response.data;
      
      set(state => ({ 
        stories: [newStory, ...state.stories],
        currentStory: newStory,
        currentNode: newStory.nodes[0],
        loading: false 
      }));
      
      return { success: true, story: newStory };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create story';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Fetch single story
  fetchStory: async (storyId) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/stories/${storyId}`);
      const story = response.data;
      const currentNode = story.nodes.find(n => n.id === story.currentNodeId) || story.nodes[0];
      
      set({ 
        currentStory: story,
        currentNode,
        loading: false 
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch story';
      set({ error: message, loading: false });
    }
  },

  // Continue story with a choice
  continueStory: async (storyId, currentNodeId, choiceIndex) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/stories/${storyId}/continue`, {
        currentNodeId,
        choiceIndex
      });
      
      const { node, story } = response.data;
      
      set({ 
        currentStory: story,
        currentNode: node,
        loading: false 
      });
      
      return { success: true, node };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to continue story';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Update story
  updateStory: async (storyId, updates) => {
    try {
      const response = await axios.put(`${API_URL}/stories/${storyId}`, updates);
      const updatedStory = response.data;
      
      set(state => ({
        stories: state.stories.map(s => s._id === storyId ? updatedStory : s),
        currentStory: state.currentStory?._id === storyId ? updatedStory : state.currentStory
      }));
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update story';
      return { success: false, error: message };
    }
  },

  // Delete story
  deleteStory: async (storyId) => {
    try {
      await axios.delete(`${API_URL}/stories/${storyId}`);
      
      set(state => ({
        stories: state.stories.filter(s => s._id !== storyId),
        currentStory: state.currentStory?._id === storyId ? null : state.currentStory
      }));
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete story';
      return { success: false, error: message };
    }
  },

  // Export story
  exportStory: async (storyId) => {
    try {
      const response = await axios.get(`${API_URL}/stories/${storyId}/export`);
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to export story';
      return { success: false, error: message };
    }
  },

  // Fetch public stories
  fetchPublicStories: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/stories/public/feed`, { params });
      set({ 
        stories: response.data.stories,
        pagination: response.data.pagination,
        loading: false 
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch public stories';
      set({ error: message, loading: false });
    }
  },

  // Clear current story
  clearCurrentStory: () => set({ currentStory: null, currentNode: null }),

  // Clear error
  clearError: () => set({ error: null })
}));

export default useStoryStore;
