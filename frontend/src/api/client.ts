import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import Config from '../config';
import {
  clearAllTokens,
  getAuthToken,
  getRefreshToken,
  setAuthToken,
  setRefreshToken,
} from '../utils/secureStorage';
import { ApiError } from './types';

// ── Force-logout callback ─────────────────────────────────────────────────────
// Registered by authStore to avoid a circular import (store → service → client).
let forceLogoutCallback: (() => void) | null = null;

export const setForceLogoutCallback = (fn: () => void): void => {
  forceLogoutCallback = fn;
};

// ── Refresh-queue state ───────────────────────────────────────────────────────
// Prevents multiple concurrent 401s from each kicking off their own refresh.
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

const drainQueue = (newToken: string): void => {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
};

const purgeQueue = (): void => {
  refreshQueue = [];
};

// ── Extend axios config to carry retry flag ───────────────────────────────────
interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ── Client instance ───────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach Bearer token ──────────────────────────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ── Response interceptor: 401 refresh + retry, then error normalisation ───────
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // Another refresh is already in flight — queue this request.
        return new Promise<AxiosResponse>((resolve, reject) => {
          refreshQueue.push((newToken: string) => {
            if (!originalRequest.headers) {
              reject(error);
              return;
            }
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = await getRefreshToken();
        if (!storedRefreshToken) throw new Error('No refresh token stored');

        // Use bare axios (not apiClient) so this call never triggers this interceptor.
        const { data } = await axios.post<{
          access_token: string;
          refresh_token: string;
        }>(`${Config.API_BASE_URL}/api/v1/auth/refresh`, {
          refresh_token: storedRefreshToken,
        });

        await Promise.all([
          setAuthToken(data.access_token),
          setRefreshToken(data.refresh_token),
        ]);

        apiClient.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;

        drainQueue(data.access_token);
        return apiClient(originalRequest);
      } catch {
        purgeQueue();
        await clearAllTokens();
        forceLogoutCallback?.();
        return Promise.reject(new Error('Session expired. Please log in again.'));
      } finally {
        isRefreshing = false;
      }
    }

    // ── Standard error normalisation ─────────────────────────────────────────
    const serverDetail = error.response?.data?.detail;
    const fieldErrors = error.response?.data?.errors;

    let message: string;

    if (fieldErrors && fieldErrors.length > 0) {
      message = fieldErrors
        .map((e: { field: string; message: string }) => `${e.field}: ${e.message}`)
        .join(', ');
    } else if (serverDetail) {
      message = serverDetail;
    } else if (error.code === 'ECONNABORTED') {
      message = 'Request timed out. Please check your connection.';
    } else if (!error.response) {
      message = 'Network error. Please check your connection.';
    } else {
      message = error.message ?? 'An unexpected error occurred.';
    }

    return Promise.reject(new Error(message));
  },
);

export default apiClient;
