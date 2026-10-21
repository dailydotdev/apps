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
import { clearHeldFeedHeroLeads, useFeedHeroData } from './useFeedHeroData';

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
  clearHeldFeedHeroLeads();
});

it('should start from the last payload and keep its lead for the session', async () => {
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
  await waitFor(() => expect(result.current.posts[0]?.id).toEqual('fresh'));
  expect(result.current.leadPost?.id).toEqual('cached');
  // The next load starts from what this one fetched.
  expect(JSON.parse(storageWrapper.getItem(cacheKey) ?? '{}')).toMatchObject({
    data: { feedHero: { posts: [{ id: 'fresh' }] } },
  });
});

it('should hold the first lead it fetched when nothing was cached', async () => {
  mockHero([post('first')]);

  const { result } = renderData();

  await waitFor(() => expect(result.current.leadPost?.id).toEqual('first'));
});
