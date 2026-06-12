import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import { useConditionalFeature } from '../useConditionalFeature';
import { featurePostRedesign } from '../../lib/featureManagement';

// Post types the Pinterest-style redesign layout knows how to render. Each is
// rendered fully in PostFocusCard: articles/videos show the TLDR, while
// collections and squad posts render their full markdown body. Specialized
// types (poll, brief, social, digest) keep their dedicated layouts.
export const postRedesignEligibleTypes: PostType[] = [
  PostType.Article,
  PostType.VideoYouTube,
  PostType.Share,
  PostType.Collection,
  PostType.Freeform,
  PostType.Welcome,
];

export const isPostRedesignEligible = (
  post?: Pick<Post, 'type'> | null,
): boolean => !!post && postRedesignEligibleTypes.includes(post.type);

interface UsePostRedesign {
  isEligible: boolean;
  showRedesign: boolean;
}

/**
 * Single source of truth for whether a post should render with the redesign
 * layout, so the post page and the post modal stay in sync.
 */
export const usePostRedesign = (post?: Post): UsePostRedesign => {
  const isEligible = isPostRedesignEligible(post);
  const { value: isFlagOn } = useConditionalFeature({
    feature: featurePostRedesign,
    shouldEvaluate: isEligible,
  });

  return { isEligible, showRedesign: isEligible && isFlagOn };
};
