import { useQuery } from '@tanstack/react-query';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import type { LogData } from '../../types/log';
import { useLogDataOverride } from '../../contexts/LogDataOverrideContext';

/**
 * Query key for log data
 */
export const LOG_QUERY_KEY = ['log'];

/**
 * Custom error class for when user has no log data
 */
export class NoLogDataError extends Error {
  constructor() {
    super('No log data available');
    this.name = 'NoLogDataError';
  }
}

/**
 * Fetch log data from the API.
 * Throws NoLogDataError if user doesn't have enough data (404 response).
 */
async function fetchLog(): Promise<LogData> {
  const response = await fetch(`${apiUrl}/log`, {
    credentials: 'include',
  });

  if (response.status === 404) {
    throw new NoLogDataError();
  }

  if (!response.ok) {
    throw new Error('Failed to fetch log data');
  }

  return response.json();
}

/**
 * Return type for useLog hook
 */
export interface UseLogResult {
  data: LogData | undefined;
  isLoading: boolean;
  hasData: boolean;
  error: Error | null;
}

/**
 * Hook for fetching log data from the API.
 * Returns hasData: false when the user doesn't have enough 2025 activity.
 * If override data is provided (via uploaded JSON), it takes precedence over API data.
 */
export function useLog(enabled = true): UseLogResult {
  const { overrideData } = useLogDataOverride();

  const query = useQuery<LogData, Error>({
    queryKey: LOG_QUERY_KEY,
    queryFn: fetchLog,
    enabled: enabled && !overrideData, // Don't fetch from API if we have override data
    staleTime: Infinity, // Log data doesn't change often
    retry: (failureCount, error) => {
      // Don't retry on 404 (no data available)
      if (error instanceof NoLogDataError) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // If we have override data, use it instead of API data
  if (overrideData) {
    return {
      data: overrideData,
      isLoading: false,
      hasData: true,
      error: null,
    };
  }

  // Determine if user has data based on whether we got a NoLogDataError
  const hasNoDataError = query.error instanceof NoLogDataError;
  const hasData = !hasNoDataError && !query.error;

  return {
    data: query.data,
    isLoading: query.isLoading,
    hasData,
    error: hasNoDataError ? null : query.error,
  };
}
