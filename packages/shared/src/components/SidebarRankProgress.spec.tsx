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
import { testSettingsMutation } from './Settings.spec';

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
      progressThisWeek: 2,
      currentRank: 0,
      readToday: false,
      rankLastWeek: 0,
    },
    reads: 0,
  },
  userId: string = defaultUser.id,
): MockedGraphQLResponse<MyRankData> => ({
  request: {
    query: MY_READING_RANK_QUERY,
    variables: { id: userId },
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
  sortingEnabled: false,
  optOutWeeklyGoal: true,
};

const updateSettings = jest.fn();

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createRankMock()],
  user: LoggedUser = defaultUser,
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
          settings={defaultSettings}
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
    expect(screen.queryAllByTestId('completedPath').length).toEqual(2);
    expect(screen.queryAllByTestId('remainingPath').length).toEqual(1);
  });
});

it('should first show cached rank and animate to fetched rank', async () => {
  await setCache('rank', {
    rank: { progressThisWeek: 1, currentRank: 0, readToday: false },
    userId: defaultUser.id,
  });
  renderComponent();
  await waitFor(() => {
    expect(screen.queryAllByTestId('completedPath').length).toEqual(1);
    expect(screen.queryAllByTestId('remainingPath').length).toEqual(2);
  });
  await waitFor(() => {
    expect(screen.queryAllByTestId('completedPath').length).toEqual(2);
    expect(screen.queryAllByTestId('remainingPath').length).toEqual(1);
  });
});

it('should show rank for anonymous users', async () => {
  await setCache('rank', {
    rank: { progressThisWeek: 1, currentRank: 0, readToday: false },
    userId: null,
  });
  renderComponent([], null);
  await waitFor(() => {
    expect(screen.queryAllByTestId('completedPath').length).toEqual(1);
    expect(screen.queryAllByTestId('remainingPath').length).toEqual(2);
  });
});

it('should show rank if opt out weekly goals widget is checked', () =>
  testSettingsMutation({ optOutWeeklyGoal: true }, async () => {
    await setCache('rank', {
      rank: { progressThisWeek: 1, currentRank: 0, readToday: false },
      userId: defaultUser.id,
    });
    renderComponent([], null);
    await waitFor(() => {
      expect(screen.queryAllByTestId('completedPath').length).toEqual(1);
      expect(screen.queryAllByTestId('remainingPath').length).toEqual(2);
    });
  }));

it('should not show rank if opt out weekly goals widget is not checked', () =>
  testSettingsMutation({ optOutWeeklyGoal: false }, async () => {
    await setCache('rank', {
      rank: { progressThisWeek: 1, currentRank: 0, readToday: false },
      userId: defaultUser.id,
    });
    renderComponent([], null);
    await waitFor(() => {
      expect(screen.queryAllByTestId('completedPath')).not.toBeInTheDocument();
    });
  }));
