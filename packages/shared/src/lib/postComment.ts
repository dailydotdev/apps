import type { Origin } from './log';

export const OPEN_POST_COMMENT_EVENT = 'open-post-comment';

export interface OpenPostCommentEventDetail {
  postId: string;
  origin: Origin;
}

// The mobile floating bar lives in the layout's footer, a sibling tree to the
// post content that owns the composer. A window event is the cheapest way for
// the bar to reach the in-page composer without threading a provider through
// every layout that renders the footer.
export const requestOpenPostComment = (
  detail: OpenPostCommentEventDetail,
): void => {
  globalThis.window?.dispatchEvent(
    new CustomEvent<OpenPostCommentEventDetail>(OPEN_POST_COMMENT_EVENT, {
      detail,
    }),
  );
};
