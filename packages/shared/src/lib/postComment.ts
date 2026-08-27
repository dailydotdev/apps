import type { Origin } from './log';

export const OPEN_POST_COMMENT_EVENT = 'open-post-comment';

export interface OpenPostCommentEventDetail {
  postId: string;
  origin: Origin;
}

// The listener count only backs the dev warning below; delivery stays on the
// window event so subscribers in sibling trees need no shared provider.
let listenerCount = 0;

export const subscribeOpenPostComment = (
  onOpenRequest: (detail: OpenPostCommentEventDetail) => void,
): (() => void) => {
  const listener = (event: Event): void =>
    onOpenRequest((event as CustomEvent<OpenPostCommentEventDetail>).detail);

  listenerCount += 1;
  globalThis.window?.addEventListener(OPEN_POST_COMMENT_EVENT, listener);

  return () => {
    listenerCount -= 1;
    globalThis.window?.removeEventListener(OPEN_POST_COMMENT_EVENT, listener);
  };
};

// The floating bar lives in the layout footer, a sibling tree to the post
// content that owns the composer — hence a window event, not a provider.
export const requestOpenPostComment = (
  detail: OpenPostCommentEventDetail,
): void => {
  if (process.env.NODE_ENV === 'development' && listenerCount === 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `open-post-comment: nothing is listening, so the composer for post "${detail.postId}" will not open. The surface rendering this post's NewComment must call useOpenPostCommentRequest.`,
    );
  }

  globalThis.window?.dispatchEvent(
    new CustomEvent<OpenPostCommentEventDetail>(OPEN_POST_COMMENT_EVENT, {
      detail,
    }),
  );
};
