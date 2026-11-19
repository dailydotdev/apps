import { useCallback } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import usePersistentContext, {
  PersistentContextKeys,
} from '../../hooks/usePersistentContext';
import { featurePatchyCompanion } from '../../lib/featureManagement';

// Patchy is the reading streak's face, so he only exists when streaks show.
export const usePatchyEnabled = ({
  shouldEvaluate = true,
}: { shouldEvaluate?: boolean } = {}): boolean => {
  const { isLoggedIn } = useAuthContext();
  const { optOutReadingStreak, loadedSettings } = useSettingsContext();
  const isEligible =
    shouldEvaluate && isLoggedIn && loadedSettings && !optOutReadingStreak;
  const { value: isFeatureEnabled } = useConditionalFeature({
    feature: featurePatchyCompanion,
    shouldEvaluate: isEligible,
  });

  return isEligible && isFeatureEnabled;
};

type PatchyReactionsValue = 'on' | 'off';

interface UsePatchyReactions {
  isReactionsEnabled: boolean;
  setReactionsEnabled: (enabled: boolean) => Promise<void>;
}

// Whether he peeks out to react; his face shows either way. Per device for
// now: a server flag needs an API change, and phase 1 is frontend only.
export const usePatchyReactions = (): UsePatchyReactions => {
  const [reactions, setReactions] = usePersistentContext<PatchyReactionsValue>(
    PersistentContextKeys.PatchyReactions,
    'on',
    ['on', 'off'],
    'on',
  );
  const setReactionsEnabled = useCallback(
    (enabled: boolean) => setReactions(enabled ? 'on' : 'off'),
    [setReactions],
  );

  return { isReactionsEnabled: reactions !== 'off', setReactionsEnabled };
};

type PatchySuggestionsValue = 'on' | 'off';

interface UsePatchySuggestions {
  isSuggestionsEnabled: boolean;
  setSuggestionsEnabled: (enabled: boolean) => Promise<void>;
}

// Whether he offers to help (the bubbles). Per device, like reactions.
export const usePatchySuggestions = (): UsePatchySuggestions => {
  const [suggestions, setSuggestions] =
    usePersistentContext<PatchySuggestionsValue>(
      PersistentContextKeys.PatchySuggestions,
      'on',
      ['on', 'off'],
      'on',
    );
  const setSuggestionsEnabled = useCallback(
    (enabled: boolean) => setSuggestions(enabled ? 'on' : 'off'),
    [setSuggestions],
  );

  return {
    isSuggestionsEnabled: suggestions !== 'off',
    setSuggestionsEnabled,
  };
};
