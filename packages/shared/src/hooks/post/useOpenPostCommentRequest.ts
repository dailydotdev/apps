import type { RefObject } from 'react';
import { useEffect } from 'react';
import type { NewCommentRef } from '../../components/post/NewComment';
import { subscribeOpenPostComment } from '../../lib/postComment';

// Opens this post's composer when the layout's floating bar asks for it (see
// requestOpenPostComment). Every surface that owns a NewComment for a full
// post page must register, or the bar's comment tap silently does nothing.
export const useOpenPostCommentRequest = (
  postId: string,
  commentRef: RefObject<NewCommentRef>,
): void => {
  useEffect(
    () =>
      subscribeOpenPostComment((detail) => {
        if (detail.postId !== postId) {
          return;
        }

        commentRef.current?.onShowInput(detail.origin);
      }),
    [postId, commentRef],
  );
};
