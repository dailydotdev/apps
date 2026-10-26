import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureLiveChat } from '../../../lib/featureManagement';
import { isDmAvailable } from '../../messages/transport';

type UseLiveChatEnabled = {
  // The surface shows live chats at all: this build has chat, the reader is
  // signed in and inside the flag.
  isEnabled: boolean;
};

// Live chats ride on the direct message connection, so they need the same
// build-level setup, and the flag is evaluated only for signed-in readers,
// like direct messages, so an anonymous visitor is never enrolled.
export const useLiveChatEnabled = (): UseLiveChatEnabled => {
  const { user, isAuthReady } = useAuthContext();
  const isLoggedIn = isAuthReady && !!user;
  const { value: isFlagOn } = useConditionalFeature({
    feature: featureLiveChat,
    shouldEvaluate: isLoggedIn && isDmAvailable,
  });

  return { isEnabled: isLoggedIn && isDmAvailable && isFlagOn };
};
