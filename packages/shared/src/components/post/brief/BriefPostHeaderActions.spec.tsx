import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { BriefPostHeaderActions } from './BriefPostHeaderActions';
import type { Post } from '../../../graphql/posts';
import { Origin } from '../../../lib/log';

const mockCopyLink = jest.fn();
const mockOpenSharePost = jest.fn();

let mockAtEveryWidth = false;

jest.mock('../../../hooks/useSharePost', () => ({
  useSharePost: () => ({
    copyLink: mockCopyLink,
    openSharePost: mockOpenSharePost,
  }),
}));

jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: () => ({ value: mockAtEveryWidth, isLoading: false }),
}));

const post = { id: 'brief-1', slug: 'brief-1' } as Post;

const renderComponent = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <BriefPostHeaderActions
        showShareButton
        contextMenuId="post-widgets-context"
        origin={Origin.BriefPage}
        post={post}
      />
    </QueryClientProvider>,
  );

describe('BriefPostHeaderActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAtEveryWidth = false;
  });

  it('keeps the cluster desktop-only while the flag is off', () => {
    renderComponent();

    expect(
      screen.getByRole('button', { name: 'Copy link' }).closest('div'),
    ).toHaveClass('hidden', 'laptop:flex');
    expect(
      screen.queryByRole('button', { name: 'Share briefing' }),
    ).not.toBeInTheDocument();
  });

  it('shows copy link and share at every width when the flag is on', () => {
    mockAtEveryWidth = true;
    renderComponent();

    const cluster = screen
      .getByRole('button', { name: 'Copy link' })
      .closest('div');

    expect(cluster).not.toHaveClass('hidden');
    expect(
      screen.getByRole('button', { name: 'Share briefing' }),
    ).toBeInTheDocument();
  });

  it('copies the brief link and opens the share modal', () => {
    mockAtEveryWidth = true;
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    fireEvent.click(screen.getByRole('button', { name: 'Share briefing' }));

    expect(mockCopyLink).toHaveBeenCalledWith({ post });
    expect(mockOpenSharePost).toHaveBeenCalledWith({ post });
  });
});
