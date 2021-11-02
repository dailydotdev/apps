import nock from 'nock';
import React from 'react';
import {
  render,
  RenderResult,
  screen,
  waitFor,
  fireEvent,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import AuthContext from '../../contexts/AuthContext';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '../../../__tests__/helpers/graphql';
import { LoggedUser } from '../../lib/user';
import {
  FEED_SETTINGS_QUERY,
  FeedSettings,
  AllTagCategoriesData,
  AdvancedSettings,
  UPDATE_ADVANCED_SETTINGS_FILTERS_MUTATION,
} from '../../graphql/feedSettings';
import AdvancedSettingsPage from './AdvancedSettings';
import { getFeedSettingsQueryKey } from '../../hooks/useMutateFilters';
import { waitForNock } from '../../../__tests__/helpers/utilities';

const showLogin = jest.fn();
let loggedUser: LoggedUser;

beforeEach(() => {
  loggedUser = undefined;
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
    },
  ],
): MockedGraphQLResponse<AllTagCategoriesData> => ({
  request: {
    query: FEED_SETTINGS_QUERY,
    variables: { loggedIn: !!loggedUser },
  },
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
): RenderResult => {
  client = new QueryClient();
  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
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
  const checkbox = await screen.findByRole('checkbox');
  await waitFor(() => expect(checkbox).not.toBeChecked());
});

it('should display advanced settings title and description including the appropriate enabled state using unregistered user', async () => {
  const { baseElement } = renderComponent([
    createAdvancedSettingsAndFiltersMock({}),
  ]);
  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));
  expect(await screen.findByText('Tech magazines')).toBeInTheDocument();
  expect(
    await screen.findByText('Description for Tech magazines'),
  ).toBeInTheDocument();
  const checkbox = await screen.findByRole('checkbox');
  await waitFor(() => expect(checkbox).toBeChecked());
});

it('should mutate update feed advanced settings', async () => {
  loggedUser = defaultUser;
  let mutationCalled = false;

  const { baseElement } = renderComponent();

  await waitForNock();

  await waitFor(async () => {
    const data = await client.getQueryData(
      getFeedSettingsQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });

  const params = [{ id: 1, enabled: true }];

  mockGraphQL({
    request: {
      query: UPDATE_ADVANCED_SETTINGS_FILTERS_MUTATION,
      variables: { settings: params },
    },
    result: () => {
      mutationCalled = true;
      return { data: { advancedSettings: params } };
    },
  });

  const checkbox = await screen.findByRole('checkbox');
  fireEvent.click(checkbox);

  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(() => expect(checkbox).toBeChecked());
});
