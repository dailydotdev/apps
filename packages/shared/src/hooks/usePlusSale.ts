import { useAuthContext } from '../contexts/AuthContext';
import type { PlusSaleConfig } from '../lib/featureManagement';
import { featurePlusSale } from '../lib/featureManagement';
import { iOSSupportsPlusPurchase } from '../lib/ios';
import { useConditionalFeature } from './useConditionalFeature';
import { usePlusSubscription } from './usePlusSubscription';

type UsePlusSale = Omit<PlusSaleConfig, 'discountId'> & {
  isActive: boolean;
  /** Only set while the sale is active, so it can't be applied when it isn't. */
  discountId?: string;
};

export const usePlusSale = (): UsePlusSale => {
  const { isAuthReady } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { value, isLoading } = useConditionalFeature({
    feature: featurePlusSale,
    shouldEvaluate: isAuthReady && !isPlus,
  });
  const { discountId, label, endDate } = value;

  const hasNotEnded = !!endDate && Date.now() < new Date(endDate).getTime();
  const isActive =
    !isLoading &&
    !!discountId &&
    // A payload configured without copy would advertise an empty badge.
    !!label &&
    !isPlus &&
    hasNotEnded &&
    // StoreKit purchases go through Apple, which can't honour a Paddle discount.
    !iOSSupportsPlusPurchase();

  return {
    ...value,
    isActive,
    discountId: isActive ? discountId : undefined,
  };
};
