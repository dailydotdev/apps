import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { LoggedUser, PublicProfile } from '../../../../lib/user';
import AuthContext from '../../../../contexts/AuthContext';
import { ProfileWidgets } from './ProfileWidgets';
import type { ProfileReadingData } from '../../../../graphql/users';
import type { Connection } from '../../../../graphql/common';
import type { SourceMember, Squad } from '../../../../graphql/sources';
import { SourceMemberRole, SourceType } from '../../../../graphql/sources';
import { settingsContext } from '../../../../../__tests__/helpers/boot';
import SettingsContext from '../../../../contexts/SettingsContext';
import { getLogContextStatic } from '../../../../contexts/LogContext';
import { gqlClient } from '../../../../graphql/common';

const LogContext = getLogContextStatic();

jest.mock('./AchievementsWidget', () => ({
  AchievementsWidget: () => null,
}));

jest.mock('./AchievementSyncPromptCheck', () => ({
  AchievementSyncPromptCheck: () => null,
}));

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (importFn: () => Promise<Record<string, React.ComponentType>>) => {
    const fnStr = importFn.toString();
    if (fnStr.includes('BadgesAndAwards')) {
      return jest.requireActual<Record<string, React.ComponentType>>(
        './BadgesAndAwards',
      ).BadgesAndAwards;
    }
    if (fnStr.includes('AchievementsWidget')) {
      return jest.requireMock<Record<string, React.ComponentType>>(
        './AchievementsWidget',
      ).AchievementsWidget;
    }
    if (fnStr.includes('AchievementSyncPromptCheck')) {
      return jest.requireMock<Record<string, React.ComponentType>>(
        './AchievementSyncPromptCheck',
      ).AchievementSyncPromptCheck;
    }
    return () => null;
  },
}));

