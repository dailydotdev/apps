import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import nock from 'nock';
import type {
  UserReadingRankHistory,
  MostReadTag,
  ProfileReadingData,
} from '@dailydotdev/shared/src/graphql/users';
import { USER_READING_HISTORY_QUERY } from '@dailydotdev/shared/src/graphql/users';
import { QueryClient } from '@tanstack/react-query';
import { startOfTomorrow, subDays, subMonths } from 'date-fns';
import type { MockedGraphQLResponse } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import * as hooks from '@dailydotdev/shared/src/hooks/useViewSize';
import ProfilePage from '../pages/[userId]/index';

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
  jest.spyOn(hooks, 'useViewSize').mockImplementation(() => true);
});

const defaultTopTags: MostReadTag[] = [
  {
    value: 'javascript',
    count: 4,
    percentage: 0.4,
  },
  {
    value: 'golang',
    count: 3,
    percentage: 0.3,
  },
  {
    value: 'c#',
    count: 3,
    percentage: 0.3,
  },
];

const before = startOfTomorrow();
const after = subMonths(subDays(before, 2), 5);

const createReadingHistoryMock = (
  rankHistory: UserReadingRankHistory[] = [
    { rank: 2, count: 5 },
    { rank: 5, count: 3 },
  ],
): MockedGraphQLResponse<ProfileReadingData> => ({
  request: {
    query: USER_READING_HISTORY_QUERY,
    variables: {
      id: 'u2',
      before: before.toISOString(),
      after: after.toISOString(),
      version: 2,
      limit: 6,
    },
  },
  result: {
    data: {
      userReadingRankHistory: rankHistory,
      userReadHistory: [{ date: '2021-02-01', reads: 2 }],
      userMostReadTags: defaultTopTags,
      userStreakProfile: null,
    },
  },
});

const defaultProfile: PublicProfile = {
  id: 'u2',
  name: 'Daily Dev',
  username: 'dailydotdev',
  premium: false,
  reputation: 20,
  image: 'https://daily.dev/daily.png',
  cover: 'https://daily.dev/cover.png',
  bio: 'The best company!',
  createdAt: '2020-08-26T13:04:35.000Z',
  twitter: 'dailydotdev',
  github: 'dailydotdev',
  hashnode: 'dailydotdev',
  portfolio: 'https://daily.dev/?key=vaue',
  permalink: 'https://daily.dev/dailydotdev',
  readmeHtml: 'This is my readme',
};

const defaultUserStats = {
  upvotes: 150,
  views: 5000,
  numFollowers: 42,
  numFollowing: 38,
  reputation: 20,
};

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createReadingHistoryMock()],
  profile: Partial<PublicProfile> = {},
): RenderResult => {
  const client = new QueryClient();

  mocks.forEach(mockGraphQL);
  return render(
    <TestBootProvider client={client} auth={{ user: null }}>
      <ProfilePage
        user={{ ...defaultProfile, ...profile }}
        userStats={defaultUserStats}
        noindex
      />
    </TestBootProvider>,
  );
};

it('should show the top reading tags of the user', async () => {
  renderComponent();
  await waitForNock();
  await screen.findByText('Top tags by reading days');
  // Tags are rendered capitalized without the # prefix
  await screen.findByText('Javascript');
  await screen.findByText('Golang');
  await screen.findByText('C#');
});

it('should show the about me section with readme of the user', async () => {
  renderComponent();
  await waitForNock();
  const aboutMeHeadings = await screen.findAllByText('About me');
  expect(aboutMeHeadings.length).toBeGreaterThan(0);
  const readmeContent = await screen.findAllByText('This is my readme');
  expect(readmeContent.length).toBeGreaterThan(0);
});

it('should show social links in about me section', async () => {
  renderComponent();
  await waitForNock();
  const twitterLinks = await screen.findAllByTestId('social-link-twitter');
  expect(twitterLinks.length).toBeGreaterThan(0);
  expect(twitterLinks[0]).toHaveAttribute('href', 'https://x.com/dailydotdev');
  const githubLinks = await screen.findAllByTestId('social-link-github');
  expect(githubLinks.length).toBeGreaterThan(0);
  expect(githubLinks[0]).toHaveAttribute('href', 'https://github.com/dailydotdev');
});
