import React, { ReactNode, useContext } from 'react';
import nock from 'nock';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import { AuthTriggers, AuthTriggersType } from '../lib/auth';
import { expectToHaveTestValue } from '../../__tests__/helpers/utilities';

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
  spaciness: 'roomy',
  insaneMode: false,
  showTopSites: true,
  sidebarExpanded: true,
  companionExpanded: false,
  sortingEnabled: false,
  optOutReadingStreak: true,
  autoDismissNotifications: true,
  optOutCompanion: false,
};

const defaultBootData: BootCacheData = {
  alerts: defaultAlerts,
  user: defaultUser,
  settings: defaultSettings,
  notifications: { unreadNotificationsCount: 0 },
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
    optOutReadingStreak,
    toggleOptOutReadingStreak,
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
        onClick={toggleOptOutReadingStreak}
        type="button"
        data-test-value={optOutReadingStreak}
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

const waitForRemoteBoot = async () => {
  const theme = await screen.findByText('Theme');
  await expectToHaveTestValue(theme, themeModes[defaultSettings.theme]);
};

it('should toggle the sidebar callback', async () => {
  const expected = false;
  mockSettingsMutation({ sidebarExpanded: expected });
  renderComponent(<SettingsMock />);
  await waitForRemoteBoot();
  const sidebar = await screen.findByText('Sidebar');
  await expectToHaveTestValue(
    sidebar,
    defaultSettings.sidebarExpanded.toString(),
  );
  fireEvent.click(sidebar);
  await expectToHaveTestValue(sidebar, expected.toString());
});

it('should trigger set theme callback', async () => {
  const expected = ThemeMode.Dark;
  mockSettingsMutation({ theme: remoteThemes[expected] });
  renderComponent(<SettingsMock toTheme={expected} />);
  await waitForRemoteBoot();
  const theme = await screen.findByText('Theme');
  await expectToHaveTestValue(theme, themeModes[defaultSettings.theme]);
  fireEvent.click(theme);
  await expectToHaveTestValue(theme, expected);
});

it('should set spaciness callback', async () => {
  const expected = 'eco';
  mockSettingsMutation({ spaciness: expected });
  renderComponent(<SettingsMock toSpaciness={expected} />);
  await waitForRemoteBoot();
  const spaciness = await screen.findByText('Spaciness');
  await expectToHaveTestValue(spaciness, defaultSettings.spaciness);
  fireEvent.click(spaciness);
  await expectToHaveTestValue(spaciness, expected);
});

it('should toggle insane mode callback', async () => {
  const expected = true;
  mockSettingsMutation({ insaneMode: expected });
  renderComponent(<SettingsMock />);
  await waitForRemoteBoot();
  const insaneMode = await screen.findByText('Insane Mode');
  await expectToHaveTestValue(
    insaneMode,
    defaultSettings.insaneMode.toString(),
  );
  fireEvent.click(insaneMode);
  await expectToHaveTestValue(insaneMode, expected.toString());
});

it('should toggle open new tab settings callback', async () => {
  const expected = true;
  mockSettingsMutation({ openNewTab: expected });
  renderComponent(<SettingsMock />);
  await waitForRemoteBoot();
  const openNewTab = await screen.findByText('Open New Tab');
  await expectToHaveTestValue(
    openNewTab,
    defaultSettings.openNewTab.toString(),
  );
  fireEvent.click(openNewTab);
  await expectToHaveTestValue(openNewTab, expected.toString());
});

it('should toggle show top sites callback', async () => {
  const expected = false;
  mockSettingsMutation({ showTopSites: expected });
  renderComponent(<SettingsMock />);
  await waitForRemoteBoot();
  const showTopSites = await screen.findByText('Show Top Sites');
  await expectToHaveTestValue(
    showTopSites,
    defaultSettings.showTopSites.toString(),
  );
  fireEvent.click(showTopSites);
  await expectToHaveTestValue(showTopSites, expected.toString());
});

it('should toggle sorting enabled callback', async () => {
  const expected = true;
  mockSettingsMutation({ sortingEnabled: expected });
  renderComponent(<SettingsMock />);
  await waitForRemoteBoot();
  const sorting = await screen.findByText('Sorting Feed');
  await expectToHaveTestValue(
    sorting,
    defaultSettings.sortingEnabled.toString(),
  );
  fireEvent.click(sorting);
  await expectToHaveTestValue(sorting, expected.toString());
});

it('should toggle auto dismiss notifications', async () => {
  const expected = false;
  mockSettingsMutation({ autoDismissNotifications: expected });
  renderComponent(<SettingsMock />);
  await waitForRemoteBoot();
  const autoDismiss = await screen.findByText('Auto dismiss notifications');
  await expectToHaveTestValue(
    autoDismiss,
    defaultSettings.autoDismissNotifications.toString(),
  );
  fireEvent.click(autoDismiss);
  await expectToHaveTestValue(autoDismiss, expected.toString());
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
  await expectToHaveTestValue(alertsEl, JSON.stringify(defaultAlerts));
  fireEvent.click(alertsEl);
  await expectToHaveTestValue(alertsEl, JSON.stringify(alerts));
});

interface AuthMockProps {
  updatedUser?: LoggedUser;
  loginTrigger?: AuthTriggersType;
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
        onClick={() => showLogin({ trigger: loginTrigger })}
        type="button"
        data-test-value={JSON.stringify(loginState)}
      >
        Log in
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
  await expectToHaveTestValue(user, defaultUser.name);
  fireEvent.click(user);
  await expectToHaveTestValue(user, expected);
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
  const expected = AuthTriggers.Comment;
  renderComponent(<AuthMock loginTrigger={expected} />, {
    ...defaultBootData,
    user: defaultAnonymousUser,
  });
  const login = await screen.findByText('Log in');
  await expectToHaveTestValue(login, 'null');
  fireEvent.click(login);
  await expectToHaveTestValue(login, JSON.stringify({ trigger: expected }));
});

it('should trigger close login callback', async () => {
  const expected = AuthTriggers.Comment;
  renderComponent(<AuthMock loginTrigger={expected} />, {
    ...defaultBootData,
    user: defaultAnonymousUser,
  });
  const login = await screen.findByText('Log in');
  const closeLogin = await screen.findByText('Close Login');
  await expectToHaveTestValue(closeLogin, 'null');
  fireEvent.click(login);
  await expectToHaveTestValue(
    closeLogin,
    JSON.stringify({ trigger: expected }),
  );
  fireEvent.click(closeLogin);
  await expectToHaveTestValue(closeLogin, 'null');
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
  await expectToHaveTestValue(trackingId, defaultAnonymousUser.id);
  const user = await screen.findByText('User');
  await expectToHaveTestValue(user, 'anonymous');
});

it('should display accurate information of anonymous user', async () => {
  renderComponent(<AuthMock />, {
    ...defaultBootData,
    user: defaultAnonymousUser,
  });
  const anonymousUser = await screen.findByText('Anonymous User');
  await expectToHaveTestValue(
    anonymousUser,
    JSON.stringify(defaultAnonymousUser),
  );
  const user = await screen.findByText('User');
  await expectToHaveTestValue(user, 'anonymous');
});
