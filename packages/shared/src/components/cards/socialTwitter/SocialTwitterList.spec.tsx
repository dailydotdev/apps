import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { mocked } from 'ts-jest/utils';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { sharePost } from '../../../../__tests__/fixture/post';
import type { PostCardProps } from '../common/common';
import { SocialTwitterList } from './SocialTwitterList';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../common/PostTags', () => ({
  __esModule: true,
  default: ({ post }: { post: { tags?: string[] } }) => (
    <div data-testid="post-tags">{post.tags?.join(',')}</div>
  ),
}));

const basePost: Post = {
  ...sharePost,
  type: PostType.SocialTwitter,
  subType: 'tweet',
  title: '@dailydotdev: Root tweet',
  commentsPermalink: 'https://app.daily.dev/posts/12345',
  image: 'https://pbs.twimg.com/media/tweet.jpg',
  sharedPost: undefined,
};

const defaultProps: PostCardProps = {
  post: basePost,
  onPostClick: jest.fn(),
  onPostAuxClick: jest.fn(),
  onUpvoteClick: jest.fn(),
  onDownvoteClick: jest.fn(),
  onCommentClick: jest.fn(),
  onCopyLinkClick: jest.fn(),
  onBookmarkClick: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/',
      } as unknown as NextRouter),
  );
});

const renderComponent = (props: Partial<PostCardProps> = {}) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <SocialTwitterList {...defaultProps} {...props} />
    </TestBootProvider>,
  );

it('should show referenced tweet block for shared social tweets', async () => {
  renderComponent({
    post: {
      ...basePost,
      subType: 'quote',
      sharedPost: {
        ...sharePost.sharedPost,
        type: PostType.SocialTwitter,
        title: 'Referenced tweet body',
        source: {
          ...sharePost.sharedPost.source,
          name: 'Referenced post',
          handle: 'devrelweekly',
        },
      },
    },
  });

  expect(
    await screen.findByText(/Referenced post @devrelweekly/i),
  ).toBeInTheDocument();
  expect(
    await screen.findByAltText("devrelweekly's profile"),
  ).toBeInTheDocument();
  expect(await screen.findByText('Referenced tweet body')).toBeInTheDocument();
  expect(screen.queryByAltText('Post cover image')).not.toBeInTheDocument();
});

it('should render embedded tweet preview for non-shared social tweets', async () => {
  renderComponent();

  expect(
    await screen.findByRole('link', { name: 'Read on' }),
  ).toBeInTheDocument();
  expect(
    await screen.findByText('@dailydotdev: Root tweet'),
  ).toBeInTheDocument();
  expect(screen.queryByAltText('Post cover image')).not.toBeInTheDocument();
});

it('should hide headline and tags for repost cards without repost text', async () => {
  renderComponent({
    post: {
      ...basePost,
      subType: 'repost',
      title:
        '@bcherny: RT @ycombinator: Today, startups are not winning by hiring faster',
      content: null,
      contentHtml: null,
      tags: ['tagaa', 'tagbb'],
      sharedPost: {
        ...sharePost.sharedPost,
        type: PostType.SocialTwitter,
        title: 'Referenced tweet body',
        source: {
          ...sharePost.sharedPost.source,
          name: 'Y Combinator',
          handle: 'ycombinator',
        },
      },
    },
  });

  expect(
    screen.queryByText(
      '@bcherny: RT @ycombinator: Today, startups are not winning by hiring faster',
    ),
  ).not.toBeInTheDocument();
  expect(screen.queryByTestId('post-tags')).not.toBeInTheDocument();
  expect(await screen.findByText(/From x\.com/i)).toBeInTheDocument();
  expect(
    await screen.findByText(/Y Combinator @ycombinator/i),
  ).toBeInTheDocument();
  expect(
    screen.queryByTestId('social-twitter-list-spacer'),
  ).not.toBeInTheDocument();
  expect(
    screen.getByTestId('social-twitter-list-embedded-preview'),
  ).not.toHaveClass('flex-1');
});
