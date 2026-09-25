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

interface UsePostRedesignOptions {
  /**
   * Whether the surface could render the redesign at all. False keeps the
   * flag unevaluated, so a session that can only ever see the classic layout
   * is never enrolled in the experiment.
   */
  canRender?: boolean;
}

/**
 * Single source of truth for whether a post should render with the redesign
 * layout, so the post page, the post modal and the /articles template stay
 * in sync.
 */
export const usePostRedesign = (
  post?: Post,
  { canRender = true }: UsePostRedesignOptions = {},
): UsePostRedesign => {
  const isEligible = isPostRedesignEligible(post) && canRender;
  const { value: isFlagOn } = useConditionalFeature({
    feature: featurePostRedesign,
    shouldEvaluate: isEligible,
  });

  return { isEligible, showRedesign: isEligible && isFlagOn };
};
