import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useGrowthBookContext } from '../../../components/GrowthBookProvider';
import { featureLfg } from '../../../lib/featureManagement';
import { useMessagesEnabled } from '../../messages/hooks/useMessagesEnabled';

type UseLfgEnabled = {
  isEnabled: boolean;
  // Signed in but outside either flag: pages redirect home.
  isGatedOut: boolean;
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

  return {
    isEnabled: hasMessages && isFlagOn,
    isGatedOut:
      isMessagesGatedOut ||
      (hasMessages && !isLoading && isAttributed && !isFlagOn),
  };
};
