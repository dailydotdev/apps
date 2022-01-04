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
import AuthContext from './AuthContext';
import defaultUser from '../../__tests__/fixture/loggedUser';
import { LoggedUser } from '../lib/user';
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
import * as bootProdiver from './BootProvider';
import * as boot from '../lib/boot';

const getRedirectUri = jest.fn();

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
};

const defaultBootData: boot.BootCacheData = {
  alerts: defaultAlerts,
  user: defaultUser,
  settings: defaultSettings,
  flags: {},
};

const getBootMock = (bootMock: boot.BootCacheData): boot.Boot => ({
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
  const bootCall = jest.spyOn(boot, 'getBootData');
  bootCall.mockReturnValue(Promise.resolve(getBootMock(bootData)));
  return render(
    <QueryClientProvider client={queryClient}>
      <bootProdiver.BootDataProvider app={app} getRedirectUri={getRedirectUri}>
        {children}
      </bootProdiver.BootDataProvider>
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
}

const AuthMock = ({ updatedUser }: AuthMockProps) => {
  const { updateUser, user, deleteAccount, logout } = useContext(AuthContext);

  return (
    <>
      <button
        onClick={() => updateUser(updatedUser)}
        type="button"
        data-test-value={user?.name}
      >
        User
      </button>
      <button onClick={deleteAccount} type="button">
        Delete
      </button>
      <button onClick={logout} type="button">
        Logout
      </button>
    </>
  );
};

it('should trigger update alerts callback', async () => {
  const expected = 'Lee';
  renderComponent(
    <AuthMock updatedUser={{ ...defaultUser, name: expected }} />,
  );
  const user = await screen.findByText('User');
  expect(user).toHaveAttribute('data-test-value', defaultUser.name);
  fireEvent.click(user);
  expect(user).toHaveAttribute('data-test-value', expected);
});
