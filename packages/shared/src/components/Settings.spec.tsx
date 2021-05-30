import React, { ReactElement } from 'react';
import nock from 'nock';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '../../__tests__/helpers/graphql';
import {
  fireEvent,
  queryByText,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import useSettings from '../hooks/useSettings';
import SettingsContext from '../contexts/SettingsContext';
import Settings from './Settings';
import {
  RemoteSettings,
  UPDATE_USER_SETTINGS_MUTATION,
  USER_SETTINGS_QUERY,
  UserSettingsData,
} from '../graphql/settings';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LoggedUser } from '../lib/user';
import defaultUser from '../../__tests__/fixture/loggedUser';
import AuthContext from '../contexts/AuthContext';
import { LoginModalMode } from '../types/LoginModalMode';

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

const SettingsWithContext = ({
  userId,
}: {
  userId: string | null;
}): ReactElement => {
  const settingsContext = useSettings(userId, true);
  return (
    <SettingsContext.Provider value={settingsContext}>
      <Settings />
    </SettingsContext.Provider>
  );
};

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
        }}
      >
        <SettingsWithContext userId={user?.id} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should fetch remote settings', async () => {
  renderComponent();
  await waitFor(() => expect(nock.isDone()).toBeTruthy());

  const radio = await screen.findAllByRole('radio');
  await waitFor(() =>
    expect(
      // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
      radio.find((el) => queryByText(el.parentElement, 'Roomy')),
    ).toBeChecked(),
  );

  const checkbox = await screen.findAllByRole('checkbox');
  await waitFor(() =>
    expect(
      // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
      checkbox.find((el) => queryByText(el.parentElement, 'Light theme')),
    ).toBeChecked(),
  );
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
  await waitFor(() => expect(nock.isDone()).toBeTruthy());

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
    const checkbox = await screen.findAllByRole('checkbox');
    await waitFor(() =>
      expect(
        // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
        checkbox.find((el) => queryByText(el.parentElement, 'Light theme')),
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
    const checkboxes = await screen.findAllByRole('checkbox');
    const checkbox = checkboxes.find((el) =>
      // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
      queryByText(el.parentElement, 'Light theme'),
    ) as HTMLInputElement;
    fireEvent.click(checkbox);
  }));

it('should set light to dark mode setting', () =>
  testSettingsMutation(
    { theme: 'bright' },
    async () => {
      const checkboxes = await screen.findAllByRole('checkbox');
      const checkbox = checkboxes.find((el) =>
        // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
        queryByText(el.parentElement, 'Light theme'),
      ) as HTMLInputElement;
      fireEvent.click(checkbox);
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

it('should open login when hide read posts is clicked and the user is logged out', async () => {
  renderComponent([], null);
  const checkboxes = await screen.findAllByRole('checkbox');
  const checkbox = checkboxes.find((el) =>
    // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
    queryByText(el.parentElement, 'Hide read posts'),
  ) as HTMLInputElement;
  fireEvent.click(checkbox);
  await waitFor(() => expect(showLogin).toBeCalledWith(LoginModalMode.Default));
});

it('should mutate open links in new tab setting', () =>
  testSettingsMutation({ openNewTab: true }, async () => {
    const checkboxes = await screen.findAllByRole('checkbox');
    const checkbox = checkboxes.find((el) =>
      // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
      queryByText(el.parentElement, 'Open links in new tab'),
    ) as HTMLInputElement;
    fireEvent.click(checkbox);
  }));
