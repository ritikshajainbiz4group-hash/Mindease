import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

const useAuth = () => {
  const { user, isAuthenticated, isLoading, isInitializing, error, login, signup, logout, clearError } =
    useAuthStore();

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      clearError();
      await login(email, password);
    },
    [login, clearError],
  );

  const handleSignup = useCallback(
    async (name: string, email: string, password: string) => {
      clearError();
      await signup(name, email, password);
    },
    [signup, clearError],
  );

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitializing,
    error,
    handleLogin,
    handleSignup,
    handleLogout,
    clearError,
  };
};

export default useAuth;