// Mock gqlClient
jest.mock('../../../../graphql/common', () => ({
  gqlClient: {
    request: jest.fn(),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

const baseUserProps = {
  premium: false,
  reputation: 20,
  bio: 'The best company!',
  twitter: 'twitter',
  github: 'github',
  hashnode: 'hashnode',
  portfolio: 'https://daily.dev/?key=vaue',
  roadmap: 'roadmap',
  threads: 'threads',
  codepen: 'codepen',
  reddit: 'reddit',
  stackoverflow: '999999/stackoverflow',
  youtube: 'youtube',
  linkedin: 'linkedin',
  mastodon: 'https://mastodon.social/@mastodon',
};

const defaultLoggedUser: LoggedUser = {
  ...baseUserProps,
  id: 'u1',
  name: 'Ido Shamun',
  providers: ['idoshamun'],
  username: 'idoshamun',
  image: 'https://daily.dev/ido.png',
  createdAt: '2020-07-26T13:04:35.000Z',
  permalink: 'https://daily.dev/ido',
  bluesky: 'https://bsky.app/profile/dailydotdev.bsky.social',
};

const defaultProfile: PublicProfile = {
  ...baseUserProps,
  id: 'u2',
  name: 'Daily Dev',
  username: 'dailydotdev',
  image: 'https://daily.dev/daily.png',
  cover: 'https://daily.dev/cover.png',
  createdAt: '2020-08-26T13:04:35.000Z',
  permalink: 'https://daily.dev/dailydotdev',
  bluesky: 'dailydotdev.bsky.social',
};

const defaultMemberships: Connection<SourceMember> = {
  pageInfo: null,
  edges: [
    {
      node: {
        role: SourceMemberRole.Admin,
        source: {
          id: 's1',
          name: 'Squad 1',
          image: 'https://daily.dev/squad1.png',
          permalink: 'https://daily.dev/squad1',
          type: SourceType.Squad,
          membersCount: 10,
        } as unknown as Squad,
      } as unknown as SourceMember,
    },
    {
      node: {
        role: SourceMemberRole.Member,
        source: {
          id: 's2',
          name: 'Squad 2',
          image: 'https://daily.dev/squad2.png',
          permalink: 'https://daily.dev/squad2',
          type: SourceType.Squad,
          membersCount: 40,
        } as unknown as Squad,
      } as unknown as SourceMember,
    },
  ],
};

const defaultReadingHistory: ProfileReadingData = {
  userReadingRankHistory: [
    { rank: 1, count: 10 },
    { rank: 2, count: 20 },
  ],
  userReadHistory: [
    { date: '2024-01-01', reads: 5 },
    { date: '2024-01-02', reads: 10 },
  ],
  userStreakProfile: {
    max: 10,
    total: 50,
    current: 5,
    lastViewAt: new Date('2024-01-15'),
  },
  userMostReadTags: ['javascript', 'typescript', 'react'],
};

const logEvent = jest.fn();

const renderComponent = (
  profile: Partial<PublicProfile> = {},
  sources?: Connection<SourceMember>,
  options: {
    readingHistory?: typeof defaultReadingHistory | null;
    tokenRefreshed?: boolean;
  } = {},
): RenderResult => {
  const { readingHistory = null, tokenRefreshed = true } = options;

  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const user = { ...defaultProfile, ...profile };

  // Mock gqlClient.request to return reading history
  (gqlClient.request as jest.Mock).mockImplementation((query, variables) => {
    // Check if this is the reading history query by checking if it has the expected variables
    // The reading history query has id, before, after, version, and limit
    if (
      variables?.id &&
      variables?.before &&
      variables?.after &&
      variables?.version === 2
    ) {
      if (readingHistory !== null) {
        return Promise.resolve(readingHistory);
      }
      // Return empty structure when readingHistory is null
      return Promise.resolve({
        userReadingRankHistory: undefined,
        userReadHistory: undefined,
        userStreakProfile: undefined,
        userMostReadTags: undefined,
      });
    }
    return Promise.resolve({});
  });

  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user: defaultLoggedUser,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed,
          isLoggedIn: true,
          isAuthReady: true,
          closeLogin: jest.fn(),
          getRedirectUri: jest.fn(),
          squads: [],
        }}
      >
        <LogContext.Provider
          value={{
            logEvent,
            logEventStart: jest.fn(),
            logEventEnd: jest.fn(),
            sendBeacon: jest.fn(),
          }}
        >
          <SettingsContext.Provider value={settingsContext}>
            <ProfileWidgets
              user={user}
              userStats={{
                upvotes: 5_000,
                views: 83_000,
                numFollowers: 23_000,
                numFollowing: 3_000,
              }}
              sources={sources}
            />
          </SettingsContext.Provider>
        </LogContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should render BadgesAndAwards component', () => {
  renderComponent();

  // BadgesAndAwards renders "Badges & Awards" heading
  const badgesHeading = screen.getByText('Badges & Awards');
  expect(badgesHeading).toBeInTheDocument();
});

it('should render ReadingOverview component when userReadHistory exists', async () => {
  renderComponent({}, undefined, { readingHistory: defaultReadingHistory });

  // BadgesAndAwards renders immediately
  const badgesHeading = screen.getByText('Badges & Awards');
  expect(badgesHeading).toBeInTheDocument();

  // Wait for ReadingOverview to appear (it's always rendered now)
  await waitFor(() => {
    const readingOverviewHeading = screen.getByText('Reading Overview');
    expect(readingOverviewHeading).toBeInTheDocument();
  });
});

it('should render ReadingOverview even when userReadHistory is missing', async () => {
  // Pass readingHistory without userReadHistory
  renderComponent({}, undefined, {
    readingHistory: {
      ...defaultReadingHistory,
      userReadHistory: undefined,
    },
  });

  // ReadingOverview is always rendered now, even without data
  await waitFor(() => {
    const readingHeading = screen.getByText('Reading Overview');
    expect(readingHeading).toBeInTheDocument();
  });
});

it('should list all user squads', async () => {
  renderComponent({}, defaultMemberships);
  const squadNames = await screen.findAllByTestId('squad-list-item-name');
  expect(squadNames.length).toBe(defaultMemberships.edges.length);
  const [name1, name2] = squadNames;
  expect(name1).toHaveTextContent('Squad 1');
  expect(name2).toHaveTextContent('Squad 2');
});

it('should not fetch reading history when tokenRefreshed is false', async () => {
  renderComponent({}, undefined, {
    readingHistory: null,
    tokenRefreshed: false,
  });

  // BadgesAndAwards should still render
  const badgesHeading = await screen.findByText('Badges & Awards');
  expect(badgesHeading).toBeInTheDocument();

  // ReadingOverview should not appear
  await waitFor(() => {
    const readingHeading = screen.queryByText('Reading');
    expect(readingHeading).not.toBeInTheDocument();
  });
});
