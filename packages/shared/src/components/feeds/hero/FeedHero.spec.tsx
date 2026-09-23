import React from 'react';
import nock from 'nock';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import basePost from '../../../../__tests__/fixture/post';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import {
  completeActionMock,
  mockGraphQL,
} from '../../../../__tests__/helpers/graphql';
import { waitForNock } from '../../../../__tests__/helpers/utilities';
import { ActionType } from '../../../graphql/actions';
import { ADD_BOOKMARKS_MUTATION, UserVote } from '../../../graphql/posts';
import { VOTE_MUTATION } from '../../../graphql/users';
import { UserVoteEntity } from '../../../hooks/vote/types';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import type { FeedHeroData } from '../../../graphql/feed';
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

const mockHero = (
  data: {
    posts: typeof posts;
    highlights: typeof highlights;
  },
  loggedIn = false,
) =>
  mockGraphQL({
    request: {
      query: FEED_HERO_QUERY,
      variables: {
        loggedIn,
        supportedTypes: supportedTypesForPrivateSources,
      },
    },
    result: { data: { feedHero: data } },
  });

const renderComponent = (
  client = new QueryClient(),
  user?: typeof loggedUser,
) =>
  render(
    <TestBootProvider client={client} auth={{ user }}>
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

  it('should open the post modal when a card is clicked', async () => {
    const push = jest.fn().mockResolvedValue(true);
    jest.mocked(useRouter).mockImplementation(
      () =>
        ({
          pathname: '/',
          asPath: '/',
          query: {},
          push,
        } as unknown as NextRouter),
    );
    mockHero({ posts, highlights });

    renderComponent();

    fireEvent.click(
      await screen.findByRole('link', { name: 'First hero post' }),
    );

    await waitFor(() => expect(push).toHaveBeenCalled());
    const [pathname, as] = push.mock.calls[0];
    expect(pathname).toContain('pmid=hero-post-0');
    expect(pathname).toContain('pmcid=popular-hero');
    expect(as).toContain('posts/hero-post-0');
  });

  it('should render nothing when the query returns no posts', async () => {
    mockHero({ posts: [], highlights: [] });

    const { container } = renderComponent();

    await waitFor(() => expect(nock.isDone()).toBe(true));
    expect(container).toBeEmptyDOMElement();
  });

  // The bare vote and bookmark hooks only write the single-post cache key,
  // which the hero never reads, so a click used to succeed on the server and
  // change nothing on screen. These pin that the hero patches its own query.
  describe('engagement on its own cards', () => {
    const [lead] = posts;
    const heroPost = { ...lead, numUpvotes: 5, bookmarked: false };

    it('should press the upvote and bump the count on the hero itself', async () => {
      const client = new QueryClient();
      mockHero({ posts: [heroPost], highlights }, true);
      mockGraphQL({
        request: {
          query: VOTE_MUTATION,
          variables: {
            id: heroPost.id,
            vote: UserVote.Up,
            entity: UserVoteEntity.Post,
          },
        },
        result: { data: { _: true } },
      });
      mockGraphQL(completeActionMock({ action: ActionType.VotePost }));

      renderComponent(client, loggedUser);

      const [upvote] = await screen.findAllByLabelText('Upvote');
      fireEvent.click(upvote);

      await waitFor(() =>
        expect(upvote).toHaveAttribute('aria-pressed', 'true'),
      );
      await waitForNock();

      const cached = client.getQueryData<FeedHeroData>(
        generateQueryKey(RequestKey.FeedHero, loggedUser),
      );
      expect(cached?.feedHero.posts[0]).toMatchObject({
        numUpvotes: 6,
        userState: { vote: UserVote.Up },
      });
    });

    it('should press the bookmark on the hero itself', async () => {
      const client = new QueryClient();
      mockHero({ posts: [heroPost], highlights }, true);
      mockGraphQL({
        request: {
          query: ADD_BOOKMARKS_MUTATION,
          variables: { data: { postIds: [heroPost.id] } },
        },
        result: { data: { _: true } },
      });
      mockGraphQL(completeActionMock({ action: ActionType.BookmarkPost }));

      renderComponent(client, loggedUser);

      const [bookmark] = await screen.findAllByLabelText('Bookmark');
      fireEvent.click(bookmark);

      await waitFor(() =>
        expect(bookmark).toHaveAttribute('aria-pressed', 'true'),
      );
      await waitForNock();

      const cached = client.getQueryData<FeedHeroData>(
        generateQueryKey(RequestKey.FeedHero, loggedUser),
      );
      expect(cached?.feedHero.posts[0].bookmarked).toBe(true);
    });
  });
});
