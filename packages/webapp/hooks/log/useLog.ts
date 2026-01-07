import { useQuery } from '@tanstack/react-query';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import type { LogData } from '../../types/log';

/**
 * Query key for log data
 */
export const LOG_QUERY_KEY = ['log'];

export interface UseLogOptions {
  enabled?: boolean;
  userId?: string;
}

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
async function fetchLog(userId?: string): Promise<LogData> {
  const url = new URL(`${apiUrl}/log`);
  if (userId) {
    url.searchParams.set('userId', userId);
  }

  const response = await fetch(url.toString(), {
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
 */
export function useLog(options: UseLogOptions | boolean = true): UseLogResult {
  const { enabled = true, userId } =
    typeof options === 'boolean' ? { enabled: options } : options;

  const query = useQuery<LogData, Error>({
    queryKey: userId ? [...LOG_QUERY_KEY, userId] : LOG_QUERY_KEY,
    queryFn: () => fetchLog(userId),
    enabled,
    staleTime: Infinity, // Log data doesn't change often
    retry: (failureCount, error) => {
      // Don't retry on 404 (no data available)
      if (error instanceof NoLogDataError) {
        return false;
      }
      return failureCount < 3;
    },
  });

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
