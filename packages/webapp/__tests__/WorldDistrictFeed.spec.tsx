import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import type { MockedGraphQLResponse } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import defaultFeedPage from '@dailydotdev/shared/__tests__/fixture/feed';
import type { Connection } from '@dailydotdev/shared/src/graphql/common';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { UserWorldDistrictFeedData } from '../graphql/world';
import { USER_WORLD_DISTRICT_FEED_QUERY } from '../graphql/world';
import { WorldDistrictFeed } from '../components/world/WorldDistrictFeed';
import type { WorldSelectedDistrict } from '../components/world/worldState';

const district: WorldSelectedDistrict = {
  slug: 'rust',
  name: 'Rust',
  color: '#CE3F4B',
};

const feedMock = (
  page: Connection<Post> = defaultFeedPage,
  variables: Record<string, unknown> = {},
): MockedGraphQLResponse<UserWorldDistrictFeedData> => ({
  request: {
    query: USER_WORLD_DISTRICT_FEED_QUERY,
    variables: {
      id: 'u1',
      niches: ['rust'],
      first: 20,
      after: '',
      ...variables,
    },
  },
  result: { data: { page } },
});

const onClose = jest.fn();

const renderFeed = (
  mocks: MockedGraphQLResponse[] = [feedMock()],
  isOwn = false,
) => {
  mocks.forEach(mockGraphQL);

  return render(
    <TestBootProvider client={new QueryClient()} auth={{ user: defaultUser }}>
      <WorldDistrictFeed
        userId="u1"
        userName="Ida"
        isOwn={isOwn}
        district={district}
        onClose={onClose}
      />
    </TestBootProvider>,
  );
};

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

/* One heading carrying both facts, because the panel has room for one: whose
   upvotes these are, and which district they belong to. */
it('should title the panel with whose upvotes and which district', async () => {
  renderFeed();

  expect(
    await screen.findByRole('heading', { name: "Ida's upvotes in Rust" }),
  ).toBeInTheDocument();
});

it('should address the owner directly on their own world', async () => {
  renderFeed([feedMock()], true);

  expect(
    await screen.findByRole('heading', { name: 'Your upvotes in Rust' }),
  ).toBeInTheDocument();
});

/* The whole point of the panel: the same upvote feed the profile shows, scoped
   to the one niche the district stands for. A request without `niches` is the
   reader's entire upvote history under a district's name. */
it('should ask for the upvotes of that niche only', async () => {
  renderFeed();
  await waitForNock();

  expect(
    await screen.findByText(defaultFeedPage.edges[0].node.title ?? ''),
  ).toBeInTheDocument();
});

/* A district is built by READING, so a town can stand tall with nothing voted
   in it. That is not an error and must not read as one. */
it('should explain an empty district rather than showing nothing', async () => {
  renderFeed([
    feedMock({ pageInfo: { hasNextPage: false, endCursor: '' }, edges: [] }),
  ]);
  await waitForNock();

  expect(
    await screen.findByText(/Nothing upvoted in Rust yet/),
  ).toBeInTheDocument();
});

it('should hand closing back to the caller, which clears the selection', async () => {
  renderFeed();

  fireEvent.click(await screen.findByLabelText('Close district'));

  expect(onClose).toHaveBeenCalledTimes(1);
});
