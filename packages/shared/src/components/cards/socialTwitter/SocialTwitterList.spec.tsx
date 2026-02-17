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

it('should hide image and show referenced tweet block for shared social tweets', async () => {
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

  expect(await screen.findByText('Referenced post')).toBeInTheDocument();
  expect(await screen.findByText('@devrelweekly')).toBeInTheDocument();
  expect(await screen.findByText('Referenced tweet body')).toBeInTheDocument();
  expect(screen.queryByAltText('Post cover image')).not.toBeInTheDocument();
});

it('should render image for non-shared social tweets', async () => {
  renderComponent();

  expect(await screen.findByAltText('Post cover image')).toBeInTheDocument();
});
