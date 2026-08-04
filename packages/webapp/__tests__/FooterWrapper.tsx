import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import type { OpenPostCommentEventDetail } from '@dailydotdev/shared/src/lib/postComment';
import { OPEN_POST_COMMENT_EVENT } from '@dailydotdev/shared/src/lib/postComment';
import FooterWrapper from '../components/footer/FooterWrapper';

jest.mock('@dailydotdev/shared/src/components/ScrollToTopButton', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock(
  '@dailydotdev/shared/src/components/post/MobilePostFloatingBar',
  () => ({
    MobilePostFloatingBar: ({
      onCommentClick,
    }: {
      onCommentClick: (origin: string) => void;
    }) => (
      <button type="button" onClick={() => onCommentClick('comment button')}>
        Comment
      </button>
    ),
  }),
);

const post = { id: 'p1', type: PostType.Article } as Post;

describe('FooterWrapper', () => {
  it('asks the in-page composer to open instead of mounting its own', async () => {
    const received: OpenPostCommentEventDetail[] = [];
    const listener = (event: Event): void => {
      received.push((event as CustomEvent<OpenPostCommentEventDetail>).detail);
    };
    window.addEventListener(OPEN_POST_COMMENT_EVENT, listener);

    render(<FooterWrapper post={post} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Comment' }));

    window.removeEventListener(OPEN_POST_COMMENT_EVENT, listener);
    expect(received).toEqual([
      { postId: 'p1', origin: Origin.PostCommentButton },
    ]);
  });

  it('renders no floating bar without a post', () => {
    render(<FooterWrapper />);

    expect(
      screen.queryByRole('button', { name: 'Comment' }),
    ).not.toBeInTheDocument();
  });
});
