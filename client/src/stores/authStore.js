import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post('/auth/login', { email, password });
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          toast.success('Welcome back!');
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Login failed';
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post('/auth/register', userData);
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          toast.success('Account created successfully!');
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Registration failed';
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          
          toast.success('Logged out successfully');
        }
      },

      loadUser: async () => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (token && user) {
          try {
            set({
              token,
              user: JSON.parse(user),
              isAuthenticated: true,
              isLoading: false,
            });
            
            // Verify token is still valid
            await api.get('/auth/me');
          } catch (error) {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else {
          set({ isLoading: false });
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true });
        
        try {
          const response = await api.put('/auth/profile', profileData);
          const updatedUser = response.data;
          
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          set({
            user: updatedUser,
            isLoading: false,
          });
          
          toast.success('Profile updated successfully!');
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Profile update failed';
          set({ isLoading: false, error: errorMessage });
          
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true });
        
        try {
          await api.put('/auth/password', { currentPassword, newPassword });
          
          set({ isLoading: false });
          toast.success('Password changed successfully!');
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Password change failed';
          set({ isLoading: false, error: errorMessage });
          
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      },

      refreshToken: async () => {
        try {
          const response = await api.post('/auth/refresh');
          const { token } = response.data;
          
          localStorage.setItem('token', token);
          
          set({ token });
          return { success: true };
        } catch (error) {
          // Refresh failed, logout user
          get().logout();
          return { success: false };
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth state on app load
useAuthStore.getState().loadUser();

export { useAuthStore, api };