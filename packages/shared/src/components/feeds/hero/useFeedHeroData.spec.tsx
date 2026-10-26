import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import nock from 'nock';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import basePost from '../../../../__tests__/fixture/post';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import { FEED_HERO_QUERY, baseFeedSupportedTypes } from '../../../graphql/feed';
import { storageWrapper } from '../../../lib/storageWrapper';
import { generateStorageKey, StorageTopic } from '../../../lib/storage';
import { clearShownFeedHeroLeads, useFeedHeroData } from './useFeedHeroData';

const post = (id: string) => ({ ...basePost, id, title: id });

const mockHero = (posts: ReturnType<typeof post>[]) =>
  mockGraphQL({
    request: {
      query: FEED_HERO_QUERY,
      variables: { loggedIn: false, supportedTypes: baseFeedSupportedTypes },
    },
    result: { data: { feedHero: { posts, highlights: [] } } },
  });

const cacheKey = generateStorageKey(StorageTopic.Post, 'feedHero', 'anonymous');

const renderData = (client = new QueryClient()) =>
  renderHook(() => useFeedHeroData(), {
    wrapper: ({ children }: { children: ReactNode }): ReactElement => (
      <TestBootProvider client={client}>{children}</TestBootProvider>
    ),
  });

beforeEach(() => {
  nock.cleanAll();
  clearShownFeedHeroLeads();
});

it('should start from the last payload and follow the fresh lead', async () => {
  storageWrapper.setItem(
    cacheKey,
    JSON.stringify({
      data: { feedHero: { posts: [post('cached')], highlights: [] } },
      savedAt: 0,
    }),
  );
  mockHero([post('fresh')]);

  const { result } = renderData();

  expect(result.current.leadPost?.id).toEqual('cached');
  // Painted from a stale copy, so no impression counts until the refetch.
  expect(result.current.isLeadFresh).toBe(false);
  await waitFor(() => expect(result.current.leadPost?.id).toEqual('fresh'));
  // The grid keeps out the lead it rotated away from, too.
  expect(result.current.shownLeadIds).toEqual(['cached', 'fresh']);
  expect(result.current.isLeadFresh).toBe(true);
  // The next load starts from what this one fetched.
  expect(JSON.parse(storageWrapper.getItem(cacheKey) ?? '{}')).toMatchObject({
    data: { feedHero: { posts: [{ id: 'fresh' }] } },
  });
});

it('should lead with the first post it fetched when nothing was cached', async () => {
  mockHero([post('first')]);

  const { result } = renderData();

  await waitFor(() => expect(result.current.leadPost?.id).toEqual('first'));
});

it('should draw the lead from any of the posts', async () => {
  const random = jest.spyOn(Math, 'random').mockReturnValue(0.7);
  mockHero([post('first'), post('second'), post('third')]);

  const { result } = renderData();

  await waitFor(() => expect(result.current.leadPost?.id).toEqual('third'));
  random.mockRestore();
});

it('should keep the drawn lead while the refetch still has it', async () => {
  const random = jest.spyOn(Math, 'random').mockReturnValue(0.5);
  storageWrapper.setItem(
    cacheKey,
    JSON.stringify({
      data: { feedHero: { posts: [post('a'), post('b')], highlights: [] } },
      savedAt: 0,
    }),
  );
  mockHero([post('c'), post('b'), post('d')]);

  const { result } = renderData();

  expect(result.current.leadPost?.id).toEqual('b');
  random.mockReturnValue(0);
  await waitFor(() => expect(result.current.isLeadFresh).toBe(true));
  expect(result.current.leadPost?.id).toEqual('b');
  expect(result.current.shownLeadIds).toEqual(['b']);
  random.mockRestore();
});
