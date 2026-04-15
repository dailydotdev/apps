import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../contexts/AuthContext';
import { BOOT_QUERY_KEY } from '../contexts/common';
import {
  isMarketingCtaTarget,
  type MarketingCta,
  type MarketingCtaVariant,
} from '../components/marketingCta/common';
import { gqlClient } from '../graphql/common';
import { MARKETING_CTAS_BY_VARIANT_QUERY } from '../graphql/marketingCta';
import { CLEAR_MARKETING_CTA_MUTATION } from '../graphql/users';
import type { Boot } from '../lib/boot';
import { generateQueryKey, RequestKey } from '../lib/query';

interface MarketingCtasResponse {
  marketingCtasByVariant: MarketingCta[];
}

interface UseMarketingCtas {
  marketingCtas: MarketingCta[];
  isLoading: boolean;
  dismiss: (campaignId: string) => Promise<void>;
}

/**
 * Loads marketing CTAs of a single variant via a dedicated GraphQL query,
 * but only when the current user is hinted as targeted via
 * `boot.marketingCtaVariants`. This keeps the boot payload small and
 * avoids firing the query for users who have nothing to show.
 */
export function useMarketingCtas(
  variant: MarketingCtaVariant,
): UseMarketingCtas {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const bootData = queryClient.getQueryData<Boot>(BOOT_QUERY_KEY);
  const isHinted = bootData?.marketingCtaVariants?.includes(variant) ?? false;

  const queryKey = generateQueryKey(RequestKey.MarketingCtas, user, variant);

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await gqlClient.request<MarketingCtasResponse>(
        MARKETING_CTAS_BY_VARIANT_QUERY,
        { variant },
      );
      return res.marketingCtasByVariant ?? [];
    },
    enabled: !!user && isHinted,
    staleTime: Infinity,
  });

  const targetedCtas = (data ?? []).filter(
    (cta) => !cta.targets || isMarketingCtaTarget(cta.targets),
  );

  const dismissMutation = useMutation({
    mutationFn: (campaignId: string) =>
      gqlClient.request(CLEAR_MARKETING_CTA_MUTATION, { campaignId }),
    onMutate: (campaignId) => {
      const previous = queryClient.getQueryData<MarketingCta[]>(queryKey);
      queryClient.setQueryData<MarketingCta[]>(queryKey, (current) =>
        (current ?? []).filter((cta) => cta.campaignId !== campaignId),
      );
      return { previous };
    },
    onError: (_err, _campaignId, context) => {
      if (!context?.previous) {
        throw new Error(
          'useMarketingCtas dismiss rollback missing previous cache snapshot',
        );
      }
      queryClient.setQueryData(queryKey, context.previous);
    },
  });

  const dismiss = useCallback(
    async (campaignId: string) => {
      await dismissMutation.mutateAsync(campaignId);
    },
    [dismissMutation],
  );

  return {
    marketingCtas: targetedCtas,
    isLoading,
    dismiss,
  };
}
