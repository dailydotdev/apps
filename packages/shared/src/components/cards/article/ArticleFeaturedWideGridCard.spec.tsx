import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import post from '../../../../__tests__/fixture/post';
import type { PostCardProps } from '../common/common';
import type { Post } from '../../../graphql/posts';
import type { PostHero, PostHeroSignificance } from '../../../graphql/types';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { ArticleFeaturedWideGridCard } from './ArticleFeaturedWideGridCard';

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
): RenderResult =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <ArticleFeaturedWideGridCard {...defaultProps} {...props} />
    </TestBootProvider>,
  );

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
