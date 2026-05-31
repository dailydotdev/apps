import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featurePostBuildFeed } from '../../lib/featureManagement';

interface UseAnonPostOnboarding {
  /** True only for logged-out visitors once auth is resolved. */
  isAnonymous: boolean;
  /** True when the anonymous build-feed experience should render. */
  isEnabled: boolean;
}

/**
 * Central gate for the anonymous post-page "build your feed" experience.
 * Every piece of the experience (sidebar widget, feed taste, conversion
 * prompt, banner consolidation) reads from this single hook so the behavior
 * is consistent and evaluated once per surface.
 */
export const useAnonPostOnboarding = (): UseAnonPostOnboarding => {
  const { user, isAuthReady } = useAuthContext();
  const isAnonymous = isAuthReady && !user;
  const { value: isFlagEnabled } = useConditionalFeature({
    feature: featurePostBuildFeed,
    shouldEvaluate: isAnonymous,
  });

  return {
    isAnonymous,
    isEnabled: isAnonymous && isFlagEnabled,
  };
};
