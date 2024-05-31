import React from 'react';
import nock from 'nock';
import {
  fireEvent,
  queryByText,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockGraphQL } from '../../__tests__/helpers/graphql';
import { SettingsContextProvider } from '../contexts/SettingsContext';
import Settings from './Settings';
import {
  RemoteSettings,
  UPDATE_USER_SETTINGS_MUTATION,
} from '../graphql/settings';
import { LoggedUser } from '../lib/user';
import defaultUser from '../../__tests__/fixture/loggedUser';
import AuthContext from '../contexts/AuthContext';
import { BootDataProvider } from '../contexts/BootProvider';
import { apiUrl } from '../lib/config';
import { BootApp, BootCacheData } from '../lib/boot';
import { BOOT_LOCAL_KEY } from '../contexts/common';
import * as hooks from '../hooks/useViewSize';

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  nock.cleanAll();
});

const showLogin = jest.fn();

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

const updateSettings = jest.fn();

const renderComponent = (
  user: LoggedUser = defaultUser,
  settings: RemoteSettings = defaultSettings,
): RenderResult => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user,
          shouldShowLogin: false,
          showLogin,
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          getRedirectUri: jest.fn(),
          loadedUserFromCache: true,
          loginState: null,
          loadingUser: false,
          closeLogin: jest.fn(),
          trackingId: user?.id,
        }}
      >
        <SettingsContextProvider
          settings={settings}
          updateSettings={updateSettings}
          loadedSettings
        >
          <Settings />
        </SettingsContextProvider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should fetch remote settings on desktop', async () => {
  // is desktop
  jest.spyOn(hooks, 'useViewSize').mockImplementation(() => true);

  renderComponent();

  const radio = await screen.findAllByRole('radio');
  await waitFor(() =>
    expect(
      // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
      radio.find((el) => queryByText(el.parentElement, 'Roomy')),
    ).toBeChecked(),
  );
  await waitFor(() =>
    expect(
      // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
      radio.find((el) => queryByText(el.parentElement, 'Light')),
    ).toBeChecked(),
  );

  const checkbox = await screen.findAllByRole('checkbox');

  await waitFor(() =>
    expect(
      checkbox.find((el) =>
        // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
        queryByText(el.parentElement, 'Open links in new tab'),
      ),
    ).not.toBeChecked(),
  );

  await waitFor(() =>
    expect(
      checkbox.find((el) =>
        // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
        queryByText(el.parentElement, 'Show feed sorting menu'),
      ),
    ).not.toBeChecked(),
  );
});

it('should fetch remote settings on mobile', async () => {
  // is Mobile
  jest.spyOn(hooks, 'useViewSize').mockImplementation(() => true);

  renderComponent();

  const checkbox = await screen.findAllByRole('checkbox');

  await waitFor(() =>
    expect(
      checkbox.find((el) =>
        // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
        queryByText(el.parentElement, 'Open links in new tab'),
      ),
    ).not.toBeChecked(),
  );

  await waitFor(() =>
    expect(
      checkbox.find((el) =>
        // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
        queryByText(el.parentElement, 'Show feed sorting menu'),
      ),
    ).not.toBeChecked(),
  );
});

const defaultBootData: Partial<BootCacheData> = {
  settings: { ...defaultSettings, spaciness: 'cozy' },
};
const renderBootProvider = (
  bootData: Partial<BootCacheData> = defaultBootData,
) => {
  const queryClient = new QueryClient();
  const app = BootApp.Extension;
  nock(apiUrl).get('/boot', { headers: { app } }).reply(200, bootData);

  return render(
    <QueryClientProvider client={queryClient}>
      <BootDataProvider
        app={app}
        getRedirectUri={jest.fn()}
        version="pwa"
        deviceId="123"
        getPage={jest.fn()}
      >
        <Settings />
      </BootDataProvider>
    </QueryClientProvider>,
  );
};

it('should utilize front-end default settings for first time users on desktop', async () => {
  // is desktop
  jest.spyOn(hooks, 'useViewSize').mockImplementation(() => true);

  renderBootProvider();

  const radio = await screen.findAllByRole('radio');
  await waitFor(() =>
    expect(
      // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
      radio.find((el) => queryByText(el.parentElement, 'Eco')),
    ).toBeChecked(),
  );
});

