import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { mocked } from 'ts-jest/utils';
import { tweetPost, tweetPostWithMedia } from '../../../../__tests__/fixture/tweetPost';
import type { PostCardProps } from '../common/common';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { TweetList } from './TweetList';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/',
      } as unknown as NextRouter),
  );
});

const defaultProps: PostCardProps = {
  post: tweetPost,
  onPostClick: jest.fn(),
  onUpvoteClick: jest.fn(),
  onCommentClick: jest.fn(),
  onBookmarkClick: jest.fn(),
  onShare: jest.fn(),
  onCopyLinkClick: jest.fn(),
  onReadArticleClick: jest.fn(),
};

const renderComponent = (props: Partial<PostCardProps> = {}): RenderResult => {
  return render(
    <TestBootProvider client={new QueryClient()}>
      <TweetList {...defaultProps} {...props} />
    </TestBootProvider>,
  );
};

it('should render tweet content', async () => {
  renderComponent();
  const el = await screen.findByText(
    /Check out our latest feature release!/,
  );
  expect(el).toBeInTheDocument();
});

it('should render X icon with link to tweet', async () => {
  renderComponent();
  const el = await screen.findByLabelText('View on X');
  expect(el).toBeInTheDocument();
  expect(el).toHaveAttribute(
    'href',
    'https://x.com/dailydotdev/status/1234567890123456789',
  );
});

it('should call onPostClick when clicking the card', async () => {
  renderComponent();
  const el = await screen.findByText(/Check out our latest feature release!/);
  el.click();
  await waitFor(() => expect(defaultProps.onPostClick).toBeCalled());
});

it('should call onUpvoteClick on upvote button click', async () => {
  renderComponent();
  const el = await screen.findByLabelText('More like this');
  el.click();
  await waitFor(() =>
    expect(defaultProps.onUpvoteClick).toBeCalledWith(tweetPost),
  );
});

it('should call onCommentClick on comment button click', async () => {
  renderComponent();
  const el = await screen.findByLabelText('Comments');
  el.click();
  await waitFor(() =>
    expect(defaultProps.onCommentClick).toBeCalledWith(tweetPost),
  );
});

it('should call onCopyLinkClick on copy link button click', async () => {
  renderComponent();
  const el = await screen.findByLabelText('Copy link');
  el.click();
  await waitFor(() => expect(defaultProps.onCopyLinkClick).toBeCalled());
});

it('should render tweet media preview when available', async () => {
  renderComponent({ post: tweetPostWithMedia });
  const el = await screen.findByAltText('Tweet media');
  expect(el).toBeInTheDocument();
});

it('should not render tweet media preview when not available', async () => {
  renderComponent();
  const el = screen.queryByAltText('Tweet media');
  expect(el).not.toBeInTheDocument();
});
