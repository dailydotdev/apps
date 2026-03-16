import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { mocked } from 'ts-jest/utils';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { sharePost } from '../../../../__tests__/fixture/post';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import type { PostCardProps } from '../common/common';
import { ShareList } from './ShareList';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../hooks', () => {
  const originalModule = jest.requireActual('../../../hooks');
  return {
    __esModule: true,
    ...originalModule,
    useViewSize: () => false,
  };
});

const sharedTweetPost = {
  ...sharePost,
  title: '',
  sharedPost: {
    ...sharePost.sharedPost,
    type: PostType.SocialTwitter,
    title: 'Referenced tweet body',
    source: {
      ...sharePost.sharedPost.source,
      handle: 'typescript',
      name: 'Typescript',
    },
  },
} as unknown as Post;

const defaultProps: PostCardProps = {
  post: sharedTweetPost,
  onPostClick: jest.fn(),
  onPostAuxClick: jest.fn(),
  onUpvoteClick: jest.fn(),
  onDownvoteClick: jest.fn(),
  onCommentClick: jest.fn(),
  onCopyLinkClick: jest.fn(),
  onBookmarkClick: jest.fn(),
  onReadArticleClick: jest.fn(),
  onShare: jest.fn(),
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

describe('ShareList', () => {
  it('renders shared tweets above the actions bar in list mode', async () => {
    render(
      <TestBootProvider client={new QueryClient()}>
        <ShareList {...defaultProps} />
      </TestBootProvider>,
    );

    const previewText = await screen.findByText('Referenced tweet body');
    const commentsButton = await screen.findByLabelText('Comment');

    expect(
      previewText.compareDocumentPosition(commentsButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
