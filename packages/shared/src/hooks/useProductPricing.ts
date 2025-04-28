import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../contexts/AuthContext';
import type { ProductPricingType } from '../graphql/paddle';
import { fetchPricingPreview } from '../graphql/paddle';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';

export interface ProductPricingConfig {
  type: ProductPricingType;
  enabled?: boolean;
}

export const useProductPricing = ({
  type,
  enabled = true,
}: ProductPricingConfig) => {
  const { user, isValidRegion } = useAuthContext();

  return useQuery({
    queryKey: generateQueryKey(RequestKey.PricePreview, user, type),
    queryFn: () => fetchPricingPreview(type),
    enabled: enabled && isValidRegion,
    staleTime: StaleTime.Default,
  });
};
