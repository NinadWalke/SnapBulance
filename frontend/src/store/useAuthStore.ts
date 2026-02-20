// src/store/useAuthStore.ts
import { create } from 'zustand';
import { api } from '../utils/api';

// 1. Define your Types based on your Prisma Schema
export type Role = 'USER' | 'DRIVER' | 'HOSPITAL_ADMIN' | 'CFR' | 'SYS_ADMIN';

export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  checkAuth: () => Promise<void>;
  login: (credentials: any) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  handleSessionExpired: () => void; // New action
}

// 2. Create the Store
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start true so we can check auth on initial load

  checkAuth: async () => {
    try {
      // Hits your @Get() endpoint in AuthController
      const response = await api.get('/auth'); 
      if (response.data.isAuth) {
        set({ user: response.data.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      // The backend sets the HTTP-only cookie here
      const response = await api.post('/auth/login', credentials);
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error; // Let the component handle the error UI
    }
  },

  signup: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/signup', userData);
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      // Hits backend to clear the cookie
      await api.post('/auth/logout');
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed', error);
    }
  },
  // Called purely by the Axios Interceptor
  handleSessionExpired: () => {
    set({ user: null, isAuthenticated: false });
    // Note: React Router will automatically detect isAuthenticated === false 
    // and kick them out of any ProtectedRoute.
  },
}));