import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { AuthContextProvider } from '../../contexts/AuthContext';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { settingsContext } from '../../../__tests__/helpers/boot';
import SettingsContext from '../../contexts/SettingsContext';
import { sharePost } from '../../../__tests__/fixture/post';
import type { PostCardProps } from '../../components/cards/common/common';
import { ArticleGrid } from '../../components/cards/article/ArticleGrid';
import { GrowthBookProvider } from '../../components/GrowthBookProvider';
import { BootApp } from '../../lib/boot';

const defaultProps: PostCardProps = {
  post: sharePost,
  onPostClick: jest.fn(),
  onUpvoteClick: jest.fn(),
  onCommentClick: jest.fn(),
  onBookmarkClick: jest.fn(),
  onShare: jest.fn(),
  onCopyLinkClick: jest.fn(),
  onReadArticleClick: jest.fn(),
};

const renderComponent = () => {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthContextProvider
        user={loggedUser}
        updateUser={jest.fn()}
        getRedirectUri={jest.fn()}
        tokenRefreshed
      >
        <GrowthBookProvider
          app={BootApp.Test}
          user={loggedUser}
          deviceId="123"
          experimentation={{
            f: '{}',
            e: [],
            a: [],
            features: {
              social_share: {
                defaultValue: true,
              },
            },
          }}
        >
          <SettingsContext.Provider value={settingsContext}>
            <ArticleGrid {...defaultProps} />
          </SettingsContext.Provider>
        </GrowthBookProvider>
      </AuthContextProvider>
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('usePostActions', () => {
  it('should call on share click on copy link button click', async () => {
    renderComponent();

    const el = screen.getByLabelText('Copy link');
    el.click();

    expect(
      await screen.findByText('Why not share it on social, too?'),
    ).toBeInTheDocument();
  });

  it('should show share overlay when post is upvoted', async () => {
    renderComponent();

    const el = screen.getByLabelText('Upvote');
    el.click();

    expect(
      await screen.findByText('Should anyone else see this post?'),
    ).toBeInTheDocument();
  });

  it('should show bookmark overlay when post is bookmarked', async () => {
    renderComponent();

    const bookmarkButton = screen.getByLabelText('Bookmark');
    bookmarkButton.click();

    expect(
      await screen.findByText('Don’t have time now? Set a reminder'),
    ).toBeInTheDocument();
  });

  it('should show bookmark overlay instead of share overlay when post is bookmarked after upvote click', async () => {
    renderComponent();

    const upvoteBtn = screen.getByLabelText('Upvote');
    upvoteBtn.click();

    const bookmarkBtn = screen.getByLabelText('Bookmark');
    bookmarkBtn.click();

    expect(
      await screen.findByText('Don’t have time now? Set a reminder'),
    ).toBeInTheDocument();
  });

  it('should show share overlay instead of bookmark overlay when upvote is clicked after bookmark is clicked', async () => {
    renderComponent();

    const bookmarkBtn = screen.getByLabelText('Bookmark');
    bookmarkBtn.click();

    const upvoteBtn = screen.getByLabelText('Upvote');
    upvoteBtn.click();

    expect(
      await screen.findByText('Should anyone else see this post?'),
    ).toBeInTheDocument();
  });
});
