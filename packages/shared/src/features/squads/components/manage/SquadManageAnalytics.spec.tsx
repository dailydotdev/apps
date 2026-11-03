import React from 'react';
import nock from 'nock';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import defaultUser from '../../../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../../__tests__/helpers/graphql';
import { defaultQueryClientTestingConfig } from '../../../../../__tests__/helpers/tanstack-query';
import { mockDesktop } from '../../../../../__tests__/helpers/media';
import type { Squad } from '../../../../graphql/sources';
import { SourcePermissions } from '../../../../graphql/sources';
import { SQUAD_ANALYTICS_QUERY } from '../../../../graphql/squads';
import {
  CreatorMetricSemantics,
  CreatorPerformancePeriod,
  CreatorPostSortBy,
  CreatorPostSortOrder,
  SQUAD_PERFORMANCE_QUERY,
  SQUAD_POST_PERFORMANCE_QUERY,
  creatorPostPerformancePageSize,
} from '../../../../graphql/creatorAnalytics';
import { SquadPageContextProvider } from '../../SquadPageContext';
import { SquadManageAnalytics } from './SquadManageAnalytics';

const squad = {
  id: 'squad1',
  handle: 'squad1',
  name: 'Squad one',
  currentMember: { permissions: [SourcePermissions.ViewAnalytics] },
} as unknown as Squad;

const metric = (value: number) => ({
  value,
  previous: null,
  semantics: CreatorMetricSemantics.Period,
});

const mockPerformance = (period: CreatorPerformancePeriod, value: number) =>
  mockGraphQL({
    request: {
      query: SQUAD_PERFORMANCE_QUERY,
      variables: { sourceId: squad.id, period },
    },
    result: {
      data: {
        squadPerformance: {
          period,
          coverage: {
            requestedStartDate: '2026-10-04',
            endDate: '2026-11-02',
            coveredStartDate: '2026-10-04',
            firstAvailableDate: '2026-01-01',
            lastAvailableDate: '2026-11-02',
            requestedDays: 30,
            coveredDays: 30,
            isComplete: true,
            isPreviousPeriodComplete: true,
          },
          updatedAt: null,
          impressions: metric(value),
          outboundVisits: {
            ...metric(0),
            semantics: CreatorMetricSemantics.Lifetime,
          },
          upvotes: metric(7),
          comments: metric(3),
          impressionsSeries: [],
        },
      },
    },
  });

const mockPosts = (period: CreatorPerformancePeriod) =>
  mockGraphQL({
    request: {
      query: SQUAD_POST_PERFORMANCE_QUERY,
      variables: {
        sourceId: squad.id,
        after: '',
        first: creatorPostPerformancePageSize,
        period,
        sortBy: CreatorPostSortBy.PublishedAt,
        order: CreatorPostSortOrder.Desc,
      },
    },
    result: {
      data: {
        squadPostPerformance: {
          pageInfo: { hasNextPage: false, endCursor: null },
          edges: [
            {
              cursor: 'c1',
              node: {
                id: 'p1',
                impressions: 120,
                upvotes: 4,
                comments: 1,
                outboundVisits: 2,
                post: {
                  id: 'p1',
                  title: 'A member post',
                  image: null,
                  sharedPost: null,
                  createdAt: '2026-10-20T00:00:00.000Z',
                  commentsPermalink: 'https://app.daily.dev/posts/p1',
                },
              },
            },
          ],
        },
      },
    },
  });

const renderPage = () =>
  render(
    <TestBootProvider
      client={new QueryClient(defaultQueryClientTestingConfig)}
      auth={{ user: defaultUser }}
    >
      <SquadPageContextProvider squad={squad} isViewerReady>
        <SquadManageAnalytics />
      </SquadPageContextProvider>
    </TestBootProvider>,
  );

beforeEach(() => {
  nock.cleanAll();
  mockDesktop();
  mockGraphQL({
    request: {
      query: SQUAD_ANALYTICS_QUERY,
      variables: { sourceId: squad.id },
    },
    result: {
      data: {
        squadAnalytics: {
          id: squad.id,
          impressions: 5000,
          reach: 900,
          upvotes: 40,
          downvotes: 2,
          comments: 12,
          bookmarks: 6,
          awards: 1,
          shares: 3,
          clicks: 77,
          upvotesRatio: 95,
        },
      },
    },
  });
});

it('should render the period overview, the post table and the lifetime block', async () => {
  mockPerformance(CreatorPerformancePeriod.Last30Days, 150);
  mockPosts(CreatorPerformancePeriod.Last30Days);

  renderPage();

  expect(await screen.findByText('150')).toBeInTheDocument();
  expect(
    (await screen.findByText('A member post')).closest('a'),
  ).toHaveAttribute('href', '/posts/p1');
  expect(screen.getByText('All time')).toBeInTheDocument();
  expect(screen.getByText('77')).toBeInTheDocument();
  expect(screen.queryByText('Clicks')).not.toBeInTheDocument();
  expect(screen.queryByText('Followers')).not.toBeInTheDocument();
});

it('should refetch the overview and posts for the selected period', async () => {
  mockPerformance(CreatorPerformancePeriod.Last30Days, 150);
  mockPosts(CreatorPerformancePeriod.Last30Days);
  renderPage();
  await screen.findByText('150');

  mockPerformance(CreatorPerformancePeriod.Last90Days, 900);
  mockPosts(CreatorPerformancePeriod.Last90Days);
  fireEvent.keyDown(
    screen.getByRole('button', { name: /Period: Last 30 days/ }),
    { key: 'Enter' },
  );
  fireEvent.click(
    await screen.findByRole('menuitem', { name: 'Last 90 days' }),
  );

  expect(await screen.findByText('900')).toBeInTheDocument();
});
