import { useCallback } from 'react';
import type { Post } from '../../graphql/posts';
import { UserVote } from '../../graphql/posts';
import { usePostActions } from '../post/usePostActions';
import { useBlockPostPanel } from '../post/useBlockPostPanel';

export interface CardActionCallbacks {
  onUpvoteClick?: (post: Post) => unknown;
  onDownvoteClick?: (post: Post) => unknown;
  onBookmarkClick?: (post: Post) => unknown;
  onCopyLinkClick?: (event: React.MouseEvent, post: Post) => unknown;
}

export interface UseCardActionsProps extends CardActionCallbacks {
  post: Post;
  /** For list variant, close tags panel when switching from downvote to upvote */
  closeTagsPanelOnUpvote?: boolean;
}

export interface UseCardActionsReturn {
  isUpvoteActive: boolean;
  isDownvoteActive: boolean;
  showTagsPanel: boolean;
  onToggleUpvote: () => void;
  onToggleDownvote: () => Promise<void>;
  onToggleBookmark: () => void;
  onCopyLink: (e: React.MouseEvent) => void;
}

/**
 * Hook to handle card action button interactions.
 * Extracts common toggle logic for upvote, downvote, bookmark, and copy actions.
 */
export const useCardActions = ({
  post,
  onUpvoteClick,
  onDownvoteClick,
  onBookmarkClick,
  onCopyLinkClick,
  closeTagsPanelOnUpvote = false,
}: UseCardActionsProps): UseCardActionsReturn => {
  const { onInteract, interaction, previousInteraction } = usePostActions({
    post,
  });
  const { data, onShowPanel, onClose } = useBlockPostPanel(post);
  const { showTagsPanel } = data;

  const isUpvoteActive = post.userState?.vote === UserVote.Up;
  const isDownvoteActive = post.userState?.vote === UserVote.Down;

  const onToggleUpvote = useCallback(() => {
    // For list variant, close tags panel if switching from downvote
    if (closeTagsPanelOnUpvote && isDownvoteActive && showTagsPanel) {
      onClose(true);
    }

    if (!isUpvoteActive) {
      onInteract('upvote');
    }
    if (interaction === 'upvote') {
      onInteract('none');
    }
    onUpvoteClick?.(post);
  }, [
    closeTagsPanelOnUpvote,
    isDownvoteActive,
    showTagsPanel,
    onClose,
    isUpvoteActive,
    interaction,
    onInteract,
    onUpvoteClick,
    post,
  ]);

  const onToggleDownvote = useCallback(async () => {
    if (!isDownvoteActive) {
      onShowPanel();
    } else {
      onInteract('none');
      onClose(true);
    }

    await onDownvoteClick?.(post);
  }, [isDownvoteActive, onShowPanel, onInteract, onClose, onDownvoteClick, post]);

  const onToggleBookmark = useCallback(() => {
    if (!post.bookmarked) {
      onInteract('bookmark');
    }
    if (interaction === 'bookmark') {
      onInteract(previousInteraction);
    }
    onBookmarkClick?.(post);
  }, [post, interaction, previousInteraction, onInteract, onBookmarkClick]);

  const onCopyLink = useCallback(
    (e: React.MouseEvent) => {
      onInteract('copy');
      onCopyLinkClick?.(e, post);
    },
    [onInteract, onCopyLinkClick, post],
  );

  return {
    isUpvoteActive,
    isDownvoteActive,
    showTagsPanel: showTagsPanel === true,
    onToggleUpvote,
    onToggleDownvote,
    onToggleBookmark,
    onCopyLink,
  };
};
