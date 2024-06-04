import nock from 'nock';
import React from 'react';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import AuthContext from '../../contexts/AuthContext';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '../../../__tests__/helpers/graphql';
import { LoggedUser } from '../../lib/user';
import {
  AdvancedSettings,
  AdvancedSettingsGroup,
  AllTagCategoriesData,
  FEED_SETTINGS_QUERY,
  FeedSettings,
  UPDATE_ADVANCED_SETTINGS_FILTERS_MUTATION,
} from '../../graphql/feedSettings';
import AdvancedSettingsPage from './AdvancedSettings';
import { getFeedSettingsQueryKey } from '../../hooks/useFeedSettings';
import { waitForNock } from '../../../__tests__/helpers/utilities';
import AlertContext, {
  ALERT_DEFAULTS,
  AlertContextData,
} from '../../contexts/AlertContext';

const showLogin = jest.fn();
let loggedUser: LoggedUser;

beforeEach(() => {
  loggedUser = undefined;
  jest.restoreAllMocks();
  jest.restoreAllMocks();
  jest.clearAllMocks();
  nock.cleanAll();
});

const createAdvancedSettingsAndFiltersMock = (
  feedSettings: FeedSettings = {
    advancedSettings: [{ id: 1, enabled: false }],
  },
  advancedSettings: AdvancedSettings[] = [
    {
      id: 1,
      title: 'Tech magazines',
      description: 'Description for Tech magazines',
      defaultEnabledState: true,
      group: AdvancedSettingsGroup.ContentCuration,
    },
    {
      id: 2,
      title: 'Newsletters',
      description: 'Description for Newsletters',
      defaultEnabledState: true,
      group: AdvancedSettingsGroup.ContentCuration,
    },
  ],
): MockedGraphQLResponse<AllTagCategoriesData> => ({
  request: { query: FEED_SETTINGS_QUERY },
  result: {
    data: {
      feedSettings,
      advancedSettings,
    },
  },
});

let client: QueryClient;

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createAdvancedSettingsAndFiltersMock()],
  alertsData: AlertContextData = { alerts: ALERT_DEFAULTS },
): RenderResult => {
  client = new QueryClient();
  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <AlertContext.Provider value={alertsData}>
        <AuthContext.Provider
          value={{
            isLoggedIn: !!loggedUser,
            user: loggedUser,
            shouldShowLogin: false,
            showLogin,
            logout: jest.fn(),
            updateUser: jest.fn(),
            tokenRefreshed: true,
            getRedirectUri: jest.fn(),
            trackingId: '',
            loginState: null,
            closeLogin: jest.fn(),
          }}
        >
          <AdvancedSettingsPage />
        </AuthContext.Provider>
      </AlertContext.Provider>
    </QueryClientProvider>,
  );
};

it('should display advanced settings title and description', async () => {
  loggedUser = defaultUser;
  const { baseElement } = renderComponent();
  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));
  expect(await screen.findByText('Tech magazines')).toBeInTheDocument();
  expect(
    await screen.findByText('Description for Tech magazines'),
  ).toBeInTheDocument();
  const [checkbox] = await screen.findAllByRole('checkbox');
  await waitFor(() => expect(checkbox).not.toBeChecked());
});

it('should mutate update feed advanced settings', async () => {
  loggedUser = defaultUser;
  const updateAlerts = jest.fn();
  let advancedSettingsMutationCalled = false;

  const { baseElement } = renderComponent(
    [createAdvancedSettingsAndFiltersMock()],
    {
      alerts: { filter: true },
      updateAlerts,
    },
  );

  await waitForNock();

  await waitFor(async () => {
    const data = await client.getQueryData(
      getFeedSettingsQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });

  const param = { id: 2, enabled: false };

  mockGraphQL({
    request: {
      query: UPDATE_ADVANCED_SETTINGS_FILTERS_MUTATION,
      variables: { settings: [param] },
    },
    result: () => {
      advancedSettingsMutationCalled = true;
      return { data: { advancedSettings: [{ id: 1, enabled: false }, param] } };
    },
  });

  const checkbox = (await screen.findAllByRole('checkbox'))[1];
  fireEvent.click(checkbox);

  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));
  await waitFor(() => expect(advancedSettingsMutationCalled).toBeTruthy());
  await waitFor(() => expect(updateAlerts).toBeCalled());
  await waitFor(() => expect(checkbox).not.toBeChecked());
});
