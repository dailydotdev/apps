import { useAuthContext } from '../contexts/AuthContext';
import { featurePlusSale } from '../lib/featureManagement';
import { iOSSupportsPlusPurchase } from '../lib/ios';
import { plusSaleCampaign } from '../lib/plus';
import { useConditionalFeature } from './useConditionalFeature';
import { usePlusSubscription } from './usePlusSubscription';

type UsePlusSale = typeof plusSaleCampaign & {
  isActive: boolean;
  /** Only set while the sale is active, so it can't be applied when it isn't. */
  discountId?: string;
};

export const usePlusSale = (): UsePlusSale => {
  const { isAuthReady } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { value: discountId, isLoading } = useConditionalFeature({
    feature: featurePlusSale,
    shouldEvaluate: isAuthReady && !isPlus,
  });

  const hasNotEnded = Date.now() < new Date(plusSaleCampaign.endDate).getTime();
  const isActive =
    !isLoading &&
    !!discountId &&
    !isPlus &&
    hasNotEnded &&
    // StoreKit purchases go through Apple, which can't honour a Paddle discount.
    !iOSSupportsPlusPurchase();

  return {
    ...plusSaleCampaign,
    isActive,
    discountId: isActive ? discountId : undefined,
  };
};
