import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { sharePost } from '../../../../__tests__/fixture/post';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import type { PostCardProps } from '../common/common';
import { ShareList } from './ShareList';
import { useFeature } from '../../GrowthBookProvider';
import { featureGeneratedCover } from '../../../lib/featureManagement';

jest.mock('../../GrowthBookProvider', () => ({
  ...(jest.requireActual('../../GrowthBookProvider') as Record<
    string,
    unknown
  >),
  useFeature: jest.fn(),
}));

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
      ...(sharePost.sharedPost?.source ?? {}),
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
  jest.mocked(useFeature).mockImplementation((feature) => feature.defaultValue);
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/',
      } as unknown as NextRouter),
  );
});

describe('ShareList', () => {
  it('keeps the shared post image when generated covers are on', () => {
    jest
      .mocked(useFeature)
      .mockImplementation((feature) => feature.id === featureGeneratedCover.id);
    render(
      <TestBootProvider client={new QueryClient()}>
        <ShareList {...defaultProps} post={sharePost} />
      </TestBootProvider>,
    );

    expect(screen.queryByTestId('generatedCover')).not.toBeInTheDocument();
    // The list cover swaps in a mobile transformation, so match the asset
    expect(screen.getByAltText('Post Cover image')).toHaveAttribute(
      'src',
      expect.stringContaining('4c37589089ac21e7631b7e9d22cd2c54'),
    );
  });

  it('renders shared tweets above the actions bar in list mode', async () => {
    render(
      <TestBootProvider client={new QueryClient()}>
        <ShareList {...defaultProps} />
      </TestBootProvider>,
    );

    const previewText = await screen.findByText('Referenced tweet body');
    const commentsButton = await screen.findByLabelText('Comment');

    const position =
      // eslint-disable-next-line no-bitwise
      previewText.compareDocumentPosition(commentsButton) &
      Node.DOCUMENT_POSITION_FOLLOWING;
    expect(position).toBeTruthy();
  });
});
