import { useMemo } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { feature } from '../lib/featureManagement';
import { useFeature } from '../components/GrowthBookProvider';

export const usePlusSubscription = (): {
  showPlusSubscription: boolean;
  isPlus: boolean;
} => {
  const { user } = useAuthContext();
  const isPlus = user?.isPlus || false;

  const plusSubscriptionFeature = useFeature(feature.plusSubscription);

  return useMemo(
    () => ({
      showPlusSubscription: isPlus ? true : plusSubscriptionFeature,
      isPlus,
    }),
    [isPlus, plusSubscriptionFeature],
  );
};
