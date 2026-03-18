import Constants from 'expo-constants';

const Config = {
  API_BASE_URL: Constants.expoConfig?.extra?.apiBaseUrl ?? 'http://localhost:8000',
  APP_ENV: Constants.expoConfig?.extra?.appEnv ?? 'development',
  GOOGLE_WEB_CLIENT_ID: Constants.expoConfig?.extra?.googleWebClientId ?? '',
  isDev: Constants.expoConfig?.extra?.appEnv !== 'production',
} as const;

export default Config;
