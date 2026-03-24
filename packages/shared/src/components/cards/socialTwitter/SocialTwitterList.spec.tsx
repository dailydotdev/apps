import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { sharePost } from '../../../../__tests__/fixture/post';
import type { PostCardProps } from '../common/common';
import { SocialTwitterList } from './SocialTwitterList';
import { EmbeddedTweetPreview } from './EmbeddedTweetPreview';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../common/PostTags', () => ({
  __esModule: true,
  default: ({ post }: { post: { tags?: string[] } }) => (
    <div data-testid="post-tags">{post.tags?.join(',')}</div>
  ),
}));

jest.mock('./EmbeddedTweetPreview', () => ({
  __esModule: true,
  EmbeddedTweetPreview: jest.fn(({ post }) => {
    const handle = post.sharedPost?.source?.handle || post.source?.handle;
    const name = post.sharedPost?.source?.name || post.source?.name;

    return (
      <div>
        {handle && <img alt={`${handle}'s profile`} />}
        {name && handle && <div>{`${name} @${handle}`}</div>}
        <div>{post.sharedPost?.title || post.title}</div>
      </div>
    );
  }),
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

const referencedPost = sharePost.sharedPost;

if (!referencedPost?.source) {
  throw new Error('Expected referenced source fixture for SocialTwitterList tests');
}

const referencedSource = referencedPost.source;

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
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/',
      } as unknown as NextRouter),
  );
});

const mockedEmbeddedTweetPreview = jest.mocked(EmbeddedTweetPreview);

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
        ...referencedPost,
        type: PostType.SocialTwitter,
        title: 'Referenced tweet body',
        source: {
          ...referencedSource,
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
      content: undefined,
      contentHtml: undefined,
      tags: ['tagaa', 'tagbb'],
      sharedPost: {
        ...referencedPost,
        type: PostType.SocialTwitter,
        title: 'Referenced tweet body',
        source: {
          ...referencedSource,
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
  expect(mockedEmbeddedTweetPreview).toHaveBeenLastCalledWith(
    expect.objectContaining({
      className: 'w-full',
      textClampClass: 'line-clamp-10',
    }),
    {},
  );
});
