import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import type {
  Price,
  ProductPricing,
  ProductPricingPreview,
} from '../../../graphql/paddle';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  generateOrganizationQueryKey,
  useOrganization,
} from './useOrganization';
import { gqlClient } from '../../../graphql/common';
import { PREVIEW_SUBSCRIPTION_UPDATE_QUERY } from '../graphql';
import { StaleTime } from '../../../lib/query';

export type PreviewOrganizationSubscriptionUpdate = {
  status: string;
  pricing: ProductPricingPreview[];
  nextBilling: Date | null;
  total: ProductPricing | null;
  prorated: {
    total: Price | null;
    subTotal: Price | null;
    tax: Price | null;
  } | null;
};

export const useOrganizationSubscription = (
  orgId: string,
  quantity = 1,
  queryOptions?: Partial<
    UseQueryOptions<PreviewOrganizationSubscriptionUpdate>
  >,
) => {
  const { user, isAuthReady } = useAuthContext();
  const { isOwner } = useOrganization(orgId);
  const enableQuery = isOwner && !!orgId && !!user && isAuthReady;

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: generateOrganizationQueryKey(user, orgId, 'subscription'),
    queryFn: async () => {
      const res = await gqlClient.request<{
        previewOrganizationSubscriptionUpdate: PreviewOrganizationSubscriptionUpdate;
      }>(PREVIEW_SUBSCRIPTION_UPDATE_QUERY, {
        id: orgId,
        quantity,
        locale: navigator.language,
      });

      if (!res || !res.previewOrganizationSubscriptionUpdate) {
        return null;
      }

      return res.previewOrganizationSubscriptionUpdate;
    },
    staleTime: StaleTime.Default,
    ...queryOptions,
    enabled:
      typeof queryOptions?.enabled !== 'undefined'
        ? queryOptions.enabled && enableQuery
        : enableQuery,
  });

  return {
    data,
    isLoading,
    refetch,
    isRefetching,
  };
};
