import React, { ReactElement } from 'react';
import nock from 'nock';
import { MockedGraphQLResponse, mockGraphQL } from './helpers/graphql';
import {
  fireEvent,
  queryByText,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/preact';
import useSettings from '../hooks/useSettings';
import SettingsContext from '../contexts/SettingsContext';
import Settings from '../components/Settings';
import {
  RemoteSettings,
  UPDATE_USER_SETTINGS_MUTATION,
  USER_SETTINGS_QUERY,
  UserSettingsData,
} from '../graphql/settings';
import { QueryClient, QueryClientProvider } from 'react-query';

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
});

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
  userId: string | null = '1',
): RenderResult => {
  mocks.forEach(mockGraphQL);
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <SettingsWithContext userId={userId} />
    </QueryClientProvider>,
  );
};

it('should fetch remote settings', async () => {
  renderComponent();
  await waitFor(() => expect(nock.isDone()).toBeTruthy());

  const radio = await screen.findAllByRole('radio');
  await waitFor(() =>
    expect(
      radio.find((el) => queryByText(el.parentElement, 'Roomy')),
    ).toBeChecked(),
  );

  const checkbox = await screen.findAllByRole('checkbox');
  await waitFor(() =>
    expect(
      checkbox.find((el) => queryByText(el.parentElement, 'Light theme')),
    ).toBeChecked(),
  );
  await waitFor(() =>
    expect(
      checkbox.find((el) => queryByText(el.parentElement, 'Hide read posts')),
    ).toBeChecked(),
  );
  await waitFor(() =>
    expect(
      checkbox.find((el) =>
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
    const cozy = radio.find((el) => queryByText(el.parentElement, 'Cozy'));
    fireEvent.change(cozy);
  }));

it('should set theme to dark mode setting', () =>
  testSettingsMutation({ theme: 'darcula' }, async () => {
    const checkboxes = await screen.findAllByRole('checkbox');
    const checkbox = checkboxes.find((el) =>
      queryByText(el.parentElement, 'Light theme'),
    ) as HTMLInputElement;
    fireEvent.change(checkbox);
  }));

it('should set light to dark mode setting', () =>
  testSettingsMutation(
    { theme: 'bright' },
    async () => {
      const checkboxes = await screen.findAllByRole('checkbox');
      const checkbox = checkboxes.find((el) =>
        queryByText(el.parentElement, 'Light theme'),
      ) as HTMLInputElement;
      fireEvent.change(checkbox);
    },
    { ...defaultSettings, theme: 'darcula' },
  ));

it('should mutate hide read posts setting', () =>
  testSettingsMutation({ showOnlyUnreadPosts: false }, async () => {
    const checkboxes = await screen.findAllByRole('checkbox');
    const checkbox = checkboxes.find((el) =>
      queryByText(el.parentElement, 'Hide read posts'),
    ) as HTMLInputElement;
    fireEvent.change(checkbox);
  }));

it('should mutate open links in new tab setting', () =>
  testSettingsMutation({ openNewTab: true }, async () => {
    const checkboxes = await screen.findAllByRole('checkbox');
    const checkbox = checkboxes.find((el) =>
      queryByText(el.parentElement, 'Open links in new tab'),
    ) as HTMLInputElement;
    fireEvent.change(checkbox);
  }));
