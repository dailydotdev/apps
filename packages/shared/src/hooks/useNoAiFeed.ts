import { useCallback, useMemo } from 'react';
import { featureNoAiFeed } from '../lib/featureManagement';
import { useConditionalFeature } from './useConditionalFeature';
import usePersistentContext from './usePersistentContext';

const NO_AI_FEED_KEY = 'dailydev:noAiFeed';

type UseNoAiFeedProps = {
  shouldEvaluate?: boolean;
};

type UseNoAiFeedReturn = {
  isNoAi: boolean;
  isNoAiAvailable: boolean;
  isLoaded: boolean;
  toggleNoAi: () => Promise<void>;
};

export const useNoAiFeed = ({
  shouldEvaluate = true,
}: UseNoAiFeedProps = {}): UseNoAiFeedReturn => {
  const { value: featureEnabled, isLoading: isFeatureLoading } =
    useConditionalFeature({
      feature: featureNoAiFeed,
      shouldEvaluate,
    });
  const [storedValue, setStoredValue, isFetched] =
    usePersistentContext<boolean>(NO_AI_FEED_KEY, false, [false, true], false);

  const toggleNoAi = useCallback(
    () => setStoredValue(!storedValue),
    [setStoredValue, storedValue],
  );

  const isNoAiAvailable = shouldEvaluate && featureEnabled;
  const isLoaded =
    !shouldEvaluate || (!isFeatureLoading && (!featureEnabled || isFetched));

  return useMemo(
    () => ({
      isNoAi: isNoAiAvailable && storedValue,
      isNoAiAvailable,
      isLoaded,
      toggleNoAi,
    }),
    [isLoaded, isNoAiAvailable, storedValue, toggleNoAi],
  );
};
