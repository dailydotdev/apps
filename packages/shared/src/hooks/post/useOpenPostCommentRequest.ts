import type { RefObject } from 'react';
import { useEffect } from 'react';
import type { NewCommentRef } from '../../components/post/NewComment';
import { useActivePostContext } from '../../contexts/ActivePostContext';

// Opens this post's composer when the layout's floating bar asks for it.
export const useOpenPostCommentRequest = (
  commentRef: RefObject<NewCommentRef>,
): void => {
  const { onOpenCommentRequest } = useActivePostContext();

  useEffect(
    () =>
      onOpenCommentRequest?.((origin) =>
        commentRef.current?.onShowInput(origin),
      ),
    [onOpenCommentRequest, commentRef],
  );
};
