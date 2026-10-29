import React from 'react';
import type { ComponentType } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import post, { sharePost } from '../../../../__tests__/fixture/post';
import { pollPost } from '../../../../__tests__/fixture/pollPost';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import type { PostCardProps } from './common';
import ActionButtons from './ActionButtons';
import type { ActionButtonsVariant } from './ActionButtons';
import { ArticleGrid } from '../article/ArticleGrid';
import { ShareGrid } from '../share/ShareGrid';
import { FreeformGrid } from '../Freeform/FreeformGrid';
import PollGrid from '../poll/PollGrid';
import { CollectionGrid } from '../collection/CollectionGrid';
import { SocialTwitterGrid } from '../socialTwitter/SocialTwitterGrid';
import { usePostImpressions } from '../../../hooks/post/usePostImpressions';
import { useEngagementBarV2 } from '../../../hooks/useEngagementBarV2';

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/', query: {} }),
}));

jest.mock('../../../hooks/post/usePostImpressions', () => ({
  usePostImpressions: jest.fn(),
}));

jest.mock('../../../hooks/useEngagementBarV2', () => ({
  useEngagementBarV2: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useEngagementBarV2).mockReturnValue(false);
  jest.mocked(usePostImpressions).mockReturnValue({
    showImpressions: true,
    impressions: 1000,
    canViewAnalytics: false,
    onImpressionsClick: jest.fn(),
  });
});

const wrap = (children: React.ReactNode) => (
  <TestBootProvider client={new QueryClient()}>{children}</TestBootProvider>
);

/** The bar's buttons, in order, by accessible name. */
const barLabels = (container: HTMLElement): string[] => {
  const upvote = container.querySelector('[id$="-upvote-btn"]');
  const bar = upvote?.closest('.justify-between');
  return Array.from(bar?.querySelectorAll('button, a[href]') ?? [])
    .map((el) => el.getAttribute('aria-label'))
    .filter((label): label is string => !!label);
};

describe('ActionButtons bookmark placement', () => {
  const renderBar = (
    variant: ActionButtonsVariant,
    bookmarkInHeader?: boolean,
  ) =>
    render(
      wrap(
        <ActionButtons
          post={post}
          variant={variant}
          bookmarkInHeader={bookmarkInHeader}
        />,
      ),
    );

  it('keeps today’s order without bookmark when the card shows it in its header', () => {
    const { container } = renderBar('grid', true);

    expect(barLabels(container)).toEqual([
      'Upvote',
      'Comments',
      'Downvote',
      'Copy link',
      'Impressions',
    ]);
  });

  it('keeps the bookmark in the bar for a grid card that has no header slot', () => {
    const { container } = renderBar('grid');

    expect(barLabels(container)).toEqual([
      'Upvote',
      'Comments',
      'Downvote',
      'Bookmark',
      'Copy link',
      'Impressions',
    ]);
  });

  it('keeps list cards at 24px, bookmark in the bar', () => {
    const { container } = renderBar('list');

    // List cards keep the v1 bar: 24px buttons, the bookmark included.
    expect(barLabels(container)).toContain('Bookmark');
    expect(
      document.querySelector(`#post-${post.id}-upvote-btn`),
    ).not.toHaveClass('h-8');
  });

  it('renders grid actions at 32px', () => {
    renderBar('grid', true);

    expect(screen.getByRole('button', { name: 'Upvote' })).toHaveClass('h-8');
  });

  it('keeps the v1 bar on grid cards, only bigger', () => {
    renderBar('grid', true);

    // The v1 bar, not the v2 CardAction bar.
    expect(document.querySelector(`#post-${post.id}-upvote-btn`)).toHaveClass(
      'btn-tertiary-avocado',
    );
    expect(document.querySelector('.card-action-content')).toBeNull();
  });

  it('keeps the v2 bar for engagement_bar_v2 users, at 32px', () => {
    jest.mocked(useEngagementBarV2).mockReturnValue(true);
    const { container } = renderBar('grid', true);

    expect(document.querySelector('.card-action-content')).not.toBeNull();
    expect(document.querySelector(`#post-${post.id}-upvote-btn`)).toHaveClass(
      'h-8',
    );
    expect(barLabels(container)).not.toContain('Bookmark');
  });
});

const props = (cardPost: Post): PostCardProps => ({
  post: cardPost,
  onPostClick: jest.fn(),
  onPostAuxClick: jest.fn(),
  onUpvoteClick: jest.fn(),
  onCommentClick: jest.fn(),
  onBookmarkClick: jest.fn(),
  onShare: jest.fn(),
  onCopyLinkClick: jest.fn(),
  onReadArticleClick: jest.fn(),
});

const gridCards: [string, ComponentType<PostCardProps>, Post][] = [
  ['article', ArticleGrid, post],
  ['share', ShareGrid, sharePost],
  [
    'freeform',
    FreeformGrid,
    { ...post, type: PostType.Freeform, contentHtml: '<p>Post</p>' },
  ],
  ['poll', PollGrid, pollPost],
  [
    'collection',
    CollectionGrid,
    { ...post, type: PostType.Collection, collectionSources: [] },
  ],
  [
    'social',
    SocialTwitterGrid,
    { ...sharePost, type: PostType.SocialTwitter, sharedPost: undefined },
  ],
];

describe.each(gridCards)('%s grid card', (_, Card, cardPost) => {
  it('shows the bookmark in the header, not the bar', () => {
    const cardProps = props(cardPost);
    const { container } = render(wrap(<Card {...cardProps} />));

    const bookmarks = screen.getAllByRole('button', { name: 'Bookmark' });
    expect(bookmarks).toHaveLength(1);
    expect(barLabels(container)).not.toContain('Bookmark');

    // Hidden at rest on desktop, like Read post and ⋯.
    expect(bookmarks[0]).toHaveClass('laptop:mouse:invisible');

    fireEvent.click(bookmarks[0]);
    expect(cardProps.onBookmarkClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: cardPost.id }),
    );
  });

  it('keeps a saved post’s bookmark hover-only too', () => {
    render(wrap(<Card {...props({ ...cardPost, bookmarked: true })} />));

    const bookmark = screen.getByRole('button', { name: 'Remove bookmark' });
    expect(bookmark).toHaveClass('laptop:mouse:invisible');
  });
});
