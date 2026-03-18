import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../constants';

export const setAuthToken = async (token: string): Promise<void> => {
  await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
};

export const getAuthToken = async (): Promise<string | null> => {
  return SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
};

export const removeAuthToken = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
};

export const setRefreshToken = async (token: string): Promise<void> => {
  await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
};

export const getRefreshToken = async (): Promise<string | null> => {
  return SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
};

export const removeRefreshToken = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
};

export const setUserProfile = async (user: object): Promise<void> => {
  await SecureStore.setItemAsync(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
};

export const getUserProfile = async <T>(): Promise<T | null> => {
  const raw = await SecureStore.getItemAsync(STORAGE_KEYS.USER_PROFILE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const removeUserProfile = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_PROFILE);
};

export const clearAllTokens = async (): Promise<void> => {
  await Promise.all([
    removeAuthToken(),
    removeRefreshToken(),
    removeUserProfile(),
  ]);
};
