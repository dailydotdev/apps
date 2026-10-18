import { useEffect } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureDirectMessages } from '../../../lib/featureManagement';
import { closeDmTransports, isDmAvailable } from '../transport';

type UseMessagesEnabled = {
  isEnabled: boolean;
  // Signed in but outside the flag: pages redirect, an anonymous visitor gets
  // the sign-in wall instead since they were never evaluated.
  isGatedOut: boolean;
};

export const useMessagesEnabled = (): UseMessagesEnabled => {
  const { user, isAuthReady } = useAuthContext();
  const isLoggedIn = isAuthReady && !!user;
  const { value: isFlagOn, isLoading } = useConditionalFeature({
    feature: featureDirectMessages,
    // Evaluating enrolls, so neither an anonymous visitor nor a surface that
    // has no chat configured may be measured.
    shouldEvaluate: isLoggedIn && isDmAvailable,
  });
  const isEnabled = isLoggedIn && isDmAvailable && isFlagOn;

  // Every surface that can open a chat session renders this hook, so logging
  // out here ends the session instead of leaving the socket up.
  useEffect(() => {
    if (isAuthReady && !user) {
      closeDmTransports();
    }
  }, [isAuthReady, user]);

  return {
    isEnabled,
    // While GrowthBook is still answering the default is control, so
    // redirecting then would bounce users who are in the rollout.
    // A build without chat never evaluates, so it never stops "loading".
    isGatedOut: isLoggedIn && (!isDmAvailable || (!isLoading && !isFlagOn)),
  };
};
