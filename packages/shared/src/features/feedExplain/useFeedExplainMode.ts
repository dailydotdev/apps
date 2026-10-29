import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActiveFeedNameContext } from '../../contexts/ActiveFeedNameContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { QueryStateKeys, useQueryState } from '../../hooks/utils/useQueryState';
import { SharedFeedPage } from '../../components/utilities/common';
import { feature, featureFeedExplain } from '../../lib/featureManagement';
import { withoutLayoutVariantPrefix } from '../../lib/layoutVariant';

// The For You feed versions (GrowthBook `feed_version`) ranked by the
// challenger, the only ranking that explains its cards.
export const challengerFeedVersions = [116, 118];

interface UseFeedExplainModeProps {
  /** The feed's sort is Recommended: By date is not ranked, so it explains nothing. */
  isRecommended?: boolean;
}

interface UseFeedExplainMode {
  /**
   * The feed on screen explains itself: it carries an explanation per card,
   * and Explain mode can be turned on.
   */
  isAvailable: boolean;
  /** The feed on screen has Explain mode, though only its Recommended sort can turn it on. */
  isOffered: boolean;
  isExplaining: boolean;
  /** The For You version, which the explanations and profile are for. */
  version: number;
  setIsExplaining: (value: boolean) => void;
}

/**
 * Explain mode on For You: once turned on it stays on for the session, but
 * only applies where the feed can explain itself, so the switch, the feed
 * query and the cards agree.
 */
export const useFeedExplainMode = ({
  isRecommended = true,
}: UseFeedExplainModeProps = {}): UseFeedExplainMode => {
  const { user } = useAuthContext();
  const { feedName } = useActiveFeedNameContext();
  const router = useRouter();
  const { isCustomDefaultFeed } = useCustomDefaultFeed();
  const pathname = withoutLayoutVariantPrefix(router?.pathname ?? '');
  // A custom default feed is the page on `/`, not For You.
  const isForYou =
    !!user &&
    feedName === SharedFeedPage.MyFeed &&
    !(isCustomDefaultFeed && pathname === '/');
  const { value: version } = useConditionalFeature({
    feature: feature.feedVersion,
    shouldEvaluate: isForYou,
  });
  const isChallenger = challengerFeedVersions.includes(version);
  const { value: isFlagOn } = useConditionalFeature({
    feature: featureFeedExplain,
    shouldEvaluate: isForYou && isChallenger,
  });
  const [isOn, setIsExplaining] = useQueryState({
    key: [QueryStateKeys.FeedExplain],
    defaultValue: false,
  });
  const isOffered = isForYou && isChallenger && isFlagOn;
  const isAvailable = isOffered && isRecommended;

  return {
    isAvailable,
    isOffered,
    isExplaining: isAvailable && isOn,
    version,
    setIsExplaining,
  };
};
