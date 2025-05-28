import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useRouter } from 'next/router';
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
import type { ApiErrorResult } from '../../../graphql/common';
import { DEFAULT_ERROR, gqlClient } from '../../../graphql/common';
import {
  PREVIEW_SUBSCRIPTION_UPDATE_QUERY,
  UPDATE_ORGANIZATION_SUBSCRIPTION_MUTATION,
} from '../graphql';
import { StaleTime } from '../../../lib/query';
import { useToastNotification } from '../../../hooks';
import { parseOrDefault } from '../../../lib/func';
import type { UserOrganization } from '../types';
import { getOrganizationSettingsUrl } from '../utils';

export type PreviewOrganizationSubscriptionUpdate = {
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
  organizationId: string,
  quantity = 1,
  queryOptions?: Partial<
    UseQueryOptions<PreviewOrganizationSubscriptionUpdate>
  >,
) => {
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const queryClient = useQueryClient();
  const { user, isAuthReady } = useAuthContext();
  const { seats } = useOrganization(organizationId);
  const enableQuery = !!organizationId && !!user && isAuthReady;

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: generateOrganizationQueryKey(
      user,
      organizationId,
      'subscription',
    ),
    queryFn: async () => {
      const res = await gqlClient.request<{
        previewOrganizationSubscriptionUpdate: PreviewOrganizationSubscriptionUpdate;
      }>(PREVIEW_SUBSCRIPTION_UPDATE_QUERY, {
        id: organizationId,
        quantity: quantity || seats.total,
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

  const { mutateAsync: updateSubscription, isPending: isUpdatingSubscription } =
    useMutation({
      mutationFn: async ({
        id,
        quantity: inputQuantity,
      }: {
        id: string;
        quantity: number;
      }) => {
        const res = await gqlClient.request<{
          updateOrganizationSubscription: UserOrganization;
        }>(UPDATE_ORGANIZATION_SUBSCRIPTION_MUTATION, {
          id,
          quantity: inputQuantity,
        });

        return res.updateOrganizationSubscription;
      },
      onSuccess: async (res) => {
        await queryClient.setQueryData(
          generateOrganizationQueryKey(user, organizationId),
          () => res,
        );

        router.push(getOrganizationSettingsUrl(organizationId, 'members'));
        displayToast('The organization has been updated');
      },
      onError: (error: ApiErrorResult) => {
        const result = parseOrDefault<Record<string, string>>(
          error?.response?.errors?.[0]?.message,
        );

        displayToast(
          typeof result === 'object' ? result.handle : DEFAULT_ERROR,
        );
      },
    });

  return {
    data,
    isLoading,
    refetch,
    isRefetching,
    updateSubscription,
    isUpdatingSubscription,
  };
};
