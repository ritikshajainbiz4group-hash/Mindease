import { useCallback, useEffect, useState } from 'react';
import analyticsService from '../api/analyticsService';
import { EmotionStatsResponse } from '../api/types';
import { formatErrorMessage } from '../utils';

export interface UseEmotionStatsReturn {
  stats: EmotionStatsResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const useEmotionStats = (): UseEmotionStatsReturn => {
  const [stats, setStats] = useState<EmotionStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getEmotionStats();
      setStats(data);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
};

export default useEmotionStats;
