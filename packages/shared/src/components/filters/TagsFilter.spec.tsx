import nock from 'nock';
import React from 'react';
import {
  render,
  RenderResult,
  waitFor,
  findAllByRole,
  screen,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import AuthContext from '../../contexts/AuthContext';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '../../../__tests__/helpers/graphql';
import { LoggedUser } from '../../lib/user';
import TagsFilter from './TagsFilter';
import {
  ADD_FILTERS_TO_FEED_MUTATION,
  AllTagCategoriesData,
  FEED_SETTINGS_QUERY,
  FeedSettings,
  REMOVE_FILTERS_FROM_FEED_MUTATION,
  TagCategory,
} from '../../graphql/feedSettings';
import { waitForNock } from '../../../__tests__/helpers/utilities';
import { getFeedSettingsQueryKey } from '../../hooks/useMutateFilters';
import AlertContext, {
  AlertContextData,
  ALERT_DEFAULTS,
} from '../../contexts/AlertContext';

const showLogin = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
});

const createAllTagCategoriesMock = (
  feedSettings: FeedSettings = {
    includeTags: ['react', 'golang'],
  },
  loggedIn = true,
  tagsCategories: TagCategory[] = [
    {
      id: 'FE',
      title: 'Frontend',
      tags: ['react', 'webdev', 'vue', 'golang'],
      emoji: '🦄',
    },
  ],
): MockedGraphQLResponse<AllTagCategoriesData> => ({
  request: { query: FEED_SETTINGS_QUERY, variables: { loggedIn } },
  result: {
    data: {
      feedSettings,
      tagsCategories,
    },
  },
});

let client: QueryClient;

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createAllTagCategoriesMock()],
  user: LoggedUser = defaultUser,
  alertsData: AlertContextData = { alerts: ALERT_DEFAULTS },
): RenderResult => {
  client = new QueryClient();
  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <AlertContext.Provider value={alertsData}>
        <AuthContext.Provider
          value={{
            user,
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
          <TagsFilter />
        </AuthContext.Provider>
      </AlertContext.Provider>
    </QueryClientProvider>,
  );
};

it('should show tag categories', async () => {
  const { baseElement } = renderComponent();
  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));

  const {
    parentElement: { parentElement: summary },
  } = await screen.findByText('Frontend');

  expect(summary).toBeInTheDocument();
});

it('should open the details element on category click', async () => {
  const { baseElement } = renderComponent();
  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));

  const {
    parentElement: { parentElement: summary },
  } = await screen.findByText('Frontend');

  summary.click();

  const buttonDiv = await screen.findByTestId('tagCategoryTags');
  expect(buttonDiv).toBeVisible();
});

it('should show the tags for a open category', async () => {
  const { baseElement } = renderComponent();
  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));

  const {
    parentElement: { parentElement: summary },
  } = await screen.findByText('Frontend');

  summary.click();

  const buttonDiv = await screen.findByTestId('tagCategoryTags');
  expect(buttonDiv).toBeVisible();

  // eslint-disable-next-line testing-library/prefer-screen-queries
  const buttons = await findAllByRole(buttonDiv, 'button');
  const tags = ['react', 'webdev', 'vue', 'golang'];
  buttons.map((button, index) =>
    expect(button).toHaveTextContent(`#${tags[index]}`),
  );
});

it('should show login when not logged in', async () => {
  renderComponent([createAllTagCategoriesMock(null, false)], null);
  await waitForNock();
  const button = await screen.findByText('Follow all');
  button.click();
  expect(showLogin).toBeCalledTimes(1);
});

it('should follow a tag on click and remove filter alert if enabled', async () => {
  const disableAlertFilterMock = jest.fn();
  const addFilterMutation = jest.fn();

  const { baseElement } = renderComponent(
    [createAllTagCategoriesMock()],
    defaultUser,
    { alerts: { filter: true }, disableFilterAlert: disableAlertFilterMock },
  );

  mockGraphQL({
    request: {
      query: ADD_FILTERS_TO_FEED_MUTATION,
      variables: { filters: { includeTags: ['webdev'] } },
    },
    result: () => {
      addFilterMutation();
      return { data: { feedSettings: { id: defaultUser.id } } };
    },
  });

  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));

  const {
    parentElement: { parentElement: summary },
  } = await screen.findByText('Frontend');

  summary.click();

  const buttonDiv = await screen.findByTestId('tagCategoryTags');
  expect(buttonDiv).toBeVisible();

  // eslint-disable-next-line testing-library/prefer-screen-queries
  const button = await screen.findByText('#webdev');
  button.click();

  await waitFor(() => expect(addFilterMutation).toBeCalled());
  await waitFor(() => expect(disableAlertFilterMock).toBeCalled());
});

it('should unfollow a tag on click', async () => {
  let mutationCalled = false;

  const { baseElement } = renderComponent();

  await waitFor(async () => {
    const data = await client.getQueryData(
      getFeedSettingsQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });
  mockGraphQL({
    request: {
      query: REMOVE_FILTERS_FROM_FEED_MUTATION,
      variables: { filters: { includeTags: ['react'] } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { feedSettings: { id: defaultUser.id } } };
    },
  });

  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));

  const {
    parentElement: { parentElement: summary },
  } = await screen.findByText('Frontend');

  summary.click();

  const buttonDiv = await screen.findByTestId('tagCategoryTags');
  expect(buttonDiv).toBeVisible();

  // eslint-disable-next-line testing-library/prefer-screen-queries
  const button = await screen.findByText('#react');
  button.click();

  await waitFor(() => expect(mutationCalled).toBeTruthy());
});

it('should clear all tags on click', async () => {
  let mutationCalled = false;

  const { baseElement } = renderComponent();

  await waitFor(async () => {
    const data = await client.getQueryData(
      getFeedSettingsQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });
  mockGraphQL({
    request: {
      query: REMOVE_FILTERS_FROM_FEED_MUTATION,
      variables: { filters: { includeTags: ['react', 'golang'] } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { feedSettings: { id: defaultUser.id } } };
    },
  });

  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));

  const button = await screen.findByText('Clear (2)');
  button.click();

  await waitFor(() => expect(mutationCalled).toBeTruthy());
});
