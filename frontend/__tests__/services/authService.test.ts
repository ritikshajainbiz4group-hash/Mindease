import authApiService from '../../src/api/authService';
import { ApiAuthResponse } from '../../src/api/types';

jest.mock('../../src/api/client', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

const mockAuthResponse: ApiAuthResponse = {
  user: {
    id: 'user-1',
    name: 'Jane Doe',
    email: 'jane@test.com',
    is_active: true,
    is_verified: false,
    photo_url: null,
  },
  access_token: 'access-token-123',
  refresh_token: 'refresh-token-456',
  token_type: 'bearer',
};

describe('authApiService', () => {
  let mockClient: { post: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = require('../../src/api/client').default;
  });

  describe('login', () => {
    it('calls POST /api/v1/auth/login and returns auth response', async () => {
      mockClient.post.mockResolvedValueOnce({ data: mockAuthResponse });

      const result = await authApiService.login({
        email: 'jane@test.com',
        password: 'secret',
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        '/api/v1/auth/login',
        { email: 'jane@test.com', password: 'secret' },
      );
      expect(result.access_token).toBe('access-token-123');
      expect(result.user.email).toBe('jane@test.com');
    });

    it('propagates error thrown by client', async () => {
      mockClient.post.mockRejectedValueOnce(new Error('Network error. Please check your connection.'));

      await expect(
        authApiService.login({ email: 'jane@test.com', password: 'wrong' }),
      ).rejects.toThrow('Network error. Please check your connection.');
    });
  });

  describe('signup', () => {
    it('calls POST /api/v1/auth/register and returns auth response', async () => {
      mockClient.post.mockResolvedValueOnce({ data: mockAuthResponse });

      const result = await authApiService.signup({
        name: 'Jane Doe',
        email: 'jane@test.com',
        password: 'secret',
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        '/api/v1/auth/register',
        { name: 'Jane Doe', email: 'jane@test.com', password: 'secret' },
      );
      expect(result.refresh_token).toBe('refresh-token-456');
    });
  });

  describe('logout', () => {
    it('calls POST /api/v1/auth/logout', async () => {
      mockClient.post.mockResolvedValueOnce({ data: {} });

      await authApiService.logout();

      expect(mockClient.post).toHaveBeenCalledWith('/api/v1/auth/logout');
    });
  });
});
