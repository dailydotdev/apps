import { useEffect, useState } from 'react';
import type { PostHighlight } from '../../../graphql/highlights';
import { usePostById } from '../../../hooks/usePostById';

interface UseHighlightModalPostsProps {
  activeHighlight?: PostHighlight;
  isOpen: boolean;
  nextHighlight?: PostHighlight;
  previousHighlight?: PostHighlight;
  selectedHighlightId: string | null;
  shouldUseMobileLayout: boolean;
}

export const useHighlightModalPosts = ({
  activeHighlight,
  isOpen,
  nextHighlight,
  previousHighlight,
  selectedHighlightId,
  shouldUseMobileLayout,
}: UseHighlightModalPostsProps) => {
  const [lastLoadedPost, setLastLoadedPost] = useState<
    ReturnType<typeof usePostById>['post'] | null
  >(null);
  const activePostId = isOpen ? activeHighlight?.post.id ?? '' : '';
  const { post } = usePostById({
    id: activePostId,
    options: { enabled: !!activePostId },
  });
  const { post: previousPost } = usePostById({
    id: isOpen && shouldUseMobileLayout ? previousHighlight?.post.id ?? '' : '',
    options: {
      enabled: !!previousHighlight?.post.id && isOpen && shouldUseMobileLayout,
    },
  });
  const { post: nextPost } = usePostById({
    id: isOpen && shouldUseMobileLayout ? nextHighlight?.post.id ?? '' : '',
    options: {
      enabled: !!nextHighlight?.post.id && isOpen && shouldUseMobileLayout,
    },
  });

  useEffect(() => {
    if (!post?.id) {
      return;
    }

    setLastLoadedPost(post);
  }, [activeHighlight?.id, activePostId, post, selectedHighlightId]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    setLastLoadedPost(null);
  }, [isOpen]);

  const resolvedPost = post ?? lastLoadedPost;

  return {
    isInitialLoading: !resolvedPost,
    isLoadingNextPost: !!resolvedPost && post?.id !== activeHighlight?.post.id,
    nextPost,
    post,
    previousPost,
    resolvedPost,
  };
};
