import { User } from '../types/auth';
import {
  clearAllTokens,
  getAuthToken,
  getRefreshToken,
  getUserProfile,
  removeAuthToken,
  removeRefreshToken,
  setAuthToken,
  setRefreshToken,
  setUserProfile as setUserProfileRaw,
} from '../utils/secureStorage';

const SecureStorage = {
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  setRefreshToken,
  getRefreshToken,
  removeRefreshToken,

  clearTokens: async (): Promise<void> => {
    await Promise.all([removeAuthToken(), removeRefreshToken()]);
  },

  setUserProfile: async (user: User): Promise<void> => {
    await setUserProfileRaw(user);
  },

  getUserProfile: async (): Promise<User | null> => {
    return getUserProfile<User>();
  },

  clearAll: clearAllTokens,
};

export default SecureStorage;
