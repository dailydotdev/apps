import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureLfg, featureLfgLaunched } from '../../../lib/featureManagement';
import { useMessagesEnabled } from '../../messages/hooks/useMessagesEnabled';

type UseLfgEnabled = {
  isEnabled: boolean;
  // Signed in but outside either flag: pages redirect home.
  isGatedOut: boolean;
  // Off is "Opening soon": posts are collected, nothing is listed and nobody
  // can reach out.
  isLaunched: boolean;
  isLaunchKnown: boolean;
};

// An accepted reach-out becomes a chat, so Looking for group only exists for
// people who have direct messages.
export const useLfgEnabled = (): UseLfgEnabled => {
  const { isEnabled: hasMessages, isGatedOut: isMessagesGatedOut } =
    useMessagesEnabled();
  const { value: isFlagOn, isLoading } = useConditionalFeature({
    feature: featureLfg,
    shouldEvaluate: hasMessages,
  });
  const isEnabled = hasMessages && isFlagOn;
  const { value: isLaunched, isLoading: isLaunchLoading } =
    useConditionalFeature({
      feature: featureLfgLaunched,
      shouldEvaluate: isEnabled,
    });

  return {
    isEnabled,
    isGatedOut: isMessagesGatedOut || (hasMessages && !isLoading && !isFlagOn),
    isLaunched: isEnabled && isLaunched,
    isLaunchKnown: isEnabled && !isLaunchLoading,
  };
};
