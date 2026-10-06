import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureDirectMessages } from '../../../lib/featureManagement';

type UseMessagesEnabled = {
  isEnabled: boolean;
  // Signed in but outside the flag: pages redirect, an anonymous visitor gets
  // the sign-in wall instead since they were never evaluated.
  isGatedOut: boolean;
};

export const useMessagesEnabled = (): UseMessagesEnabled => {
  const { user, isAuthReady } = useAuthContext();
  const isLoggedIn = isAuthReady && !!user;
  const { value: isEnabled } = useConditionalFeature({
    feature: featureDirectMessages,
    // Evaluating enrolls, so an anonymous visitor must not be measured.
    shouldEvaluate: isLoggedIn,
  });

  return {
    isEnabled: isLoggedIn && isEnabled,
    isGatedOut: isLoggedIn && !isEnabled,
  };
};
