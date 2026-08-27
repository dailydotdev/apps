import React from 'react';
import { render, screen } from '@testing-library/react';
import { PostComments } from './PostComments';
import { usePostComments } from '../../hooks/comments/usePostComments';
import { Origin } from '../../lib/log';
import type { Post } from '../../graphql/posts';

jest.mock('../../hooks/comments/usePostComments', () => ({
  usePostComments: jest.fn(),
}));

jest.mock('../../hooks/comments/useDeleteComment', () => ({
  useDeleteComment: () => ({ deleteComment: jest.fn() }),
}));

jest.mock('./useCommentContentPreferenceMutationSubscription', () => ({
  useCommentContentPreferenceMutationSubscription: jest.fn(),
}));

jest.mock('../comments/MainComment', () => ({
  __esModule: true,
  default: ({ comment }: { comment: { id: string } }) => (
    <div data-testid="comment">{comment.id}</div>
  ),
}));

const mockUsePostComments = jest.mocked(usePostComments);

const post = { id: 'p1', numComments: 0 } as Post;

const setComments = (count: number): void => {
  const edges = Array.from({ length: count }, (_, index) => ({
    node: { id: `c${index}` },
  }));
  mockUsePostComments.mockReturnValue({
    queryKey: ['post-comments', post.id],
    comments: { postComments: { edges } },
    isLoading: false,
    commentsCount: count,
  } as unknown as ReturnType<typeof usePostComments>);
};

const renderThread = (count: number) => {
  setComments(count);
  return render(
    <PostComments
      post={post}
      origin={Origin.ArticlePage}
      interleaveEvery={5}
      renderInterleaved={() => <div data-testid="interleaved" />}
    />,
  );
};

describe('PostComments interleaving', () => {
  it('leaves a short thread untouched', () => {
    renderThread(4);

    expect(screen.getAllByTestId('comment')).toHaveLength(4);
    expect(screen.queryByTestId('interleaved')).not.toBeInTheDocument();
  });

  it('breaks a long thread up on the interval', () => {
    renderThread(11);

    expect(screen.getAllByTestId('interleaved')).toHaveLength(2);
  });

  it('never renders after the last comment, where the block below already sits', () => {
    renderThread(10);

    expect(screen.getAllByTestId('interleaved')).toHaveLength(1);
  });

  it('renders no interleaved node without the props', () => {
    setComments(11);
    render(<PostComments post={post} origin={Origin.ArticlePage} />);

    expect(screen.queryByTestId('interleaved')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('comment')).toHaveLength(11);
  });
});
