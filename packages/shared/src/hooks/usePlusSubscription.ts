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

  const showPlusSubscription = useMemo(
    () => (isPlus ? true : plusSubscriptionFeature),
    [isPlus, plusSubscriptionFeature],
  );

  return {
    showPlusSubscription,
    isPlus,
  };
};
