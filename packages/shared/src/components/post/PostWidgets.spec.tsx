import type { ReactElement } from 'react';
import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthContext from '../../contexts/AuthContext';
import type { Post } from '../../graphql/posts';
import { useAnonymousPostExperience } from '../../hooks/post/useAnonymousPostExperience';
import { Origin } from '../../lib/log';
import { PostWidgets } from './PostWidgets';

jest.mock('../../hooks/post/useAnonymousPostExperience', () => ({
  useAnonymousPostExperience: jest.fn(),
}));

jest.mock('./BuildYourFeedWidget', () => ({
  BuildYourFeedWidget: (): ReactElement => (
    <div data-testid="build-your-feed-widget" />
  ),
}));

jest.mock('./PostSignupWidget', () => ({
  PostSignupWidget: (): ReactElement => (
    <div data-testid="post-signup-widget" />
  ),
}));

jest.mock('./PostSidebarAdWidget', () => ({
  PostSidebarAdWidget: (): ReactElement => (
    <div data-testid="post-sidebar-ad-widget" />
  ),
}));

jest.mock('../brand/MentionedToolsWidget', () => ({
  MentionedToolsWidget: ({ compact }: { compact?: boolean }): ReactElement => (
    <div data-compact={compact ? 'true' : 'false'} data-testid="tools-widget" />
  ),
}));

jest.mock('../ShareBar', () => ({
  __esModule: true,
  default: (): ReactElement => <div data-testid="share-bar" />,
}));

jest.mock('../ShareMobile', () => ({
  ShareMobile: (): ReactElement => <div data-testid="share-mobile" />,
}));

jest.mock('../cards/highlight/HighlightPostSidebarWidget', () => ({
  HighlightPostSidebarWidget: (): ReactElement => (
    <div data-testid="highlight-widget" />
  ),
}));

jest.mock('../widgets/FeaturedArchives', () => ({
  FeaturedArchives: (): ReactElement => <div data-testid="featured-archives" />,
}));

jest.mock('../footer', () => ({
  FooterLinks: (): ReactElement => <div data-testid="footer-links" />,
}));

const mockUseAnonymousPostExperience = jest.mocked(useAnonymousPostExperience);

const post = {
  id: 'p1',
  tags: ['react', 'typescript'],
  commentsPermalink: '/posts/p1#comments',
} as Post;

const renderComponent = (): void => {
  render(
    <AuthContext.Provider
      value={
        {
          tokenRefreshed: false,
        } as never
      }
    >
      <PostWidgets
        onCopyPostLink={jest.fn()}
        onReadArticle={jest.fn()}
        origin={Origin.ArticlePage}
        post={post}
      />
    </AuthContext.Provider>,
  );
};

describe('PostWidgets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the topic feed widget and hides low-intent widgets in the anonymous experience', () => {
    mockUseAnonymousPostExperience.mockReturnValue({
      isAnonPostExperience: true,
      isPostPageExperience: true,
    });

    renderComponent();

    expect(screen.getByTestId('build-your-feed-widget')).toBeInTheDocument();
    expect(screen.queryByTestId('post-signup-widget')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('post-sidebar-ad-widget'),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('featured-archives')).not.toBeInTheDocument();
    expect(screen.getByTestId('tools-widget')).toHaveAttribute(
      'data-compact',
      'true',
    );
  });

  it('keeps signup hidden but applies layout cleanup for signed-in users', () => {
    mockUseAnonymousPostExperience.mockReturnValue({
      isAnonPostExperience: false,
      isPostPageExperience: true,
    });

    renderComponent();

    expect(
      screen.queryByTestId('build-your-feed-widget'),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('post-signup-widget')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('post-sidebar-ad-widget'),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('featured-archives')).not.toBeInTheDocument();
    expect(screen.getByTestId('tools-widget')).toHaveAttribute(
      'data-compact',
      'true',
    );
  });
});
