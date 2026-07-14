import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import post from '../../../../__tests__/fixture/post';
import type { PostCardProps } from '../common/common';
import type { Post } from '../../../graphql/posts';
import type { PostHero, PostHeroSignificance } from '../../../graphql/types';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { ArticleFeaturedWideGridCard } from './ArticleFeaturedWideGridCard';
import {
  featureFeedCardGlassActions,
  featureHeroCards,
} from '../../../lib/featureManagement';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/',
      } as unknown as NextRouter),
  );
});

const defaultProps: PostCardProps = {
  post,
  onPostClick: jest.fn(),
  onUpvoteClick: jest.fn(),
  onCommentClick: jest.fn(),
  onBookmarkClick: jest.fn(),
  onShare: jest.fn(),
  onCopyLinkClick: jest.fn(),
  onReadArticleClick: jest.fn(),
};

const SIZE_BY_SIGNIFICANCE: Record<PostHeroSignificance, number> = {
  breaking: 4,
  major: 3,
  notable: 2,
  routine: 1,
  breakout: 3,
  evergreen: 2,
};

const makeHero = (significance: PostHeroSignificance | null): PostHero | null =>
  significance
    ? {
        id: 'h1',
        highlightedAt: '2026-05-25T00:00:00.000Z',
        headline: 'A breaking event',
        significance,
        size: SIZE_BY_SIGNIFICANCE[significance],
      }
    : null;

const renderComponent = (
  props: Partial<PostCardProps & { wideColSpan?: 2 | 3 | 4 }> = {},
): RenderResult => {
  // HighlightChip short-circuits when the experiment flag is off; the
  // chip-label tests need it on, so override the GrowthBook value here.
  const gb = new GrowthBook();
  gb.setFeatures({
    [featureHeroCards.id]: {
      defaultValue: {
        ...featureHeroCards.defaultValue,
        enabled: true,
      },
    },
  });
  return render(
    <TestBootProvider client={new QueryClient()} gb={gb}>
      <ArticleFeaturedWideGridCard {...defaultProps} {...props} />
    </TestBootProvider>,
  );
};

const postWith = (significance: PostHeroSignificance | null): Post => ({
  ...post,
  hero: makeHero(significance),
});

it.each<[PostHeroSignificance, string]>([
  ['breaking', 'Breaking'],
  ['major', 'Major'],
  ['notable', 'Notable'],
  ['breakout', 'Breaking out'],
  ['evergreen', 'Evergreen'],
])('renders the chip label for %s significance', (significance, label) => {
  renderComponent({ post: postWith(significance), wideColSpan: 2 });
  expect(screen.getByText(label)).toBeInTheDocument();
});

it('renders no chip for routine significance', () => {
  renderComponent({ post: postWith('routine'), wideColSpan: 2 });
  expect(screen.queryByText('Routine')).not.toBeInTheDocument();
  expect(screen.queryByText('Breaking')).not.toBeInTheDocument();
});

it('renders no chip when post has no highlight', () => {
  renderComponent({ post: postWith(null), wideColSpan: 2 });
  expect(screen.queryByText('Breaking')).not.toBeInTheDocument();
  expect(screen.queryByText('Major')).not.toBeInTheDocument();
  expect(screen.queryByText('Notable')).not.toBeInTheDocument();
});

const renderGlassHero = (postOverride: Partial<Post>): RenderResult => {
  const gb = new GrowthBook();
  gb.setFeatures({
    [featureFeedCardGlassActions.id]: { defaultValue: true },
  });
  return render(
    <TestBootProvider client={new QueryClient()} gb={gb}>
      <ArticleFeaturedWideGridCard
        {...defaultProps}
        post={{ ...post, ...postOverride }}
        wideColSpan={2}
      />
    </TestBootProvider>,
  );
};

// In glass mode the action pill floats over the bottom of the content column,
// so a full-size 3-line title + 3-line TLDR overflowed and the TLDR's last line
// was cut off behind the pill. The title keeps up to 3 lines but drops one type
// step (typo-title2, still larger than the default card's typo-title3) when a
// TLDR is present so both fit and all three TLDR lines stay visible.
it('shrinks the glass hero title to typo-title2 (still 3 lines) when a TLDR is present', () => {
  renderGlassHero({ summary: 'A concise summary of the article.' });
  const heading = screen.getByRole('heading', { level: 3 });
  expect(heading).toHaveClass('typo-title2');
  expect(heading).toHaveClass('line-clamp-3');
  expect(heading).not.toHaveClass('typo-title1');
});

it('keeps the full-size glass hero title (typo-title1) when there is no TLDR', () => {
  renderGlassHero({ summary: '', sharedPost: undefined });
  const heading = screen.getByRole('heading', { level: 3 });
  expect(heading).toHaveClass('typo-title1');
  expect(heading).toHaveClass('line-clamp-3');
});
