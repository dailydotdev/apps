import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import nock from 'nock';
import { set as setCache } from 'idb-keyval';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '../../__tests__/helpers/graphql';
import { LoggedUser } from '../lib/user';
import defaultUser from '../../__tests__/fixture/loggedUser';
import AuthContext from '../contexts/AuthContext';
import { MY_READING_RANK_QUERY, MyRankData } from '../graphql/users';
import SidebarRankProgress from './SidebarRankProgress';
import { SettingsContextProvider } from '../contexts/SettingsContext';
import { RemoteSettings } from '../graphql/settings';
import { RANK_CACHE_KEY } from '../hooks/useReadingRank';
import { RANKS, Rank } from '../lib/rank';

jest.mock('../hooks/usePersistentState', () => {
  const originalModule = jest.requireActual('../hooks/usePersistentState');
  return {
    __esModule: true,
    ...originalModule,
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
});

const createRankMock = (
  data: MyRankData = {
    rank: {
      progressThisWeek: 1,
      currentRank: 2,
      readToday: false,
      rankLastWeek: 0,
      tags: [],
    },
    reads: 0,
  },
  userId: string = defaultUser.id,
): MockedGraphQLResponse<MyRankData> => ({
  request: {
    query: MY_READING_RANK_QUERY,
    variables: { id: userId, version: 2 },
  },
  result: {
    data,
  },
});

let queryClient: QueryClient;

const defaultSettings: RemoteSettings = {
  theme: 'bright',
  openNewTab: false,
  showOnlyUnreadPosts: true,
  spaciness: 'roomy',
  insaneMode: false,
  showTopSites: true,
  sidebarExpanded: true,
  companionExpanded: false,
  sortingEnabled: false,
  optOutWeeklyGoal: true,
};

const updateSettings = jest.fn();

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createRankMock()],
  user: LoggedUser = defaultUser,
  settings: RemoteSettings = defaultSettings,
): RenderResult => {
  queryClient = new QueryClient();
  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          getRedirectUri: jest.fn(),
          closeLogin: jest.fn(),
        }}
      >
        <SettingsContextProvider
          settings={settings}
          updateSettings={updateSettings}
          loadedSettings
        >
          <SidebarRankProgress />
        </SettingsContextProvider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should create dynamically the progress bar according to the props', async () => {
  renderComponent();
  await waitFor(() => {
    expect(screen.queryAllByTestId('completedPath').length).toEqual(1);
    expect(screen.queryAllByTestId('remainingPath').length).toEqual(2);
  });
});

it('should first show cached rank and animate to fetched rank', async () => {
  await setCache(RANK_CACHE_KEY, {
    rank: { progressThisWeek: 0, currentRank: 1, readToday: false },
    userId: defaultUser.id,
  });
  renderComponent();
  await waitFor(() => {
    expect(screen.queryAllByTestId('completedPath').length).toEqual(0);
    expect(screen.queryAllByTestId('remainingPath').length).toEqual(1);
  });
  await waitFor(() => {
    expect(screen.queryAllByTestId('completedPath').length).toEqual(1);
    expect(screen.queryAllByTestId('remainingPath').length).toEqual(2);
  });
});

it('should show rank for anonymous users', async () => {
  await setCache(RANK_CACHE_KEY, {
    rank: { progressThisWeek: 1, currentRank: 1, readToday: false },
    userId: null,
  });
  renderComponent([], null);
  await waitFor(() => {
    expect(screen.queryAllByTestId('completedPath').length).toEqual(1);
    expect(screen.queryAllByTestId('remainingPath').length).toEqual(1);
  });
});

it('should show rank if show weekly goals toggle is checked', async () => {
  await setCache(RANK_CACHE_KEY, {
    rank: { progressThisWeek: 1, currentRank: 1, readToday: false },
    userId: defaultUser.id,
  });
  renderComponent([], null);
  await waitFor(() => {
    expect(screen.queryAllByTestId('completedPath').length).toEqual(1);
    expect(screen.queryAllByTestId('remainingPath').length).toEqual(1);
  });
});

it('should not show rank if show weekly goals toggle is not checked', async () => {
  await setCache(RANK_CACHE_KEY, {
    rank: { progressThisWeek: 1, currentRank: 0, readToday: false },
    userId: defaultUser.id,
  });
  renderComponent([], null, { ...defaultSettings, optOutWeeklyGoal: false });
  await waitFor(() => {
    expect(screen.queryByTestId('completedPath')).not.toBeInTheDocument();
  });
});

type RankType = [string, Rank];

it.each<RankType>(RANKS.map((rank) => [rank.name, rank]))(
  'it should expect %s to be set',
  async (name, rank) => {
    setCache(RANK_CACHE_KEY, {
      rank: {
        progressThisWeek: rank.steps,
        currentRank: rank.level,
        readToday: false,
      },
      userId: null,
    });

    const { baseElement } = renderComponent([], null);
    await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));

    await waitFor(() => {
      expect(screen.queryAllByTestId('completedPath').length).toEqual(
        rank.level === 7 ? 1 : rank.steps,
      );
      expect(screen.queryAllByTestId('remainingPath').length).toEqual(
        rank.level === 7 ? 0 : 1,
      );
    });
  },
);

it.each<RankType>(RANKS.map((rank) => [rank.name, rank]))(
  'it should expect %s to be set when there is a previous week rank',
  async (name, rank) => {
    setCache(RANK_CACHE_KEY, {
      rank: {
        progressThisWeek: rank.steps - 1,
        currentRank: rank.level,
        rankLastWeek: rank.level,
        readToday: false,
      },
      userId: null,
    });

    const { baseElement } = renderComponent([], null);
    await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));

    await waitFor(() => {
      expect(screen.queryAllByTestId('completedPath').length).toEqual(
        rank.steps - 1,
      );
      expect(screen.queryAllByTestId('remainingPath').length).toEqual(
        rank.level === 7 ? 1 : 2,
      );
    });
  },
);

it('should show the specific ranks', async () => {
  await setCache(RANK_CACHE_KEY, {
    rank: { progressThisWeek: 0, currentRank: 1, readToday: false },
    userId: defaultUser.id,
  });
  renderComponent();
  await waitFor(() => {
    expect(screen.queryAllByTestId('completedPath').length).toEqual(0);
    expect(screen.queryAllByTestId('remainingPath').length).toEqual(1);
  });
  await waitFor(() => {
    expect(screen.queryAllByTestId('completedPath').length).toEqual(1);
    expect(screen.queryAllByTestId('remainingPath').length).toEqual(2);
  });
});
