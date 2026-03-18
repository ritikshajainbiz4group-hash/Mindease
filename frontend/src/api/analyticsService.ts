import apiClient from './client';
import { EmotionStatsResponse } from './types';

const ANALYTICS = '/api/v1/analytics';

const analyticsService = {
  getEmotionStats: async (): Promise<EmotionStatsResponse> => {
    const { data } = await apiClient.get<EmotionStatsResponse>(
      `${ANALYTICS}/emotions`,
    );
    return data;
  },
};

export default analyticsService;
