import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import { useConditionalFeature } from '../useConditionalFeature';
import { featurePostPageHybrid } from '../../lib/featureManagement';

// Briefs and digests keep their dedicated layouts in both arms.
const postPageHybridTypes: PostType[] = [
  PostType.Article,
  PostType.VideoYouTube,
  PostType.Share,
  PostType.Freeform,
  PostType.Collection,
  PostType.Poll,
  PostType.SocialTwitter,
];

export const isPostPageHybridEligible = (
  post?: Pick<Post, 'type'> | null,
): boolean => !!post && postPageHybridTypes.includes(post.type);

interface UsePostPageHybridOptions {
  /**
   * False keeps the flag unevaluated, so a session that can only ever see the
   * classic layout is never enrolled in the experiment.
   */
  canRender?: boolean;
}

interface UsePostPageHybrid {
  showHybrid: boolean;
  isEligible: boolean;
  /** The flag has been read for this post, so `showHybrid` is final. */
  isEvaluated: boolean;
}

/**
 * Whether a post renders with the hybrid layout, shared by the post page and
 * the post modal so both arms stay in sync.
 */
export const usePostPageHybrid = (
  post?: Pick<Post, 'type'> | null,
  { canRender = true }: UsePostPageHybridOptions = {},
): UsePostPageHybrid => {
  const isEligible = isPostPageHybridEligible(post) && canRender;
  const { value: isFlagOn, isLoading } = useConditionalFeature({
    feature: featurePostPageHybrid,
    shouldEvaluate: isEligible,
  });

  return {
    showHybrid: isEligible && isFlagOn,
    isEligible,
    isEvaluated: isEligible && !isLoading,
  };
};
