import type { Post } from '../../graphql/posts';
import { getPostImpressions } from '../../lib/impressions';
import { useConditionalFeature } from '../useConditionalFeature';
import { featureCardImpressions } from '../../lib/featureManagement';
import { useAuthContext } from '../../contexts/AuthContext';

interface UsePostImpressionsResult {
  /** Render the impressions stat only when true. */
  showImpressions: boolean;
  /** The real impression count (null when none is available). */
  impressions: number | null;
}

/**
 * Gates the impressions stat: it shows only when the `card_impressions` flag is
 * on and the post actually has a real impression count. There is no mock — when
 * the data is missing the stat is hidden.
 */
export const usePostImpressions = (
  post: Pick<Post, 'views' | 'analytics'>,
): UsePostImpressionsResult => {
  const { isAuthReady } = useAuthContext();
  const { value: enabled } = useConditionalFeature({
    feature: featureCardImpressions,
    shouldEvaluate: isAuthReady,
  });
  const impressions = getPostImpressions(post);

  return { showImpressions: enabled && impressions !== null, impressions };
};
