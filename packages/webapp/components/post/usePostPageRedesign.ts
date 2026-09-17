import { useRouter } from 'next/router';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import {
  isPostRedesignEligible,
  isPreviewHost,
} from '@dailydotdev/shared/src/hooks/post/usePostRedesign';
import { featurePostRedesign } from '@dailydotdev/shared/src/lib/featureManagement';

/**
 * Entry-specific flows the focus card doesn't render (author onboarding via
 * `?author`, back-to-squad via `?squad`) stay on the classic layout.
 */
export const usePostPageRedesign = (
  post?: Pick<Post, 'type'> | null,
): boolean => {
  const router = useRouter();
  const isEligible = isPostRedesignEligible(post);
  const { value: isFlagOn } = useConditionalFeature({
    feature: featurePostRedesign,
    shouldEvaluate: isEligible,
  });
  const requiresClassicLayout = !!router.query?.author || !!router.query?.squad;

  return isEligible && !requiresClassicLayout && (isFlagOn || isPreviewHost());
};
