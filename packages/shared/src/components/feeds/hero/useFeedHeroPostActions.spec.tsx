import React from 'react';
import type { ReactNode } from 'react';
import nock from 'nock';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import basePost from '../../../../__tests__/fixture/post';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import {
  completeActionMock,
  mockGraphQL,
} from '../../../../__tests__/helpers/graphql';
import { waitForNock } from '../../../../__tests__/helpers/utilities';
import { ActionType } from '../../../graphql/actions';
import type { FeedHeroData } from '../../../graphql/feed';
import { ADD_BOOKMARKS_MUTATION, UserVote } from '../../../graphql/posts';
import { VOTE_MUTATION } from '../../../graphql/users';
import { UserVoteEntity } from '../../../hooks/vote/types';
import { Origin } from '../../../lib/log';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { useFeedHeroPostActions } from './useFeedHeroPostActions';

const first = { ...basePost, id: 'hero-a', numUpvotes: 5, bookmarked: false };
const second = { ...basePost, id: 'hero-b', numUpvotes: 2, bookmarked: false };

const queryKey = generateQueryKey(RequestKey.FeedHero, loggedUser);

const seed = (): QueryClient => {
  const client = new QueryClient();
  client.setQueryData<FeedHeroData>(queryKey, {
    feedHero: { posts: [first, second], highlights: [] },
  });
  return client;
};

const heroPosts = (client: QueryClient) =>
  client.getQueryData<FeedHeroData>(queryKey)!.feedHero.posts;

const renderActions = (client: QueryClient) =>
  renderHook(
    () =>
      useFeedHeroPostActions({
        queryKey,
        feedName: 'popular',
        origin: Origin.FeedHero,
      }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <TestBootProvider client={client} auth={{ user: loggedUser }}>
          {children}
        </TestBootProvider>
      ),
    },
  );

beforeEach(() => {
  nock.cleanAll();
});

describe('useFeedHeroPostActions', () => {
  it('patches the hero query optimistically on upvote', async () => {
    const client = seed();
    mockGraphQL({
      request: {
        query: VOTE_MUTATION,
        variables: {
          id: first.id,
          vote: UserVote.Up,
          entity: UserVoteEntity.Post,
        },
      },
      result: { data: { _: true } },
    });
    mockGraphQL(completeActionMock({ action: ActionType.VotePost }));

    const { result } = renderActions(client);

    await act(async () => {
      await result.current.toggleUpvote({
        payload: first,
        origin: Origin.FeedHero,
      });
    });
    await waitForNock();

    expect(heroPosts(client)[0]).toMatchObject({
      numUpvotes: 6,
      userState: { vote: UserVote.Up },
    });
  });

  // A failed upvote must roll back only its own fields on its own post. A
  // whole-snapshot rollback would also undo a bookmark that landed on another
  // card while the upvote was still in flight.
  it('rolls back a failed upvote without undoing a bookmark on another card', async () => {
    const client = seed();
    mockGraphQL({
      request: {
        query: VOTE_MUTATION,
        variables: {
          id: first.id,
          vote: UserVote.Up,
          entity: UserVoteEntity.Post,
        },
      },
      result: { errors: [{ message: 'nope' }] },
    });
    mockGraphQL(completeActionMock({ action: ActionType.VotePost }));
    mockGraphQL({
      request: {
        query: ADD_BOOKMARKS_MUTATION,
        variables: { data: { postIds: [second.id] } },
      },
      result: { data: { _: true } },
    });
    mockGraphQL(completeActionMock({ action: ActionType.BookmarkPost }));

    const { result } = renderActions(client);

    await act(async () => {
      const upvote = result.current
        .toggleUpvote({ payload: first, origin: Origin.FeedHero })
        .catch(() => undefined);
      await result.current.toggleBookmark({
        post: second,
        origin: Origin.FeedHero,
      });
      await upvote;
    });
    await waitForNock();

    await waitFor(() => expect(heroPosts(client)[0].numUpvotes).toBe(5));
    expect(heroPosts(client)[0].userState?.vote).not.toBe(UserVote.Up);
    expect(heroPosts(client)[1].bookmarked).toBe(true);
  });
});
