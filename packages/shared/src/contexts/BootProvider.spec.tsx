import React, { ReactNode, useContext } from 'react';
import nock from 'nock';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { mocked } from 'ts-jest/utils';
import AuthContext from './AuthContext';
import defaultUser from '../../__tests__/fixture/loggedUser';
import { LoggedUser, deleteAccount, AnonymousUser } from '../lib/user';
import SettingsContext, {
  remoteThemes,
  ThemeMode,
  themeModes,
} from './SettingsContext';
import { mockGraphQL } from '../../__tests__/helpers/graphql';
import AlertContext from './AlertContext';
import { Alerts, UPDATE_ALERTS } from '../graphql/alerts';
import {
  RemoteSettings,
  Spaciness,
  UPDATE_USER_SETTINGS_MUTATION,
} from '../graphql/settings';
import { BootDataProvider } from './BootProvider';
import { getBootData, Boot, BootCacheData } from '../lib/boot';

jest.mock('../lib/boot', () => ({
  ...jest.requireActual('../lib/boot'),
  getBootData: jest.fn(),
}));

jest.mock('../lib/user', () => ({
  ...jest.requireActual('../lib/user'),
  deleteAccount: jest.fn(),
}));

const getRedirectUriMock = jest.fn();

beforeEach(() => {
  nock.cleanAll();
  localStorage.clear();
});

const defaultAlerts: Alerts = { filter: true, rankLastSeen: null };

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
  autoDismissNotifications: true,
};

const defaultBootData: BootCacheData = {
  alerts: defaultAlerts,
  user: defaultUser,
  settings: defaultSettings,
  flags: {},
};

const getBootMock = (bootMock: BootCacheData): Boot => ({
  ...bootMock,
  accessToken: { token: '1', expiresIn: '1' },
  visit: { sessionId: '1', visitId: '1' },
});

const renderComponent = (
  children: ReactNode,
  bootData = defaultBootData,
): RenderResult => {
  const queryClient = new QueryClient();
  const app = 'extension';
  mocked(getBootData).mockResolvedValue(getBootMock(bootData));
  return render(
    <QueryClientProvider client={queryClient}>
      <BootDataProvider app={app} getRedirectUri={getRedirectUriMock}>
        {children}
      </BootDataProvider>
    </QueryClientProvider>,
  );
};

const mockSettingsMutation = (params: Partial<RemoteSettings>) =>
  mockGraphQL({
    request: {
      query: UPDATE_USER_SETTINGS_MUTATION,
      variables: { data: { ...defaultSettings, ...params } },
    },
    result: () => {
      return { data: { _: true } };
    },
  });

interface SettingsMockProps {
  toTheme?: ThemeMode;
  toSpaciness?: Spaciness;
}

const SettingsMock = ({ toTheme, toSpaciness }: SettingsMockProps) => {
  const {
    toggleSidebarExpanded,
    sidebarExpanded,
    setTheme,
    themeMode,
    toggleShowOnlyUnreadPosts,
    showOnlyUnreadPosts,
    toggleOpenNewTab,
    openNewTab,
    setSpaciness,
    spaciness,
    toggleInsaneMode,
    insaneMode,
    toggleShowTopSites,
    showTopSites,
    toggleSortingEnabled,
    sortingEnabled,
    optOutWeeklyGoal,
    toggleOptOutWeeklyGoal,
    autoDismissNotifications,
    toggleAutoDismissNotifications,
  } = useContext(SettingsContext);

  return (
    <>
      <button
        onClick={toggleSidebarExpanded}
        type="button"
        data-test-value={sidebarExpanded}
      >
        Sidebar
      </button>
      <button
        onClick={() => setTheme(toTheme)}
        type="button"
        data-test-value={themeMode}
      >
        Theme
      </button>
      <button
        onClick={toggleShowOnlyUnreadPosts}
        type="button"
        data-test-value={showOnlyUnreadPosts}
      >
        Show Only Unread
      </button>
      <button
        onClick={toggleOptOutWeeklyGoal}
        type="button"
        data-test-value={optOutWeeklyGoal}
      >
        Show Weekly Goal widget
      </button>
      <button
        onClick={() => setSpaciness(toSpaciness)}
        type="button"
        data-test-value={spaciness}
      >
        Spaciness
      </button>
      <button
        onClick={toggleInsaneMode}
        type="button"
        data-test-value={insaneMode}
      >
        Insane Mode
      </button>
      <button
        onClick={toggleOpenNewTab}
        type="button"
        data-test-value={openNewTab}
      >
        Open New Tab
      </button>
      <button
        onClick={toggleShowTopSites}
        type="button"
        data-test-value={showTopSites}
      >
        Show Top Sites
      </button>
      <button
        onClick={toggleSortingEnabled}
        type="button"
        data-test-value={sortingEnabled}
      >
        Sorting Feed
      </button>
      <button
        onClick={toggleAutoDismissNotifications}
        type="button"
        data-test-value={autoDismissNotifications}
      >
        Auto dismiss notifications
      </button>
    </>
  );
};

