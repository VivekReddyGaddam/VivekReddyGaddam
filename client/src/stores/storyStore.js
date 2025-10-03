import { create } from 'zustand';
import { api } from './authStore';
import toast from 'react-hot-toast';

const useStoryStore = create((set, get) => ({
  // State
  stories: [],
  currentStory: null,
  storyNodes: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },

  // Actions
  fetchStories: async (params = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.get('/stories', { params });
      const { stories, pagination } = response.data;
      
      set({
        stories,
        pagination,
        isLoading: false,
      });
      
      return { success: true, stories, pagination };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch stories';
      set({
        stories: [],
        isLoading: false,
        error: errorMessage,
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  fetchPublicStories: async (params = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.get('/stories/public', { params });
      const { stories, pagination } = response.data;
      
      set({
        stories,
        pagination,
        isLoading: false,
      });
      
      return { success: true, stories, pagination };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch public stories';
      set({
        stories: [],
        isLoading: false,
        error: errorMessage,
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  fetchStory: async (storyId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.get(`/stories/${storyId}`);
      const story = response.data;
      
      set({
        currentStory: story,
        isLoading: false,
      });
      
      return { success: true, story };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch story';
      set({
        currentStory: null,
        isLoading: false,
        error: errorMessage,
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  createStory: async (storyData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post('/stories', storyData);
      const story = response.data;
      
      set((state) => ({
        stories: [story, ...state.stories],
        currentStory: story,
        isLoading: false,
      }));
      
      toast.success('Story created successfully!');
      return { success: true, story };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create story';
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  updateStory: async (storyId, storyData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.put(`/stories/${storyId}`, storyData);
      const updatedStory = response.data;
      
      set((state) => ({
        stories: state.stories.map(story => 
          story._id === storyId ? updatedStory : story
        ),
        currentStory: state.currentStory?._id === storyId ? updatedStory : state.currentStory,
        isLoading: false,
      }));
      
      toast.success('Story updated successfully!');
      return { success: true, story: updatedStory };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update story';
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  deleteStory: async (storyId) => {
    set({ isLoading: true, error: null });
    
    try {
      await api.delete(`/stories/${storyId}`);
      
      set((state) => ({
        stories: state.stories.filter(story => story._id !== storyId),
        currentStory: state.currentStory?._id === storyId ? null : state.currentStory,
        isLoading: false,
      }));
      
      toast.success('Story deleted successfully!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete story';
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  generateStoryNode: async (storyId, nodeData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post(`/stories/${storyId}/nodes`, nodeData);
      const newNode = response.data;
      
      set((state) => ({
        storyNodes: [...state.storyNodes, newNode],
        isLoading: false,
      }));
      
      return { success: true, node: newNode };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to generate story node';
      set({
        isLoading: false,
        error: errorMessage,
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  fetchStoryNodes: async (storyId, parentNodeId = null) => {
    set({ isLoading: true, error: null });
    
    try {
      const params = parentNodeId ? { parentNodeId } : {};
      const response = await api.get(`/stories/${storyId}/nodes`, { params });
      const nodes = response.data;
      
      set({
        storyNodes: nodes,
        isLoading: false,
      });
      
      return { success: true, nodes };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch story nodes';
      set({
        storyNodes: [],
        isLoading: false,
        error: errorMessage,
      });
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  },

  playStory: async (storyId) => {
    try {
      await api.post(`/stories/${storyId}/play`);
      return { success: true };
    } catch (error) {
      console.error('Failed to record play session:', error);
      return { success: false };
    }
  },

  clearCurrentStory: () => {
    set({
      currentStory: null,
      storyNodes: [],
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));

export { useStoryStore };