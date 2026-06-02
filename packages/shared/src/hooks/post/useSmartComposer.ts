import { useCallback } from 'react';
import { useFeaturesReadyContext } from '../../components/GrowthBookProvider';
import { useAuthContext } from '../../contexts/AuthContext';
import { featureSmartComposer } from '../../lib/featureManagement';

interface UseSmartComposer {
  evaluateSmartComposer: () => boolean;
}

export const useSmartComposer = (): UseSmartComposer => {
  const { user, isAuthReady } = useAuthContext();
  const { ready, getFeatureValue } = useFeaturesReadyContext();

  const evaluateSmartComposer = useCallback(() => {
    if (!isAuthReady || !user || !ready) {
      return featureSmartComposer.defaultValue;
    }

    return !!getFeatureValue(featureSmartComposer);
  }, [getFeatureValue, isAuthReady, ready, user]);

  return { evaluateSmartComposer };
};