it('should toggle the sidebar callback', async () => {
  const expected = false;
  mockSettingsMutation({ sidebarExpanded: expected });
  renderComponent(<SettingsMock />);
  const sidebar = await screen.findByText('Sidebar');
  expect(sidebar).toHaveAttribute(
    'data-test-value',
    defaultSettings.sidebarExpanded.toString(),
  );
  fireEvent.click(sidebar);
  expect(sidebar).toHaveAttribute('data-test-value', expected.toString());
});

it('should trigget set theme callback', async () => {
  const expected = ThemeMode.Dark;
  mockSettingsMutation({ theme: remoteThemes[expected] });
  renderComponent(<SettingsMock toTheme={expected} />);
  const theme = await screen.findByText('Theme');
  expect(theme).toHaveAttribute(
    'data-test-value',
    themeModes[defaultSettings.theme],
  );
  fireEvent.click(theme);
  expect(theme).toHaveAttribute('data-test-value', expected);
});

it('should toggle show unread posts only callback', async () => {
  const expected = false;
  mockSettingsMutation({ showOnlyUnreadPosts: expected });
  renderComponent(<SettingsMock />);
  const unread = await screen.findByText('Show Only Unread');
  expect(unread).toHaveAttribute(
    'data-test-value',
    defaultSettings.showOnlyUnreadPosts.toString(),
  );
  fireEvent.click(unread);
  expect(unread).toHaveAttribute('data-test-value', expected.toString());
});

it('should set spaciness callback', async () => {
  const expected = 'eco';
  mockSettingsMutation({ spaciness: expected });
  renderComponent(<SettingsMock toSpaciness={expected} />);
  const spaciness = await screen.findByText('Spaciness');
  expect(spaciness).toHaveAttribute(
    'data-test-value',
    defaultSettings.spaciness,
  );
  fireEvent.click(spaciness);
  expect(spaciness).toHaveAttribute('data-test-value', expected);
});

it('should toggle insane mode callback', async () => {
  const expected = true;
  mockSettingsMutation({ insaneMode: expected });
  renderComponent(<SettingsMock />);
  const insaneMode = await screen.findByText('Insane Mode');
  expect(insaneMode).toHaveAttribute(
    'data-test-value',
    defaultSettings.insaneMode.toString(),
  );
  fireEvent.click(insaneMode);
  expect(insaneMode).toHaveAttribute('data-test-value', expected.toString());
});

it('should toggle open new tab settings callback', async () => {
  const expected = true;
  mockSettingsMutation({ openNewTab: expected });
  renderComponent(<SettingsMock />);
  const openNewTab = await screen.findByText('Open New Tab');
  expect(openNewTab).toHaveAttribute(
    'data-test-value',
    defaultSettings.openNewTab.toString(),
  );
  fireEvent.click(openNewTab);
  expect(openNewTab).toHaveAttribute('data-test-value', expected.toString());
});

it('should toggle show top sites callback', async () => {
  const expected = false;
  mockSettingsMutation({ showTopSites: expected });
  renderComponent(<SettingsMock />);
  const showTopSites = await screen.findByText('Show Top Sites');
  expect(showTopSites).toHaveAttribute(
    'data-test-value',
    defaultSettings.showTopSites.toString(),
  );
  fireEvent.click(showTopSites);
  expect(showTopSites).toHaveAttribute('data-test-value', expected.toString());
});

it('should toggle sorting enabled callback', async () => {
  const expected = true;
  mockSettingsMutation({ sortingEnabled: expected });
  renderComponent(<SettingsMock />);
  const sorting = await screen.findByText('Sorting Feed');
  expect(sorting).toHaveAttribute(
    'data-test-value',
    defaultSettings.sortingEnabled.toString(),
  );
  fireEvent.click(sorting);
  expect(sorting).toHaveAttribute('data-test-value', expected.toString());
});

it('should toggle auto dismiss notifications', async () => {
  const expected = false;
  mockSettingsMutation({ autoDismissNotifications: expected });
  renderComponent(<SettingsMock />);
  const autoDismiss = await screen.findByText('Auto dismiss notifications');
  expect(autoDismiss).toHaveAttribute(
    'data-test-value',
    defaultSettings.autoDismissNotifications.toString(),
  );
  fireEvent.click(autoDismiss);
  expect(autoDismiss).toHaveAttribute('data-test-value', expected.toString());
});

const AlertsMock = (params: Partial<Alerts>) => {
  const { updateAlerts, alerts } = useContext(AlertContext);

  return (
    <button
      onClick={() => updateAlerts(params)}
      type="button"
      data-test-value={JSON.stringify(alerts)}
    >
      Alerts
    </button>
  );
};

const mockAlertsMutation = (params: Partial<Alerts>) =>
  mockGraphQL({
    request: {
      query: UPDATE_ALERTS,
      variables: { data: params },
    },
    result: () => {
      return { data: { _: true } };
    },
  });

