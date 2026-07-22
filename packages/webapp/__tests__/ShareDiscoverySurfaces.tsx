import type { FeedData } from '@dailydotdev/shared/src/graphql/posts';
import {
  ANONYMOUS_FEED_QUERY,
  RankingAlgorithm,
} from '@dailydotdev/shared/src/graphql/feed';
import nock from 'nock';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import ad from '@dailydotdev/shared/__tests__/fixture/ad';
import defaultFeedPage from '@dailydotdev/shared/__tests__/fixture/feed';
import type { MockedGraphQLResponse } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import Popular from '../pages/popular';

// The share_discovery control must only render on the Explore (discovery)
// surfaces — its component-level coverage lives in the shared
// FeedExploreHeader/Archive specs. This guards the composition: a non-explore
// feed page must not grow the control even with the gate forced fully on.
jest.mock('@dailydotdev/shared/src/hooks/useShareDiscovery', () => ({
  useShareDiscovery: () => ({ isEnabled: true }),
}));

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  nock.cleanAll();
  jest.mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/popular',
        query: {},
        replace: jest.fn(),
        push: jest.fn(),
      } as unknown as NextRouter),
  );
});

const createFeedMock = (): MockedGraphQLResponse<FeedData> => ({
  request: {
    query: ANONYMOUS_FEED_QUERY,
    variables: {
      first: 7,
      after: '',
      loggedIn: false,
      version: 15,
      ranking: RankingAlgorithm.Popularity,
      columns: 1,
    },
  },
  result: {
    data: {
      page: defaultFeedPage,
    },
  },
});

it('does not render the copy-link control on non-explore feed pages with flags on', async () => {
  const client = new QueryClient();
  mockGraphQL(createFeedMock());
  nock('http://localhost:3000').get('/v1/a').reply(200, [ad]);

  render(
    <TestBootProvider client={client} auth={{ user: undefined }}>
      {Popular.getLayout(<Popular />, {}, Popular.layoutProps)}
    </TestBootProvider>,
  );

  const elements = await screen.findAllByTestId('postItem');
  expect(elements.length).toBeTruthy();
  expect(screen.queryByLabelText('Share this feed')).not.toBeInTheDocument();
});
