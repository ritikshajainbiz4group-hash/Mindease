import { NavigationContainer } from '@react-navigation/native';
import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from '../../src/navigation/RootNavigator';
import { useAuthStore } from '../../src/store/authStore';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SafeAreaProvider>
    <NavigationContainer>{children}</NavigationContainer>
  </SafeAreaProvider>
);

describe('RootNavigator', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isInitializing: true,
      isLoading: false,
      error: null,
    });
  });

  it('renders a loading indicator while initializing', () => {
    const { getByTestId } = render(<RootNavigator />, { wrapper: Wrapper });
    expect(getByTestId('activity-indicator')).toBeTruthy();
  });

  it('shows AuthStack when not authenticated after init', async () => {
    useAuthStore.setState({ isInitializing: false, isAuthenticated: false });
    const { findByText } = render(<RootNavigator />, { wrapper: Wrapper });
    await waitFor(async () => {
      expect(await findByText('Welcome back')).toBeTruthy();
    });
  });

  it('shows AppStack (HomeScreen) when authenticated after init', async () => {
    useAuthStore.setState({
      isInitializing: false,
      isAuthenticated: true,
      user: { id: '1', name: 'Jane', email: 'jane@test.com' },
    });
    const { findByText } = render(<RootNavigator />, { wrapper: Wrapper });
    await waitFor(async () => {
      expect(await findByText('How are you feeling today?')).toBeTruthy();
    });
  });
});
