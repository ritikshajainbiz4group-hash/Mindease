import axios from 'axios';
import Config from '../config';
import apiClient from './client';
import { ApiAuthResponse, ApiUser, LoginRequest, SignupRequest } from './types';

const AUTH = '/api/v1/auth';

const authApiService = {
  login: async (payload: LoginRequest): Promise<ApiAuthResponse> => {
    const { data } = await apiClient.post<ApiAuthResponse>(
      `${AUTH}/login`,
      payload,
    );
    return data;
  },

  signup: async (payload: SignupRequest): Promise<ApiAuthResponse> => {
    const { data } = await apiClient.post<ApiAuthResponse>(
      `${AUTH}/register`,
      payload,
    );
    return data;
  },

  getMe: async (): Promise<ApiUser> => {
    const { data } = await apiClient.get<ApiUser>(`${AUTH}/me`);
    return data;
  },

  refresh: async (
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string; token_type: string }> => {
    const { data } = await axios.post(
      `${Config.API_BASE_URL}${AUTH}/refresh`,
      { refresh_token: refreshToken },
    );
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(`${AUTH}/logout`);
  },
};

export default authApiService;
