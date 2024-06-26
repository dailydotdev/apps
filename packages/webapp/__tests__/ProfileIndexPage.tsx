import React from 'react';
import { render, RenderResult, screen } from '@testing-library/react';
import { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import nock from 'nock';
import {
  USER_READING_HISTORY_QUERY,
  UserReadingRankHistory,
  MostReadTag,
  ProfileReadingData,
} from '@dailydotdev/shared/src/graphql/users';
import { QueryClient } from '@tanstack/react-query';
import { startOfTomorrow, subDays, subYears } from 'date-fns';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '@dailydotdev/shared/__tests__/helpers/graphql';
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
const after = subYears(subDays(before, 2), 1);

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

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createReadingHistoryMock()],
  profile: Partial<PublicProfile> = {},
): RenderResult => {
  const client = new QueryClient();

  mocks.forEach(mockGraphQL);
  return render(
    <TestBootProvider client={client} auth={{ user: null }}>
      <ProfilePage user={{ ...defaultProfile, ...profile }} noindex />
    </TestBootProvider>,
  );
};

it('should show the top reading tags of the user', async () => {
  renderComponent();
  await waitForNock();
  await screen.findByText('Top tags by reading days');
  await Promise.all(
    defaultTopTags.map(({ value: tag }) => screen.findByText(`#${tag}`)),
  );
});

it('should show the readme of the user', async () => {
  renderComponent();
  await waitForNock();
  expect(await screen.findByText('This is my readme')).toBeInTheDocument();
});
