import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActiveFeedNameContext } from '../../contexts/ActiveFeedNameContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { QueryStateKeys, useQueryState } from '../../hooks/utils/useQueryState';
import { SharedFeedPage } from '../../components/utilities/common';
import { feature } from '../../lib/featureManagement';
import { withoutLayoutVariantPrefix } from '../../lib/layoutVariant';

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
}

/**
 * Explain mode on For You: once turned on it stays on for the session, but
 * only applies where the feed can explain itself, so the switch, the feed
 * query and the cards agree. `useSetFeedExplain` turns it on and off.
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
  const [isOn] = useQueryState({
    key: [QueryStateKeys.FeedExplain],
    defaultValue: false,
  });
  const isOffered = isForYou;
  const isAvailable = isOffered && isRecommended;

  return {
    isAvailable,
    isOffered,
    isExplaining: isAvailable && isOn,
    version,
  };
};

/**
 * The reader has For You's Explain and controls. Unlike Explain mode it
 * doesn't depend on the feed on screen, for the settings pages.
 */
export const useForYouControls = (): Pick<
  UseFeedExplainMode,
  'isAvailable' | 'version'
> => {
  const { user } = useAuthContext();
  const { value: version } = useConditionalFeature({
    feature: feature.feedVersion,
    shouldEvaluate: !!user,
  });

  return {
    isAvailable: !!user,
    version,
  };
};
