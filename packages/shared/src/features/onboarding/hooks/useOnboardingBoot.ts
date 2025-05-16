import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query/src/types';
import type { FunnelBootData } from '../types/funnelBoot';

/**
 * Query key for onboarding boot data
 */
export const ONBOARDING_BOOT_QUERY_KEY = ['onboardingBoot'];

/**
 * Hook for accessing onboarding boot data in client components
 * @returns React Query result with funnel boot data
 */
export const useOnboardingBoot = (): UseQueryResult<FunnelBootData> => {
  return useQuery({
    queryKey: ONBOARDING_BOOT_QUERY_KEY,
    // The data is pre-fetched on the server, so we don't need to define a queryFn
    // The query will use the dehydrated state from the HydrationBoundary
    staleTime: Infinity,
  });
};
