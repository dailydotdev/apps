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
import { SocialTwitterGrid } from './SocialTwitterGrid';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../hooks', () => {
  const originalModule = jest.requireActual('../../../hooks');
  return {
    __esModule: true,
    ...originalModule,
    useBookmarkProvider: (): { highlightBookmarkedPost: boolean } => ({
      highlightBookmarkedPost: false,
    }),
  };
});

jest.mock('../common/PostTags', () => ({
  __esModule: true,
  default: ({ post }: { post: { tags?: string[] } }) => (
    <div data-testid="post-tags">{post.tags?.join(',')}</div>
  ),
}));

const basePost: Post = {
  ...sharePost,
  type: PostType.SocialTwitter,
  subType: 'thread',
  title: 'Root tweet',
  permalink: 'https://x.com/dailydotdev/status/12345',
  commentsPermalink: 'https://app.daily.dev/posts/12345',
  image: null,
  content: 'Root tweet\n\nThread tweet 2',
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
  openNewTab: true,
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
      <SocialTwitterGrid {...defaultProps} {...props} />
    </TestBootProvider>,
  );

it('should render top action link using post comments permalink', async () => {
  renderComponent();

  const link = await screen.findByRole('link', { name: 'Read on' });
  expect(link).toHaveAttribute('href', basePost.commentsPermalink);
});

it('should render source name next to metadata date for regular tweets', async () => {
  renderComponent();

  expect(await screen.findByText(/Avengers/i)).toBeInTheDocument();
  expect(screen.queryByText(/Avengers reposted/i)).not.toBeInTheDocument();
});

it('should render thread content without duplicating title line', async () => {
  renderComponent();

  expect(await screen.findByText('Thread tweet 2')).toBeInTheDocument();
  expect(
    screen.queryByText('Root tweet\n\nThread tweet 2'),
  ).not.toBeInTheDocument();
});

it('should not render media for thread cards even when image exists', async () => {
  renderComponent({
    post: {
      ...basePost,
      subType: 'thread',
      image: 'https://pbs.twimg.com/media/thread.jpg',
    },
  });

  expect(await screen.findByLabelText('More like this')).toBeInTheDocument();
  expect(screen.queryByAltText('Tweet media')).not.toBeInTheDocument();
});

it('should render quote/repost detail from shared post', async () => {
  renderComponent({
    post: {
      ...basePost,
      subType: 'quote',
      sharedPost: {
        ...sharePost.sharedPost,
        title: 'Referenced tweet content',
        source: {
          ...sharePost.sharedPost.source,
          name: 'DevRel Weekly',
          handle: 'devrelweekly',
        },
      },
    },
  });

  expect((await screen.findAllByText(/@avengers/)).length).toBeGreaterThan(0);
  expect((await screen.findAllByText(/@devrelweekly/)).length).toBeGreaterThan(
    0,
  );
  expect(
    await screen.findByText(/DevRel Weekly @devrelweekly/i),
  ).toBeInTheDocument();
  expect(
    await screen.findByAltText("devrelweekly's profile"),
  ).toBeInTheDocument();
  expect(
    await screen.findByText('Referenced tweet content'),
  ).toBeInTheDocument();
});

it('should use creatorTwitter when shared source is unknown', async () => {
  renderComponent({
    post: {
      ...basePost,
      subType: 'quote',
      creatorTwitter: 'root_creator',
      sharedPost: {
        ...sharePost.sharedPost,
        title: 'Referenced tweet content',
        creatorTwitter: 'shared_creator',
        source: {
          ...sharePost.sharedPost.source,
          id: 'unknown',
          name: 'Referenced post',
          handle: 'unknown',
        },
        author: {
          ...(sharePost.sharedPost.author || { id: 'author-id' }),
          username: 'creator_twitter',
        },
      },
    },
  });

  expect(
    (await screen.findAllByText(/@shared_creator/)).length,
  ).toBeGreaterThan(0);
  expect(screen.queryByText('@creator_twitter')).not.toBeInTheDocument();
  expect(screen.queryByText('@unknown')).not.toBeInTheDocument();
});

it('should prefer source name when source id is unknown', async () => {
  renderComponent({
    post: {
      ...basePost,
      source: {
        ...basePost.source,
        id: 'unknown',
        handle: 'unknown',
      },
      creatorTwitter: 'root_creator',
    },
  });

  expect(await screen.findByText('Avengers')).toBeInTheDocument();
  expect(screen.queryByText('@root_creator')).not.toBeInTheDocument();
  expect(screen.queryByText('@unknown')).not.toBeInTheDocument();
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
        source: {
          ...sharePost.sharedPost.source,
          name: 'Y Combinator',
          handle: 'ycombinator',
        },
        title: 'Referenced tweet content',
      },
    },
  });

  expect(
    screen.queryByText(
      '@bcherny: RT @ycombinator: Today, startups are not winning by hiring faster',
    ),
  ).not.toBeInTheDocument();
  expect(screen.queryByTestId('post-tags')).not.toBeInTheDocument();
  expect(await screen.findByText(/Avengers reposted/i)).toBeInTheDocument();
  expect(
    await screen.findByText(/Y Combinator @ycombinator/i),
  ).toBeInTheDocument();
  expect(
    await screen.findByText('Referenced tweet content'),
  ).toBeInTheDocument();
});

it('should keep headline and tags for repost cards with repost text', async () => {
  renderComponent({
    post: {
      ...basePost,
      subType: 'repost',
      title: '@bcherny: RT @ycombinator: Repost with context',
      content: 'My thoughts on this',
      tags: ['tagaa', 'tagbb'],
      sharedPost: {
        ...sharePost.sharedPost,
        title: 'Referenced tweet content',
      },
    },
  });

  expect(
    await screen.findByText('RT @ycombinator: Repost with context'),
  ).toBeInTheDocument();
  expect(await screen.findByTestId('post-tags')).toBeInTheDocument();
});

it('should keep actions visible when there is no media and no shared post detail', async () => {
  renderComponent({
    post: {
      ...basePost,
      subType: 'tweet',
      content: null,
      image: null,
    },
  });

  expect(await screen.findByLabelText('More like this')).toBeInTheDocument();
  expect(screen.queryByAltText('Tweet media')).not.toBeInTheDocument();
});
