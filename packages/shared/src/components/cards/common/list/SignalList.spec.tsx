import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { mocked } from 'ts-jest/utils';
import type { Post } from '../../../../graphql/posts';
import { PostType } from '../../../../graphql/posts';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import { sharePost } from '../../../../../__tests__/fixture/post';
import type { PostCardProps } from '../common';
import { SignalList } from './SignalList';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const basePost: Post = {
  ...sharePost,
  type: PostType.Article,
  title: 'Signal post',
  summary: 'Article summary',
  content: 'Article content',
  commentsPermalink: 'https://app.daily.dev/posts/signal-post',
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
      <SignalList {...defaultProps} {...props} />
    </TestBootProvider>,
  );

it('should render article summary for non-twitter posts', async () => {
  renderComponent();

  expect(await screen.findByText('Article summary')).toBeInTheDocument();
  expect(screen.queryByText('Article content')).not.toBeInTheDocument();
});

it('should render tweet content instead of summary for tweet posts', async () => {
  renderComponent({
    post: {
      ...basePost,
      type: PostType.SocialTwitter,
      summary: 'Tweet summary should be hidden',
      contentHtml: '<p>Tweet content should be shown</p>',
      title: 'Tweet title should be hidden',
    },
  });

  expect(
    await screen.findByText('Tweet content should be shown'),
  ).toBeInTheDocument();
  expect(
    screen.queryByText('Tweet summary should be hidden'),
  ).not.toBeInTheDocument();
});

it('should render retweet content when tweet content is empty', async () => {
  renderComponent({
    post: {
      ...basePost,
      type: PostType.SocialTwitter,
      subType: 'repost',
      summary: 'Tweet summary should be hidden',
      contentHtml: '',
      sharedPost: {
        ...sharePost.sharedPost,
        type: PostType.SocialTwitter,
        title: 'Retweet content should be shown',
      },
    },
  });

  expect(
    await screen.findByText('Retweet content should be shown'),
  ).toBeInTheDocument();
  expect(
    screen.queryByText('Tweet summary should be hidden'),
  ).not.toBeInTheDocument();
});
