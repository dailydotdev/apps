import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';
import {
  featurePostCommentsTeaserDesktop,
  featurePostCommentsTeaserMobile,
} from '../../lib/featureManagement';
import { usePhoneBrowser } from '../getApp/hooks/usePhoneBrowser';

/** Which of the two teaser tests a reader belongs to. */
export type CommentsTeaserPlatform = 'mobile' | 'desktop';

interface UseCommentsTeaser {
  isCommentsTeaser: boolean;
  isPending: boolean;
  platform?: CommentsTeaserPlatform;
}

/**
 * Whether this reader gets the comment teaser. Logged-out readers only, and
 * only the flag for their device is evaluated, so nobody is enrolled in
 * both tests: phone browsers read post_comments_teaser_mobile, tablet and
 * laptop read post_comments_teaser_desktop. Phone-sized native app and PWA
 * shells read neither (the app footer and app card are browser-only).
 */
export const useCommentsTeaser = (enabled = true): UseCommentsTeaser => {
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const isTabletUp = useViewSize(ViewSize.Tablet);
  const isPhoneBrowser = usePhoneBrowser();
  let platform: CommentsTeaserPlatform | undefined;
  if (isTabletUp) {
    platform = 'desktop';
  } else if (isPhoneBrowser) {
    platform = 'mobile';
  }
  const canEvaluate = enabled && isAuthReady && !isLoggedIn && !!platform;

  const mobile = useConditionalFeature({
    feature: featurePostCommentsTeaserMobile,
    shouldEvaluate: canEvaluate && platform === 'mobile',
  });
  const desktop = useConditionalFeature({
    feature: featurePostCommentsTeaserDesktop,
    shouldEvaluate: canEvaluate && platform === 'desktop',
  });
  const { value, isLoading } = platform === 'desktop' ? desktop : mobile;

  return {
    isCommentsTeaser: canEvaluate && !isLoading && !!value,
    isPending: canEvaluate && isLoading,
    platform,
  };
};
