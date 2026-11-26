import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { subDays } from 'date-fns';
import { set as setCache } from 'idb-keyval';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import {
  REPUTATION_EVENTS_QUERY,
  ReputationEventFilter,
  reputationEventsPageSize,
  ReputationReason,
} from '../../graphql/reputation';
import { SidebarProfileStats } from './SidebarProfileStats';

jest.mock('idb-keyval', () => {
  const store = new Map();
  return {
    get: jest.fn((key) => Promise.resolve(store.get(key))),
    set: jest.fn((key, value) => {
      store.set(key, value);
      return Promise.resolve();
    }),
  };
});

const user = { ...loggedUser, reputation: 60 };

const gain = (id: string, amount: number, createdAt: Date) => ({
  node: {
    id,
    reason: ReputationReason.CommentUpvoted,
    amount,
    createdAt: createdAt.toISOString(),
    target: null,
  },
});

const renderStats = () =>
  render(
    <TestBootProvider client={new QueryClient()} auth={{ user }}>
      <SidebarProfileStats />
    </TestBootProvider>,
  );

it('shows the last week of gains before anything was seen here', async () => {
  mockGraphQL({
    request: {
      query: REPUTATION_EVENTS_QUERY,
      variables: {
        first: reputationEventsPageSize,
        filter: ReputationEventFilter.Gains,
      },
    },
    result: {
      data: {
        reputationEvents: {
          pageInfo: { hasNextPage: false, endCursor: null },
          edges: [
            gain('e1', 50, new Date()),
            gain('e2', 10, subDays(new Date(), 30)),
          ],
        },
      },
    },
  });
  renderStats();

  expect(await screen.findByText('+50')).toBeInTheDocument();
});

it('shows what came since the count last seen here', async () => {
  await setCache(`seen_reputation_${user.id}`, 10);
  renderStats();

  expect(await screen.findByText('+50')).toBeInTheDocument();
});

it('saves the current count right away, not when the menu closes', async () => {
  await setCache(`seen_reputation_${user.id}`, 10);
  renderStats();

  await screen.findByText('+50');
  expect(setCache).toHaveBeenLastCalledWith(`seen_reputation_${user.id}`, 60);
});
