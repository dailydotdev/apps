import { useQuery } from '@tanstack/react-query';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import type { LogData } from '../../types/log';

/**
 * Query key for log data
 */
export const LOG_QUERY_KEY = ['log'];

/**
 * Fetch log data from the API
 */
async function fetchLog(): Promise<LogData> {
  const response = await fetch(`${apiUrl}/log`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch log data');
  }

  return response.json();
}

/**
 * Hook for fetching log data from the API
 */
export function useLog(enabled = true) {
  return useQuery<LogData>({
    queryKey: LOG_QUERY_KEY,
    queryFn: fetchLog,
    enabled,
    staleTime: Infinity, // Log data doesn't change often
  });
}
