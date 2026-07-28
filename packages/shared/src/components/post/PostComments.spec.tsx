import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { PostComments } from './PostComments';
import type { Post } from '../../graphql/posts';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { Origin } from '../../lib/log';

const mockRequestMethod = jest.fn();

jest.mock('../comments/MainComment', () => ({
  __esModule: true,
  default: ({ comment }: { comment: { id: string } }) => (
    <article data-testid="main-comment">{comment.id}</article>
  ),
}));

jest.mock('../../hooks/useRequestProtocol', () => ({
  useRequestProtocol: () => ({ requestMethod: mockRequestMethod() }),
}));

const buildComments = (count: number) => ({
  postComments: {
    pageInfo: { hasNextPage: false, endCursor: null },
    edges: Array.from({ length: count }, (_, index) => ({
      node: { id: `c${index}` },
    })),
  },
});

const createPost = (numComments: number): Post =>
  ({
    id: 'abc',
    title: 'Why your CI is slow',
    permalink: 'https://daily.dev/posts/abc',
    commentsPermalink: 'https://app.daily.dev/posts/abc',
    numComments,
  } as Post);

const enabledFlags = {
  sharing_visibility: { defaultValue: true },
  share_end_of_conversation: { defaultValue: true },
};

beforeEach(() => {
  jest.clearAllMocks();
});

const renderComponent = (
  numComments: number,
  features: Record<string, { defaultValue: boolean }> = {},
): RenderResult => {
  mockRequestMethod.mockReturnValue(() =>
    Promise.resolve(buildComments(numComments)),
  );

  return render(
    <TestBootProvider
      client={new QueryClient()}
      gb={new GrowthBook({ features })}
    >
      <PostComments
        post={createPost(numComments)}
        origin={Origin.ArticlePage}
      />
    </TestBootProvider>,
  );
};

describe('PostComments end-of-conversation share band', () => {
  it('appends the band after the last comment on an active discussion', async () => {
    renderComponent(6, enabledFlags);

    const comments = await screen.findAllByTestId('main-comment');
    await waitFor(() => expect(comments).toHaveLength(6));

    expect(screen.getByText('Enjoyed this discussion?')).toBeInTheDocument();
    expect(comments[5].nextElementSibling).toBe(
      screen.getByRole('complementary'),
    );
  });

  it('leaves the comment list untouched when the flags are off', async () => {
    renderComponent(6);

    const comments = await screen.findAllByTestId('main-comment');
    await waitFor(() => expect(comments).toHaveLength(6));

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    expect(comments[5].nextElementSibling).toBeNull();
  });

  it('keeps the band hidden on a quiet discussion even with the flags on', async () => {
    renderComponent(2, enabledFlags);

    const comments = await screen.findAllByTestId('main-comment');
    await waitFor(() => expect(comments).toHaveLength(2));

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });
});
