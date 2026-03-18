export const APP_NAME = 'MindEase';
export const APP_TAGLINE = 'Your calm companion, always here';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PROFILE: 'user_profile',
} as const;

export const API_TIMEOUT_MS = 15000;

export const PASSWORD_MIN_LENGTH = 6;
export const NAME_MIN_LENGTH = 2;

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_STRONG: /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/,
} as const;
