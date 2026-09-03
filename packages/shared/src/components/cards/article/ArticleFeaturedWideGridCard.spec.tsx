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
import { featureHeroCards } from '../../../lib/featureManagement';

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
  props: Partial<
    PostCardProps & { wideColSpan?: 2 | 3 | 4 | 5; hero?: boolean }
  > = {},
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

describe('hero sizing', () => {
  // The shared fixture has no summary, and the summary is the element under
  // test here.
  const summarised: Post = { ...post, summary: 'What the post is about.' };
  const summaryOf = (): HTMLElement =>
    screen.getByText(summarised.summary as string);

  it('lets the summary give way so the action row keeps its place', () => {
    renderComponent({ post: summarised, hero: true, wideColSpan: 5 });

    const summary = summaryOf();
    // Every element is `flex-shrink: 0` by default in base.css, so the summary
    // and the block holding it have to opt back in or the actions get pushed
    // out through the bottom of the fixed-height card.
    expect(summary).toHaveClass('shrink');
    expect(summary.parentElement).toHaveClass('shrink', 'min-h-0');
  });

  it('leaves the in-feed card unable to shrink its summary', () => {
    renderComponent({ post: summarised, wideColSpan: 2 });

    const summary = summaryOf();
    expect(summary).not.toHaveClass('shrink');
    expect(summary.parentElement).not.toHaveClass('shrink');
  });
});
