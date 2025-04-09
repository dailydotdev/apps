import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query/src/types';
import type { FunnelBootData } from '../types/funnelBoot';

/**
 * Query key for funnel boot data
 */
export const FUNNEL_BOOT_QUERY_KEY = ['funnelBoot'];

/**
 * Hook for accessing funnel boot data in client components
 * @returns React Query result with funnel boot data
 */
export const useFunnelBoot = (): UseQueryResult<FunnelBootData> => {
  return useQuery({
    queryKey: FUNNEL_BOOT_QUERY_KEY,
    // The data is pre-fetched on the server, so we don't need to define a queryFn
    // The query will use the dehydrated state from the HydrationBoundary
    staleTime: Infinity,
  });
};
