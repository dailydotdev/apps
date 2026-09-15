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

  it('should drop only the lead story from a stacked rail', async () => {
    jest.mocked(useFeedHeroAd).mockReturnValue({
      ad: undefined,
      placement: 'none',
      // Stacked: the lead story is already a card above the list.
      shape: feedHeroShape(1),
    });
    mockHero({ posts, highlights });

    renderComponent();

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'First hero post' }),
      ).toBeInTheDocument(),
    );
    // Matched on the post behind it, not on its position in the list.
    expect(screen.queryByText('First headline')).not.toBeInTheDocument();
    expect(screen.getByText('Second headline')).toBeInTheDocument();
    expect(screen.getByText('Third headline')).toBeInTheDocument();
  });

  it('should keep a rail headline whose post is not the lead card', async () => {
    jest.mocked(useFeedHeroAd).mockReturnValue({
      ad: undefined,
      placement: 'none',
      shape: feedHeroShape(1),
    });
    // The cards and the headlines are separate lists, so the lead card need
    // not be the first headline.
    mockHero({ posts: [posts[1]], highlights });

    renderComponent();

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Second hero post' }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText('First headline')).toBeInTheDocument();
    expect(screen.queryByText('Second headline')).not.toBeInTheDocument();
    expect(screen.getByText('Third headline')).toBeInTheDocument();
  });

  it('should render nothing when the query returns no posts', async () => {
    mockHero({ posts: [], highlights: [] });

    const { container } = renderComponent();

    await waitFor(() => expect(nock.isDone()).toBe(true));
    expect(container).toBeEmptyDOMElement();
  });
});
