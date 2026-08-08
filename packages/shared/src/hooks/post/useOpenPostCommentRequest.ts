import type { RefObject } from 'react';
import { useEffect } from 'react';
import type { NewCommentRef } from '../../components/post/NewComment';
import type { OpenPostCommentEventDetail } from '../../lib/postComment';
import { OPEN_POST_COMMENT_EVENT } from '../../lib/postComment';

// Opens this post's composer when the layout's floating bar asks for it (see
// requestOpenPostComment). Every surface that owns a NewComment for a full
// post page must register, or the bar's comment tap silently does nothing.
export const useOpenPostCommentRequest = (
  postId: string,
  commentRef: RefObject<NewCommentRef>,
): void => {
  useEffect(() => {
    const onOpenRequest = (
      event: CustomEvent<OpenPostCommentEventDetail>,
    ): void => {
      if (event.detail.postId !== postId) {
        return;
      }

      commentRef.current?.onShowInput(event.detail.origin);
    };

    globalThis.window?.addEventListener(
      OPEN_POST_COMMENT_EVENT,
      onOpenRequest as EventListener,
    );

    return () => {
      globalThis.window?.removeEventListener(
        OPEN_POST_COMMENT_EVENT,
        onOpenRequest as EventListener,
      );
    };
  }, [postId, commentRef]);
};
