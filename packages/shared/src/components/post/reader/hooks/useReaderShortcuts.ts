import { useEffect } from 'react';
import { useBookmarkPost } from '../../../../hooks/useBookmarkPost';
import { useVotePost } from '../../../../hooks/vote/useVotePost';
import type { Post } from '../../../../graphql/posts';
import { Origin } from '../../../../lib/log';

type UseReaderShortcutsParams = {
  isActive: boolean;
  post: Post;
  onClose: (event?: KeyboardEvent) => void;
  onPreviousPost?: () => void;
  onNextPost?: () => void;
  toggleRail: () => void;
  focusCommentComposer: () => void;
  toggleShortcutHelp: () => void;
};

export function useReaderShortcuts({
  isActive,
  post,
  onClose,
  onPreviousPost,
  onNextPost,
  toggleRail,
  focusCommentComposer,
  toggleShortcutHelp,
}: UseReaderShortcutsParams): void {
  const { toggleBookmark } = useBookmarkPost();
  const { toggleUpvote } = useVotePost();

  useEffect(() => {
    if (!isActive) {
      return () => {};
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        if (event.key === 'Escape') {
          target.blur?.();
        }
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === '[' && onPreviousPost) {
        event.preventDefault();
        onPreviousPost();
        return;
      }

      if (event.key === ']' && onNextPost) {
        event.preventDefault();
        onNextPost();
        return;
      }

      if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        toggleRail();
        return;
      }

      if (event.key === 'c' || event.key === 'C') {
        event.preventDefault();
        focusCommentComposer();
        return;
      }

      if (event.key === 'b' || event.key === 'B') {
        event.preventDefault();
        toggleBookmark({ post, origin: Origin.ReaderModal }).catch(() => {});
        return;
      }

      if (event.key === 'u' || event.key === 'U') {
        event.preventDefault();
        toggleUpvote({ payload: post, origin: Origin.ReaderModal }).catch(
          () => {},
        );
        return;
      }

      if (event.key === '?' || (event.shiftKey && event.key === '/')) {
        event.preventDefault();
        toggleShortcutHelp();
      }
    };

    globalThis.window?.addEventListener('keydown', onKeyDown);
    return () => {
      globalThis.window?.removeEventListener('keydown', onKeyDown);
    };
  }, [
    isActive,
    post,
    onClose,
    onPreviousPost,
    onNextPost,
    toggleRail,
    focusCommentComposer,
    toggleShortcutHelp,
    toggleBookmark,
    toggleUpvote,
  ]);
}
