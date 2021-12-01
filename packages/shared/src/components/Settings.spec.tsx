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
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '../../__tests__/helpers/graphql';
import { SettingsContextProvider } from '../contexts/SettingsContext';
import Settings from './Settings';
import {
  RemoteSettings,
  UPDATE_USER_SETTINGS_MUTATION,
  USER_SETTINGS_QUERY,
  UserSettingsData,
} from '../graphql/settings';
import { LoggedUser } from '../lib/user';
import defaultUser from '../../__tests__/fixture/loggedUser';
import AuthContext from '../contexts/AuthContext';
import { LoginModalMode } from '../types/LoginModalMode';
import ProgressiveEnhancementContext from '../contexts/ProgressiveEnhancementContext';
import { waitForNock } from '../../__tests__/helpers/utilities';

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
});

const showLogin = jest.fn();

const defaultSettings: RemoteSettings = {
  theme: 'bright',
  openNewTab: false,
  showOnlyUnreadPosts: true,
  spaciness: 'roomy',
  insaneMode: false,
  showTopSites: true,
};

const createSettingsMock = (
  settings: RemoteSettings = defaultSettings,
): MockedGraphQLResponse<UserSettingsData> => ({
  request: {
    query: USER_SETTINGS_QUERY,
  },
  result: {
    data: {
      userSettings: settings,
    },
  },
});

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createSettingsMock()],
  user: LoggedUser = defaultUser,
): RenderResult => {
  mocks.forEach(mockGraphQL);
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
        <ProgressiveEnhancementContext.Provider
          value={{
            windowLoaded: true,
            nativeShareSupport: true,
            asyncImageSupport: true,
          }}
        >
          <SettingsContextProvider>
            <Settings />
          </SettingsContextProvider>
        </ProgressiveEnhancementContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should fetch remote settings', async () => {
  renderComponent();
  await waitForNock();

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
      // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
      checkbox.find((el) => queryByText(el.parentElement, 'Hide read posts')),
    ).toBeChecked(),
  );
  await waitFor(() =>
    expect(
      checkbox.find((el) =>
        // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
        queryByText(el.parentElement, 'Open links in new tab'),
      ),
    ).not.toBeChecked(),
  );
});

const testSettingsMutation = async (
  settings: Partial<RemoteSettings>,
  updateFunc: () => Promise<void>,
  initialSettings = defaultSettings,
) => {
  renderComponent([createSettingsMock(initialSettings)]);
  await waitForNock();

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

it('should mutate density setting', () =>
  testSettingsMutation({ spaciness: 'cozy' }, async () => {
    const radio = await screen.findAllByRole('radio');
    // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
    const cozy = radio.find((el) => queryByText(el.parentElement, 'Cozy'));
    fireEvent.click(cozy);
  }));

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

it('should mutate hide read posts setting', () =>
  testSettingsMutation({ showOnlyUnreadPosts: false }, async () => {
    const checkboxes = await screen.findAllByRole('checkbox');
    const checkbox = checkboxes.find((el) =>
      // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
      queryByText(el.parentElement, 'Hide read posts'),
    ) as HTMLInputElement;
    fireEvent.click(checkbox);
  }));

it('should mutate open links in new tab setting', () =>
  testSettingsMutation({ openNewTab: true }, async () => {
    const checkboxes = await screen.findAllByRole('checkbox');
    const checkbox = checkboxes.find((el) =>
      // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
      queryByText(el.parentElement, 'Open links in new tab'),
    ) as HTMLInputElement;
    fireEvent.click(checkbox);
  }));

it('should not have the show most visited sites switch in the webapp', async () => {
  renderComponent([], null);
  const checkbox = screen.queryByText('Show most visited sites');
  expect(checkbox).not.toBeInTheDocument();
});

it('should open login when hide read posts is clicked and the user is logged out', async () => {
  renderComponent([], null);

  const [el] = await screen.findAllByLabelText('Hide read posts');
  el.click();

  await waitFor(() =>
    expect(showLogin).toBeCalledWith('settings', LoginModalMode.Default),
  );
});

it('should mutate show most visited sites setting in extension', () => {
  process.env.TARGET_BROWSER = 'chrome';
  testSettingsMutation({ showTopSites: false }, async () => {
    const checkboxes = await screen.findAllByRole('checkbox');
    const checkbox = checkboxes.find((el) =>
      // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
      queryByText(el.parentElement, 'Show most visited sites'),
    ) as HTMLInputElement;

    await waitFor(() => expect(checkbox).toBeChecked());

    fireEvent.click(checkbox);
  });
});
