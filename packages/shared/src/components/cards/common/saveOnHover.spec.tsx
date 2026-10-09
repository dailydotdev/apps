import React from 'react';
import type { ComponentType } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
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
import { useCardSaveOnHover } from '../../../hooks/cards/useCardSaveOnHover';
import { usePostImpressions } from '../../../hooks/post/usePostImpressions';

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/', query: {} }),
}));

jest.mock('../../../hooks/cards/useCardSaveOnHover', () => ({
  useCardSaveOnHover: jest.fn(),
}));

jest.mock('../../../hooks/post/usePostImpressions', () => ({
  usePostImpressions: jest.fn(),
}));

const setFlag = (on: boolean) =>
  jest.mocked(useCardSaveOnHover).mockReturnValue(on);

beforeEach(() => {
  jest.clearAllMocks();
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

describe('ActionButtons with card_save_on_hover', () => {
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
    setFlag(true);
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
    setFlag(true);
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

  it.each<ActionButtonsVariant>(['list', 'signal'])(
    'leaves %s cards at control, bookmark in the bar',
    (variant) => {
      setFlag(true);
      const { container } = renderBar(variant);

      // Control is today's v1 bar: 24px buttons, the bookmark included.
      expect(barLabels(container)).toContain('Bookmark');
      expect(
        document.querySelector(`#post-${post.id}-upvote-btn`),
      ).not.toHaveClass('h-8');
    },
  );

  it('renders grid actions at 32px', () => {
    setFlag(true);
    renderBar('grid', true);

    expect(screen.getByRole('button', { name: 'Upvote' })).toHaveClass('h-8');
  });

  it('leaves today’s bar untouched when the flag is off', () => {
    setFlag(false);
    renderBar('grid', true);

    expect(
      document.querySelector(`#post-${post.id}-upvote-btn`),
    ).not.toHaveClass('h-8');
    expect(screen.getByRole('button', { name: 'Bookmark' })).toBeVisible();
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
  it('moves the bookmark to the header when the flag is on', () => {
    setFlag(true);
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

  it('keeps the bookmark in the bar when the flag is off', () => {
    setFlag(false);
    render(wrap(<Card {...props(cardPost)} />));

    // Located by id: today's bar names the upvote button by its count.
    const bar = document
      .getElementById(`post-${cardPost.id}-upvote-btn`)
      ?.closest('.justify-between') as HTMLElement;
    expect(
      within(bar).getByRole('button', { name: 'Bookmark' }),
    ).toBeInTheDocument();
  });
});
