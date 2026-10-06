import React from 'react';
import nock from 'nock';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { defaultQueryClientTestingConfig } from '@dailydotdev/shared/__tests__/helpers/tanstack-query';
import {
  CREATOR_PERFORMANCE_QUERY,
  CREATOR_POST_PERFORMANCE_QUERY,
  CreatorMetricSemantics,
  CreatorPerformancePeriod,
  CreatorPostSortBy,
  CreatorPostSortOrder,
  creatorPostPerformancePageSize,
} from '@dailydotdev/shared/src/graphql/creatorAnalytics';
import { USER_POSTS_ANALYTICS_QUERY } from '@dailydotdev/shared/src/graphql/users';
import Analytics from '../pages/analytics';

const metric = {
  value: 0,
  previous: null,
  semantics: CreatorMetricSemantics.Period,
};

const renderPage = () =>
  render(
    <TestBootProvider
      client={new QueryClient(defaultQueryClientTestingConfig)}
      auth={{ user: defaultUser }}
    >
      <Analytics />
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  nock.cleanAll();
});

it('should render shared post title and cover from the analytics response', async () => {
  mockGraphQL({
    request: {
      query: CREATOR_PERFORMANCE_QUERY,
      variables: { period: CreatorPerformancePeriod.Last30Days },
    },
    result: {
      data: {
        creatorPerformance: {
          period: CreatorPerformancePeriod.Last30Days,
          coverage: {
            requestedStartDate: '2026-08-23',
            endDate: '2026-09-21',
            coveredStartDate: null,
            firstAvailableDate: null,
            lastAvailableDate: null,
            requestedDays: 30,
            coveredDays: 0,
            isComplete: false,
            isPreviousPeriodComplete: false,
          },
          updatedAt: null,
          impressions: metric,
          outboundVisits: {
            ...metric,
            semantics: CreatorMetricSemantics.Lifetime,
          },
          upvotes: metric,
          comments: metric,
          impressionsSeries: [],
        },
      },
    },
  });
  mockGraphQL({
    request: {
      query: USER_POSTS_ANALYTICS_QUERY,
    },
    result: {
      data: {
        userPostsAnalytics: {
          id: defaultUser.id,
          impressions: 0,
          reach: 0,
          upvotes: 0,
          comments: 0,
          bookmarks: 0,
          awards: 0,
          profileViews: 0,
          followers: 0,
          reputation: 0,
          coresEarned: 0,
          shares: 0,
          clicks: 0,
          upvotesRatio: 0,
        },
      },
    },
  });
  mockGraphQL({
    request: {
      query: CREATOR_POST_PERFORMANCE_QUERY,
      variables: {
        after: '',
        first: creatorPostPerformancePageSize,
        period: CreatorPerformancePeriod.Last30Days,
        sortBy: CreatorPostSortBy.PublishedAt,
        order: CreatorPostSortOrder.Desc,
      },
    },
    result: {
      data: {
        creatorPostPerformance: {
          pageInfo: {
            hasNextPage: false,
            endCursor: null,
          },
          edges: [
            {
              cursor: 'cursor-article',
              node: {
                id: 'article1',
                impressions: 100,
                upvotes: 10,
                comments: 2,
                outboundVisits: 5,
                post: {
                  id: 'article1',
                  title: 'Direct article title',
                  image: 'https://daily.dev/direct-cover.jpg',
                  sharedPost: null,
                  createdAt: '2026-09-01T00:00:00.000Z',
                  commentsPermalink: 'https://app.daily.dev/posts/article1',
                },
              },
            },
            {
              cursor: 'cursor-share',
              node: {
                id: 'share1',
                impressions: 50,
                upvotes: 4,
                comments: 1,
                outboundVisits: 3,
                post: {
                  id: 'share1',
                  title: null,
                  image: 'https://daily.dev/generated-placeholder.jpg',
                  sharedPost: {
                    id: 'original1',
                    title: 'Shared article title',
                    image: 'https://daily.dev/shared-cover.jpg',
                  },
                  createdAt: '2026-09-02T00:00:00.000Z',
                  commentsPermalink: 'https://app.daily.dev/posts/share1',
                },
              },
            },
          ],
        },
      },
    },
  });

  renderPage();

  const shareLink = (await screen.findByText('Shared article title')).closest(
    'a',
  );

  expect(screen.getByText('Direct article title')).toBeInTheDocument();
  expect(screen.queryByText('Untitled')).not.toBeInTheDocument();
  expect(shareLink).toHaveAttribute('href', '/posts/share1/analytics');
  expect(shareLink?.querySelector('img')).toHaveAttribute(
    'src',
    'https://daily.dev/shared-cover.jpg',
  );
});