it('should trigger update alerts callback', async () => {
  const filter = false;
  const alerts = { ...defaultAlerts, filter };
  mockAlertsMutation({ filter });
  renderComponent(<AlertsMock filter={filter} />);
  const alertsEl = await screen.findByText('Alerts');
  expect(alertsEl).toHaveAttribute(
    'data-test-value',
    JSON.stringify(defaultAlerts),
  );
  fireEvent.click(alertsEl);
  await waitFor(() =>
    expect(alertsEl).toHaveAttribute('data-test-value', JSON.stringify(alerts)),
  );
});

interface AuthMockProps {
  updatedUser?: LoggedUser;
  loginTrigger?: string;
}

const AuthMock = ({ updatedUser, loginTrigger }: AuthMockProps) => {
  const {
    updateUser,
    user,
    deleteAccount: deleteUserAccount,
    logout,
    showLogin,
    closeLogin,
    loginState,
    getRedirectUri,
    trackingId,
    anonymous,
  } = useContext(AuthContext);

  return (
    <>
      <button
        onClick={() => updateUser(updatedUser)}
        type="button"
        data-test-value={user?.name || 'anonymous'}
      >
        User
      </button>
      <button onClick={deleteUserAccount} type="button">
        Delete
      </button>
      <button onClick={logout} type="button">
        Logout
      </button>
      <button
        onClick={() => showLogin(loginTrigger)}
        type="button"
        data-test-value={JSON.stringify(loginState)}
      >
        Login
      </button>
      <button
        onClick={closeLogin}
        type="button"
        data-test-value={JSON.stringify(loginState)}
      >
        Close Login
      </button>
      <button onClick={getRedirectUri} type="button">
        Redirect
      </button>
      <span data-test-value={trackingId}>Tracking ID</span>
      <span data-test-value={JSON.stringify(anonymous)}>Anonymous User</span>
    </>
  );
};

it('should trigger update user callback', async () => {
  const expected = 'Lee';
  renderComponent(
    <AuthMock updatedUser={{ ...defaultUser, name: expected }} />,
  );
  const user = await screen.findByText('User');
  expect(user).toHaveAttribute('data-test-value', defaultUser.name);
  fireEvent.click(user);
  expect(user).toHaveAttribute('data-test-value', expected);
});

it('should trigger delete account callback', async () => {
  renderComponent(<AuthMock />);
  const deleteUser = await screen.findByText('Delete');
  fireEvent.click(deleteUser);
  expect(deleteAccount).toHaveBeenCalled();
});

const defaultAnonymousUser: AnonymousUser = {
  id: 'anonymous user',
  firstVisit: 'first visit',
  referrer: 'string',
};

it('should trigger show login callback', async () => {
  const expected = 'mock';
  renderComponent(<AuthMock loginTrigger={expected} />, {
    ...defaultBootData,
    user: defaultAnonymousUser,
  });
  const login = await screen.findByText('Login');
  expect(login).toHaveAttribute('data-test-value', 'null');
  fireEvent.click(login);
  expect(login).toHaveAttribute(
    'data-test-value',
    JSON.stringify({ trigger: expected }),
  );
});

it('should trigger close login callback', async () => {
  const expected = 'mock';
  renderComponent(<AuthMock loginTrigger={expected} />, {
    ...defaultBootData,
    user: defaultAnonymousUser,
  });
  const login = await screen.findByText('Login');
  const closeLogin = await screen.findByText('Close Login');
  expect(closeLogin).toHaveAttribute('data-test-value', 'null');
  fireEvent.click(login);
  expect(closeLogin).toHaveAttribute(
    'data-test-value',
    JSON.stringify({ trigger: expected }),
  );
  fireEvent.click(closeLogin);
  expect(closeLogin).toHaveAttribute('data-test-value', 'null');
});

it('should trigger get redirect uri callback', async () => {
  renderComponent(<AuthMock />);
  const getRedirect = await screen.findByText('Redirect');
  fireEvent.click(getRedirect);
  expect(getRedirectUriMock).toHaveBeenCalled();
});

it('should display user tracking id for anonymous user', async () => {
  renderComponent(<AuthMock />, {
    ...defaultBootData,
    user: defaultAnonymousUser,
  });
  const trackingId = await screen.findByText('Tracking ID');
  expect(trackingId).toHaveAttribute(
    'data-test-value',
    defaultAnonymousUser.id,
  );
  const user = await screen.findByText('User');
  expect(user).toHaveAttribute('data-test-value', 'anonymous');
});

it('should display accurate information of anonymous user', async () => {
  renderComponent(<AuthMock />, {
    ...defaultBootData,
    user: defaultAnonymousUser,
  });
  const anonymousUser = await screen.findByText('Anonymous User');
  expect(anonymousUser).toHaveAttribute(
    'data-test-value',
    JSON.stringify(defaultAnonymousUser),
  );
  const user = await screen.findByText('User');
  expect(user).toHaveAttribute('data-test-value', 'anonymous');
});
