import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import InputField from '../../src/components/InputField';

describe('InputField', () => {
  it('renders label correctly', () => {
    const { getByText } = render(
      <InputField label="Email" placeholder="you@example.com" />,
    );
    expect(getByText('Email')).toBeTruthy();
  });

  it('renders error message when error prop is provided', () => {
    const { getByText } = render(
      <InputField label="Email" error="Email is required" />,
    );
    expect(getByText('Email is required')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const mockOnChange = jest.fn();
    const { getByPlaceholderText } = render(
      <InputField placeholder="Type here" onChangeText={mockOnChange} />,
    );
    fireEvent.changeText(getByPlaceholderText('Type here'), 'hello');
    expect(mockOnChange).toHaveBeenCalledWith('hello');
  });
});
