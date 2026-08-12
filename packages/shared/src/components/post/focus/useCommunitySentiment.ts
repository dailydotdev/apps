import type { Post } from '../../../graphql/posts';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureCommunitySentiment } from '../../../lib/featureManagement';
import { isDevelopment } from '../../../lib/constants';
import type { CommunitySentimentData } from './CommunitySentiment';
import { mapCommunitySentimentPost } from './CommunitySentiment';

interface UseCommunitySentimentOptions {
  /** True on the full post page; false in a feed preview modal — the take
   * never renders there regardless of the take/flag state. */
  isFullPage: boolean;
}

interface UseCommunitySentiment {
  data?: CommunitySentimentData;
  /** Whether the surface should actually render. */
  show: boolean;
}

/**
 * Shared gating for the Community Sentiment surface: maps the wire shape,
 * conditionally enrolls in the `community_sentiment` experiment (only for
 * posts that actually have a take, so take-less posts don't dilute the
 * treatment/control split — the backend keeps generating takes regardless of
 * this flag), and resolves whether the surface should render.
 */
export const useCommunitySentiment = (
  post: Pick<Post, 'communitySentiment'> | undefined,
  { isFullPage }: UseCommunitySentimentOptions,
): UseCommunitySentiment => {
  const data = post?.communitySentiment
    ? mapCommunitySentimentPost(post.communitySentiment)
    : undefined;
  const { value: isEnabled } = useConditionalFeature({
    feature: featureCommunitySentiment,
    shouldEvaluate: !!data,
  });
  // `isDevelopment` lets the surface be previewed locally without flipping
  // the committed (always-`false`) flag default.
  const show = isFullPage && !!data && (isEnabled || isDevelopment);

  return { data, show };
};
