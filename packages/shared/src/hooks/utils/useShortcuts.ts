import { useMemo } from 'react';

import { useAuthContext } from '../../contexts/AuthContext';
import { feature } from '../../lib/featureManagement';
import { ShortcutsUIExperiment } from '../../lib/featureValues';
import { isExtension } from '../../lib/func';
import { useConditionalFeature } from '../useConditionalFeature';

interface UseShortcuts {
  isShortcutsV1: boolean;
}

/**
 * Hook to determine if the user is on the old version of shortcuts
 * More information in this thread: https://dailydotdev.slack.com/archives/C02JAUF8HJL/p1720008775281939
 * Keywords: shortcutsUI, onboarding_most_visited
 */
export const useShortcuts = (): UseShortcuts => {
  const { isLoggedIn, user } = useAuthContext();
  const { value: shortcutsUIVersion } = useConditionalFeature({
    feature: feature.shortcutsUI,
    shouldEvaluate: isLoggedIn && isExtension,
  });

  const isShortcutsV1 = useMemo(
    () => user?.isTeamMember || shortcutsUIVersion === ShortcutsUIExperiment.V1,
    [user?.isTeamMember, shortcutsUIVersion],
  );

  return {
    isShortcutsV1,
  };
};
