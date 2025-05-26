import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../contexts/AuthContext';
import type { PurchaseType } from '../graphql/paddle';
import {
  fetchPricingPreview,
  fetchPricingPreviewByIds,
} from '../graphql/paddle';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';

export interface ProductPricingConfig {
  type: PurchaseType;
  locale?: string;
  enabled?: boolean;
}

export const useProductPricing = ({
  type,
  locale,
  enabled = true,
}: ProductPricingConfig) => {
  const { user, isValidRegion } = useAuthContext();

  return useQuery({
    queryKey: generateQueryKey(RequestKey.PricePreview, user, type, locale),
    queryFn: () => fetchPricingPreview(type, locale),
    enabled: enabled && isValidRegion,
    staleTime: StaleTime.Default,
  });
};

export interface ProductPricingByIdsConfig {
  ids: string[];
  locale?: string;
}

export const useProductPricingByIds = ({
  ids,
  locale,
}: ProductPricingByIdsConfig) => {
  const { user, isValidRegion } = useAuthContext();

  return useQuery({
    queryKey: generateQueryKey(RequestKey.PricePreview, user, ids, locale),
    queryFn: () => fetchPricingPreviewByIds(ids, locale),
    enabled: isValidRegion && ids.length > 0,
    staleTime: StaleTime.Default,
  });
};
