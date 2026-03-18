import { create } from 'zustand';
import authApiService from '../api/authService';
import { setForceLogoutCallback } from '../api/client';
import { ApiUser } from '../api/types';
import { User, AuthState } from '../types/auth';
import {
  clearAllTokens,
  getAuthToken,
  getUserProfile,
  setAuthToken,
  setRefreshToken,
  setUserProfile,
} from '../utils/secureStorage';

const mapApiUser = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  name: apiUser.name,
  email: apiUser.email,
  photoURL: apiUser.photo_url ?? undefined,
});

// Register the force-logout handler so client.ts can reset auth state
// when a token refresh fails, without creating a circular import.
setForceLogoutCallback(() => {
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    error: 'Session expired. Please log in again.',
  });
});

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  initialize: async () => {
    try {
      const [token, user] = await Promise.all([
        getAuthToken(),
        getUserProfile<User>(),
      ]);
      if (token && user) {
        set({ user, isAuthenticated: true });
      }
    } catch {
      // Silently fail — user will be prompted to log in
    } finally {
      set({ isInitializing: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApiService.login({ email, password });
      const user = mapApiUser(response.user);
      await Promise.all([
        setAuthToken(response.access_token),
        setRefreshToken(response.refresh_token),
        setUserProfile(user),
      ]);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      set({ isLoading: false, error: message });
    }
  },

  signup: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApiService.signup({ name, email, password });
      const user = mapApiUser(response.user);
      await Promise.all([
        setAuthToken(response.access_token),
        setRefreshToken(response.refresh_token),
        setUserProfile(user),
      ]);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed. Please try again.';
      set({ isLoading: false, error: message });
    }
  },

  logout: async () => {
    try {
      await authApiService.logout();
    } catch {
      // Best-effort — always clear local state even if server call fails
    } finally {
      await clearAllTokens();
      set({ user: null, isAuthenticated: false, error: null });
    }
  },
}));
