import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import { useConditionalFeature } from '../useConditionalFeature';
import { featurePostDiscoveryExperience } from '../../lib/featureManagement';

// Post types the Pinterest-style discovery layout knows how to render. Shares
// and collections are surfaced via the underlying post in PostFocusCard.
export const postDiscoveryEligibleTypes: PostType[] = [
  PostType.Article,
  PostType.VideoYouTube,
  PostType.Share,
  PostType.Collection,
];

export const isPostDiscoveryEligible = (
  post?: Pick<Post, 'type'> | null,
): boolean => !!post && postDiscoveryEligibleTypes.includes(post.type);

interface UsePostDiscoveryExperience {
  isEligible: boolean;
  showDiscovery: boolean;
}

/**
 * Single source of truth for whether a post should render with the discovery
 * layout, so the post page and the post modal stay in sync.
 */
export const usePostDiscoveryExperience = (
  post?: Post,
): UsePostDiscoveryExperience => {
  const isEligible = isPostDiscoveryEligible(post);
  const { value: isFlagOn } = useConditionalFeature({
    feature: featurePostDiscoveryExperience,
    shouldEvaluate: isEligible,
  });

  return { isEligible, showDiscovery: isEligible && isFlagOn };
};
