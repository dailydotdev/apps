import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import type { Post } from '../../graphql/posts';
import { useInteractiveFeedContext } from '../../contexts/InteractiveFeedContext';
import { useFeedPreviewMode } from '../useFeedPreviewMode';

type UseInteractiveFeed = {
  showInteractiveFeedOverlay: boolean;
  onClose: () => void;
  showCover: boolean;
  postIrrelevant: boolean;
  postRelevant: boolean;
  interactiveFeedExp: boolean;
  showRelevancyTag: boolean;
};

const useInteractiveFeed = ({ post }: { post?: Post }): UseInteractiveFeed => {
  const { interactiveFeedExp, hiddenPosts, approvedPosts } =
    useInteractiveFeedContext();
  const isFeedPreview = useFeedPreviewMode();
  const router = useRouter();
  const [hasClosed, setHasClosed] = useState(false);
  const isOnboarding = router.pathname.includes('/onboarding');
  const isInteractive = isOnboarding && isFeedPreview && interactiveFeedExp;

  const postIrrelevant = useMemo(() => {
    return hiddenPosts.includes(post?.id);
  }, [hiddenPosts, post?.id]);

  const postRelevant = useMemo(() => {
    return isInteractive && approvedPosts.includes(post?.id);
  }, [isInteractive, approvedPosts, post?.id]);

  const showInteractiveFeedOverlay = useMemo(() => {
    return isInteractive && postIrrelevant && !hasClosed;
  }, [isInteractive, postIrrelevant, hasClosed]);

  return {
    showInteractiveFeedOverlay,
    onClose: () => setHasClosed(true),
    postIrrelevant,
    postRelevant,
    showCover: isInteractive && !postRelevant && !postIrrelevant,
    interactiveFeedExp,
    showRelevancyTag: isInteractive && (postRelevant || postIrrelevant),
  };
};

export default useInteractiveFeed;
