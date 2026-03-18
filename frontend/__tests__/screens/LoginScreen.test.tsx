import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../../src/screens/Auth/LoginScreen';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(),
}));

describe('LoginScreen', () => {
  const renderWithNav = () =>
    render(
      <NavigationContainer>
        <LoginScreen navigation={{ navigate: mockNavigate } as any} />
      </NavigationContainer>,
    );

  it('renders app title', () => {
    const { getByText } = renderWithNav();
    expect(getByText('MindEase')).toBeTruthy();
  });

  it('renders email and password inputs', () => {
    const { getByPlaceholderText } = renderWithNav();
    expect(getByPlaceholderText('you@example.com')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
  });

  it('shows validation errors when submitting empty form', () => {
    const { getByText } = renderWithNav();
    fireEvent.press(getByText('Sign In'));
    expect(getByText('Email is required')).toBeTruthy();
    expect(getByText('Password is required')).toBeTruthy();
  });

  it('navigates to Signup screen when link is pressed', () => {
    const { getByText } = renderWithNav();
    fireEvent.press(getByText('Sign Up'));
    expect(mockNavigate).toHaveBeenCalledWith('Signup');
  });
});
