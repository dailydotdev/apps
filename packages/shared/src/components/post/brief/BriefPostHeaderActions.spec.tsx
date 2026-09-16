import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { BriefPostHeaderActions } from './BriefPostHeaderActions';
import type { Post } from '../../../graphql/posts';
import { Origin } from '../../../lib/log';

const mockCopyLink = jest.fn();
const mockOpenSharePost = jest.fn();

jest.mock('../../../hooks/useSharePost', () => ({
  useSharePost: () => ({
    copyLink: mockCopyLink,
    openSharePost: mockOpenSharePost,
  }),
}));

const post = { id: 'brief-1', slug: 'brief-1' } as Post;

const renderComponent = (showShareButton = true) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <BriefPostHeaderActions
        showShareButton={showShareButton}
        contextMenuId="post-widgets-context"
        origin={Origin.BriefPage}
        post={post}
      />
    </QueryClientProvider>,
  );

describe('BriefPostHeaderActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows share at every width and leaves the copy link to laptop', () => {
    renderComponent();

    expect(
      screen.getByRole('button', { name: 'Share briefing' }),
    ).not.toHaveClass('hidden');
    expect(screen.getByRole('button', { name: 'Copy link' })).toHaveClass(
      'hidden',
      'laptop:flex',
    );
  });

  it('renders no share controls where the share button is off', () => {
    renderComponent(false);

    expect(
      screen.queryByRole('button', { name: 'Copy link' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Share briefing' }),
    ).not.toBeInTheDocument();
  });

  it('copies the brief link and opens the share modal', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    fireEvent.click(screen.getByRole('button', { name: 'Share briefing' }));

    expect(mockCopyLink).toHaveBeenCalledWith({ post });
    expect(mockOpenSharePost).toHaveBeenCalledWith({ post });
  });
});
