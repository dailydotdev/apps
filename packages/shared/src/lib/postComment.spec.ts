import { Origin } from './log';
import type { OpenPostCommentEventDetail } from './postComment';
import {
  OPEN_POST_COMMENT_EVENT,
  requestOpenPostComment,
  subscribeOpenPostComment,
} from './postComment';

describe('requestOpenPostComment', () => {
  it('dispatches an open request the post page listener can pick up', () => {
    const received: OpenPostCommentEventDetail[] = [];
    const listener = (event: Event): void => {
      received.push((event as CustomEvent<OpenPostCommentEventDetail>).detail);
    };
    window.addEventListener(OPEN_POST_COMMENT_EVENT, listener);

    requestOpenPostComment({
      postId: 'p1',
      origin: Origin.PostCommentButton,
    });

    window.removeEventListener(OPEN_POST_COMMENT_EVENT, listener);
    expect(received).toEqual([
      { postId: 'p1', origin: Origin.PostCommentButton },
    ]);
  });
});

describe('subscribeOpenPostComment', () => {
  it('delivers requests until unsubscribed', () => {
    const received: OpenPostCommentEventDetail[] = [];
    const unsubscribe = subscribeOpenPostComment((detail) =>
      received.push(detail),
    );

    requestOpenPostComment({
      postId: 'p1',
      origin: Origin.PostCommentButton,
    });
    unsubscribe();
    requestOpenPostComment({
      postId: 'p2',
      origin: Origin.PostCommentButton,
    });

    expect(received).toEqual([
      { postId: 'p1', origin: Origin.PostCommentButton },
    ]);
  });
});