it('should utilize local cache settings for anonymous users on desktop', async () => {
  // is desktop
  jest.spyOn(hooks, 'useViewSize').mockImplementation(() => true);

  const localBootData = {
    ...defaultBootData,
    settings: { ...defaultBootData.settings, theme: 'cozy' },
  };
  localStorage.setItem(BOOT_LOCAL_KEY, JSON.stringify(localBootData));
  renderBootProvider(defaultBootData);

  const radio = await screen.findAllByRole('radio');
  await waitFor(() =>
    expect(
      // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
      radio.find((el) => queryByText(el.parentElement, 'Cozy')),
    ).toBeChecked(),
  );
});

const testSettingsMutation = async (
  settings: Partial<RemoteSettings>,
  updateFunc: () => Promise<void>,
  initialSettings = defaultSettings,
): Promise<void> => {
  renderComponent(defaultUser, initialSettings);

  let mutationCalled = false;
  mockGraphQL({
    request: {
      query: UPDATE_USER_SETTINGS_MUTATION,
      variables: { data: { ...defaultSettings, ...settings } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { updateUserSettings: { updatedAt: new Date(0) } } };
    },
  });

  if (initialSettings.theme === 'bright') {
    const radio = await screen.findAllByRole('radio');
    await waitFor(() =>
      expect(
        // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
        radio.find((el) => queryByText(el.parentElement, 'Light')),
      ).toBeChecked(),
    );
  }

  await updateFunc();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
};

it('should mutate density setting', () => {
  // is desktop
  jest.spyOn(hooks, 'useViewSize').mockImplementation(() => true);
  return testSettingsMutation({ spaciness: 'cozy' }, async () => {
    const radio = await screen.findAllByRole('radio');
    // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
    const cozy = radio.find((el) => queryByText(el.parentElement, 'Cozy'));
    fireEvent.click(cozy);
  });
});

it('should set theme to dark mode setting', () =>
  testSettingsMutation({ theme: 'darcula' }, async () => {
    const radios = await screen.findAllByRole('radio');
    const radio = radios.find((el) =>
      // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
      queryByText(el.parentElement, 'Dark'),
    ) as HTMLInputElement;
    fireEvent.click(radio);
  }));

it('should set light to dark mode setting', () =>
  testSettingsMutation(
    { theme: 'bright' },
    async () => {
      const radios = await screen.findAllByRole('radio');
      const radio = radios.find((el) =>
        // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
        queryByText(el.parentElement, 'Light'),
      ) as HTMLInputElement;
      fireEvent.click(radio);
    },
    { ...defaultSettings, theme: 'darcula' },
  ));

it('should mutate open links in new tab setting', () =>
  testSettingsMutation({ openNewTab: true }, async () => {
    const checkboxes = await screen.findAllByRole('checkbox');
    const checkbox = checkboxes.find((el) =>
      // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
      queryByText(el.parentElement, 'Open links in new tab'),
    ) as HTMLInputElement;
    fireEvent.click(checkbox);
  }));

it('should mutate feed sorting enabled setting', () =>
  testSettingsMutation({ sortingEnabled: true }, async () => {
    const checkboxes = await screen.findAllByRole('checkbox');
    const checkbox = checkboxes.find((el) =>
      // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
      queryByText(el.parentElement, 'Show feed sorting menu'),
    ) as HTMLInputElement;
    fireEvent.click(checkbox);
  }));

it('should mutate automatic dismissal of notifications setting', () =>
  testSettingsMutation({ autoDismissNotifications: false }, async () => {
    const checkbox = await screen.findByText(
      'Automatically dismiss notifications',
    );
    fireEvent.click(checkbox);
  }));

it('should not have the Show custom shortcuts switch in the webapp', async () => {
  renderComponent(null);
  const checkbox = screen.queryByText('Show custom shortcuts');
  expect(checkbox).not.toBeInTheDocument();
});

it('should mutate Show custom shortcuts setting in extension', async () => {
  process.env.TARGET_BROWSER = 'chrome';
  renderComponent();

  let mutationCalled = false;
  mockGraphQL({
    request: {
      query: UPDATE_USER_SETTINGS_MUTATION,
      variables: { data: { ...defaultSettings, showTopSites: false } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { updateUserSettings: { updatedAt: new Date(0) } } };
    },
  });

  const checkboxes = await screen.findAllByRole('checkbox');
  const checkbox = checkboxes.find((el) =>
    // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
    queryByText(el.parentElement, 'Show custom shortcuts'),
  ) as HTMLInputElement;

  await waitFor(() => expect(checkbox).toBeInTheDocument());
  await waitFor(() => expect(checkbox).toBeChecked());
  fireEvent.click(checkbox);

  await waitFor(() => expect(mutationCalled).toBeTruthy());
});
