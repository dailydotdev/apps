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

it('should render twitter action link using post permalink', async () => {
  renderComponent();

  const link = await screen.findByLabelText('View tweet on X');
  expect(link).toHaveAttribute('href', basePost.permalink);
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

  expect(await screen.findByText('DevRel Weekly')).toBeInTheDocument();
  expect(await screen.findByText('@devrelweekly')).toBeInTheDocument();
  expect(
    await screen.findByText('Referenced tweet content'),
  ).toBeInTheDocument();
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
