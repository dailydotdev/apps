import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useGrowthBookContext } from '../../../components/GrowthBookProvider';
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
  const { user } = useAuthContext();
  const { growthbook } = useGrowthBookContext();
  const { isEnabled: hasMessages, isGatedOut: isMessagesGatedOut } =
    useMessagesEnabled();
  // Signing in, or a boot that swaps the user, renders once before GrowthBook
  // gets the new id. Gating then would bounce someone inside the flag.
  const isAttributed =
    !!user && growthbook?.getAttributes?.().userId === user.id;
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
    isGatedOut:
      isMessagesGatedOut ||
      (hasMessages && !isLoading && isAttributed && !isFlagOn),
    isLaunched: isEnabled && isLaunched,
    isLaunchKnown: isEnabled && !isLaunchLoading,
  };
};
