import type { Post } from '../../graphql/posts';
import { useConditionalFeature } from '../useConditionalFeature';
import { featureCardImpressions } from '../../lib/featureManagement';
import { useAuthContext } from '../../contexts/AuthContext';

interface UsePostImpressionsResult {
  /** Whether the `card_impressions` flag is on (independent of this post). */
  enabled: boolean;
  /** Render the impressions stat only when true. */
  showImpressions: boolean;
  /** The real impression count (0 when none is available). */
  impressions: number;
}

/**
 * Gates the impressions stat: it shows only when the `card_impressions` flag is
 * on and the post has a real, non-zero impression count. `analytics.impressions`
 * is exposed publicly by the API, so the stat is hidden at zero the same way the
 * upvote/comment counters are.
 */
export const usePostImpressions = (
  post: Pick<Post, 'analytics'>,
): UsePostImpressionsResult => {
  const { isAuthReady } = useAuthContext();
  const { value: enabled } = useConditionalFeature({
    feature: featureCardImpressions,
    shouldEvaluate: isAuthReady,
  });
  const impressions = post.analytics?.impressions ?? 0;

  return {
    enabled,
    showImpressions: enabled && impressions > 0,
    impressions,
  };
};
