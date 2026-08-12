import { useAuthContext } from '../contexts/AuthContext';
import { featurePlusSale } from '../lib/featureManagement';
import { iOSSupportsPlusPurchase } from '../lib/ios';
import { plusSaleCampaign } from '../lib/plus';
import { useConditionalFeature } from './useConditionalFeature';
import { usePlusSubscription } from './usePlusSubscription';

type UsePlusSale = typeof plusSaleCampaign & { isActive: boolean };

export const usePlusSale = (): UsePlusSale => {
  const { isAuthReady } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { value: isEnabled, isLoading } = useConditionalFeature({
    feature: featurePlusSale,
    shouldEvaluate: isAuthReady && !isPlus,
  });

  const hasNotEnded = Date.now() < new Date(plusSaleCampaign.endDate).getTime();

  return {
    ...plusSaleCampaign,
    isActive:
      !isLoading &&
      isEnabled &&
      !!plusSaleCampaign.discountId &&
      !isPlus &&
      hasNotEnded &&
      // StoreKit purchases go through Apple, which can't honour a Paddle discount.
      !iOSSupportsPlusPurchase(),
  };
};
