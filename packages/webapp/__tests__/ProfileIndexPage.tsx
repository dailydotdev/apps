import React from 'react';
import { render, RenderResult, screen } from '@testing-library/react';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import nock from 'nock';
import {
  USER_READING_HISTORY_QUERY,
  UserReadingRankHistory,
  MostReadTag,
  ProfileReadingData,
} from '@dailydotdev/shared/src/graphql/users';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RANKS } from '@dailydotdev/shared/src/lib/rank';
import { startOfTomorrow, subDays, subMonths } from 'date-fns';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import ProfilePage from '../pages/[userId]/index';

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
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
const after = subMonths(subDays(before, 2), 6);

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
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user: null,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          getRedirectUri: jest.fn(),
          closeLogin: jest.fn(),
        }}
      >
        <ProfilePage user={{ ...defaultProfile, ...profile }} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should show the reading rank history of the user', async () => {
  renderComponent();
  await waitForNock();
  const counts = [0, 5, 0, 0, 3];
  await Promise.all(
    counts.map(async (count, index) => {
      const el = await screen.findByLabelText(`${RANKS[index].name}: ${count}`);
      expect(el).toBeInTheDocument();
    }),
  );
});

it('should show the top reading tags of the user', async () => {
  renderComponent();
  await waitForNock();
  await Promise.all(
    defaultTopTags.map(async ({ value: tag }) => {
      const el = await screen.findByText(`#${tag}`);
      expect(el).toBeInTheDocument();
    }),
  );
});

it('should show the readme of the user', async () => {
  renderComponent();
  await waitForNock();
  expect(await screen.findByText('This is my readme')).toBeInTheDocument();
});
