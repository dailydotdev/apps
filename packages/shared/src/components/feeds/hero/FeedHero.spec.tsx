import React from 'react';
import nock from 'nock';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import basePost from '../../../../__tests__/fixture/post';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import {
  FEED_HERO_QUERY,
  supportedTypesForPrivateSources,
} from '../../../graphql/feed';
import { FeedHero } from './FeedHero';
import { feedHeroShape } from './feedHeroShape';
import { useFeedHeroAd } from './useFeedHeroAd';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('./useFeedHeroAd', () => ({
  useFeedHeroAd: jest.fn(),
}));

const posts = ['First hero post', 'Second hero post'].map((title, index) => ({
  ...basePost,
  id: `hero-post-${index}`,
  title,
}));

const highlights = ['First headline', 'Second headline', 'Third headline'].map(
  (headline, index) => ({
    id: `hero-highlight-${index}`,
    channel: 'agents',
    headline,
    highlightedAt: '2026-04-05T09:00:00.000Z',
    post: {
      id: `hero-post-${index}`,
      commentsPermalink: `/posts/hero-post-${index}`,
    },
  }),
);

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  jest
    .mocked(useRouter)
    .mockImplementation(() => ({ pathname: '/' } as unknown as NextRouter));
  jest.mocked(useFeedHeroAd).mockReturnValue({
    ad: undefined,
    placement: 'none',
    shape: feedHeroShape(3),
  });
});

const mockHero = (data: {
  posts: typeof posts;
  highlights: typeof highlights;
}) =>
  mockGraphQL({
    request: {
      query: FEED_HERO_QUERY,
      variables: {
        loggedIn: false,
        supportedTypes: supportedTypesForPrivateSources,
      },
    },
    result: { data: { feedHero: data } },
  });

const renderComponent = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <FeedHero feedName="popular" />
    </TestBootProvider>,
  );

describe('FeedHero', () => {
  it('should render its cards and its rail from the one query', async () => {
    mockHero({ posts, highlights });

    renderComponent();

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'First hero post' }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText('Second headline')).toBeInTheDocument();
    expect(screen.getByText('Third headline')).toBeInTheDocument();
  });

  it('should render nothing when the query returns no posts', async () => {
    mockHero({ posts: [], highlights: [] });

    const { container } = renderComponent();

    await waitFor(() => expect(nock.isDone()).toBe(true));
    expect(container).toBeEmptyDOMElement();
  });
});
