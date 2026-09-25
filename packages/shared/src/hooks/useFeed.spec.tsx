import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import nock from 'nock';
import useFeed from './useFeed';
import type { AuthContextData } from '../contexts/AuthContext';
import { TestBootProvider } from '../../__tests__/helpers/boot';
import defaultUser from '../../__tests__/fixture/loggedUser';
import defaultFeedPage from '../../__tests__/fixture/feed';
import { CUSTOM_FEED_QUERY } from '../graphql/feed';
import { ApiError } from '../graphql/common';
import { SharedFeedPage } from '../components/utilities';
import { FeedItemType } from '../components/cards/common/common';

const mockCustomFeedResponse = (result: Record<string, unknown>) =>
  nock('http://localhost:3000')
    .post('/graphql', ({ query }) => query === CUSTOM_FEED_QUERY)
    .reply(200, result);

it('should refetch a feed rejected as unauthenticated once boot refreshes the token', async () => {
  const client = new QueryClient();
  let auth: Partial<AuthContextData> = {
    user: defaultUser,
    tokenRefreshed: false,
    isTokenValid: true,
  };
  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <TestBootProvider client={client} auth={auth}>
      {children}
    </TestBootProvider>
  );
  mockCustomFeedResponse({
    errors: [
      {
        message: 'Unauthenticated',
        extensions: { code: ApiError.Unauthenticated },
      },
    ],
  });

  // A custom feed for a non-Plus user never retries on its own
  const { result, rerender } = renderHook(
    () =>
      useFeed(['custom', defaultUser.id, 'cf1'], 7, { adStart: 1 }, 1, {
        query: CUSTOM_FEED_QUERY,
        variables: { feedId: 'cf1' },
        settings: { feedName: SharedFeedPage.Custom, disableAds: true },
      }),
    { wrapper },
  );
  await waitFor(() => expect(result.current.error).toBeTruthy());

  mockCustomFeedResponse({ data: { page: defaultFeedPage } });
  auth = { ...auth, tokenRefreshed: true };
  rerender();

  await waitFor(() =>
    expect(
      result.current.items.some(({ type }) => type === FeedItemType.Post),
    ).toBe(true),
  );
});
