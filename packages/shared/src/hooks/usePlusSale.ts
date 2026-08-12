import { useAuthContext } from '../contexts/AuthContext';
import type { PlusSaleConfig } from '../lib/featureManagement';
import { featurePlusSale } from '../lib/featureManagement';
import { iOSSupportsPlusPurchase } from '../lib/ios';
import { useConditionalFeature } from './useConditionalFeature';
import { usePlusSubscription } from './usePlusSubscription';

interface UsePlusSale extends PlusSaleConfig {
  isActive: boolean;
}

export const usePlusSale = (): UsePlusSale => {
  const { isAuthReady } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { value, isLoading } = useConditionalFeature({
    feature: featurePlusSale,
    shouldEvaluate: isAuthReady && !isPlus,
  });

  const hasNotEnded = Date.now() < new Date(value.endDate).getTime();

  return {
    ...value,
    isActive:
      !isLoading &&
      value.enabled &&
      !!value.discountId &&
      !isPlus &&
      hasNotEnded &&
      // StoreKit purchases go through Apple, which can't honour a Paddle discount.
      !iOSSupportsPlusPurchase(),
  };
};
