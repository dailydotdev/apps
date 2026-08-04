import type { Origin } from './log';

export const OPEN_POST_COMMENT_EVENT = 'open-post-comment';

export interface OpenPostCommentEventDetail {
  postId: string;
  origin: Origin;
}

// The floating bar lives in the layout footer, a sibling tree to the post
// content that owns the composer — hence a window event, not a provider.
export const requestOpenPostComment = (
  detail: OpenPostCommentEventDetail,
): void => {
  globalThis.window?.dispatchEvent(
    new CustomEvent<OpenPostCommentEventDetail>(OPEN_POST_COMMENT_EVENT, {
      detail,
    }),
  );
};
