import type { ReactElement } from 'react';
import React from 'react';
import { render, screen } from '@testing-library/react';
import type { Post } from '../../../graphql/posts';
import { useAuthContext } from '../../../contexts/AuthContext';
import { Origin } from '../../../lib/log';
import { PostContextRail } from './PostContextRail';

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../BuildYourFeedWidget', () => ({
  BuildYourFeedWidget: (): ReactElement => (
    <div data-testid="build-your-feed-widget" />
  ),
}));

jest.mock('../../cards/highlight/HighlightPostSidebarWidget', () => ({
  HighlightPostSidebarWidget: (): ReactElement => (
    <div data-testid="highlight-widget" />
  ),
}));

jest.mock('../../ShareBar', () => ({
  __esModule: true,
  default: (): ReactElement => <div data-testid="share-bar" />,
}));

jest.mock('../../ShareMobile', () => ({
  ShareMobile: (): ReactElement => <div data-testid="share-mobile" />,
}));

jest.mock('../../brand/MentionedToolsWidget', () => ({
  MentionedToolsWidget: ({
    compact,
    postTags,
  }: {
    compact?: boolean;
    postTags: string[];
  }): ReactElement => (
    <div
      data-compact={compact ? 'true' : 'false'}
      data-tags={postTags.join(',')}
      data-testid="tools-widget"
    />
  ),
}));

const mockUseAuthContext = jest.mocked(useAuthContext);

const post = {
  id: 'p1',
  tags: ['react', 'typescript'],
  commentsPermalink: '/posts/p1#comments',
} as Post;

const renderRail = (): void => {
  render(
    <PostContextRail
      onCopyPostLink={jest.fn()}
      origin={Origin.ArticlePage}
      post={post}
    />,
  );
};

describe('PostContextRail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the contextual feed signup for logged-out visitors', () => {
    mockUseAuthContext.mockReturnValue({ user: null } as never);

    renderRail();

    expect(screen.getByTestId('build-your-feed-widget')).toBeInTheDocument();
    expect(screen.getByTestId('highlight-widget')).toBeInTheDocument();
    expect(screen.getByTestId('share-bar')).toBeInTheDocument();
    expect(screen.getByTestId('share-mobile')).toBeInTheDocument();
    expect(screen.getByTestId('tools-widget')).toHaveAttribute(
      'data-compact',
      'true',
    );
  });

  it('keeps the redesigned rail for signed-in users without signup prompts', () => {
    mockUseAuthContext.mockReturnValue({ user: { id: 'u1' } } as never);

    renderRail();

    expect(
      screen.queryByTestId('build-your-feed-widget'),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('highlight-widget')).toBeInTheDocument();
    expect(screen.getByTestId('tools-widget')).toHaveAttribute(
      'data-tags',
      'react,typescript',
    );
  });
});
