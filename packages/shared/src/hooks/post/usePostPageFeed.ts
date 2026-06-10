import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import { useConditionalFeature } from '../useConditionalFeature';
import { featurePostPageFeed } from '../../lib/featureManagement';

// Standard reading post types that render the "For you" feed below the
// comments. Specialized types (poll, brief, social, digest) keep their
// dedicated layouts and are intentionally excluded.
const eligiblePostTypes = new Set<PostType>([
  PostType.Article,
  PostType.VideoYouTube,
  PostType.Share,
  PostType.Freeform,
  PostType.Welcome,
  PostType.Collection,
]);

interface UsePostPageFeed {
  isEligible: boolean;
}

export const usePostPageFeed = (post?: Post): UsePostPageFeed => {
  const isTypeEligible = !!post && eligiblePostTypes.has(post.type);
  const { value: isFlagOn } = useConditionalFeature({
    feature: featurePostPageFeed,
    shouldEvaluate: isTypeEligible,
  });

  return { isEligible: isTypeEligible && isFlagOn };
};
