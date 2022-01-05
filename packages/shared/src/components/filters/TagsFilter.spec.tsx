import nock from 'nock';
import React from 'react';
import {
  render,
  RenderResult,
  waitFor,
  findAllByRole,
  screen,
  fireEvent,
} from '@testing-library/react';
import { act } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from 'react-query';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import AuthContext from '../../contexts/AuthContext';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '../../../__tests__/helpers/graphql';
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
import {
  getFeedSettingsQueryKey,
  getLocalFeedSettings,
} from '../../hooks/useFeedSettings';
import { AlertContextProvider } from '../../contexts/AlertContext';
import { Alerts, UPDATE_ALERTS } from '../../graphql/alerts';

const showLogin = jest.fn();
const updateAlerts = jest.fn();
let loggedUser = defaultUser;

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  loggedUser = defaultUser;
});

const createAllTagCategoriesMock = (
  feedSettings: FeedSettings = {
    includeTags: ['react', 'golang'],
  },
  loggedIn = !!loggedUser,
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

const defaultAlerts: Alerts = { filter: false };

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createAllTagCategoriesMock()],
  alertsData = defaultAlerts,
): RenderResult => {
  client = new QueryClient();
  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <AlertContextProvider
        alerts={alertsData}
        updateAlerts={updateAlerts}
        loadedAlerts
      >
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
            loadedUserFromCache: true,
          }}
        >
          <TagsFilter />
        </AuthContext.Provider>
      </AlertContextProvider>
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

it('should follow a tag on click and remove filter alert if enabled', async () => {
  let alertsMutationCalled = false;
  let addFilterMutationCalled = false;

  const { baseElement } = renderComponent([createAllTagCategoriesMock()], {
    filter: true,
  });

  mockGraphQL({
    request: {
      query: UPDATE_ALERTS,
      variables: { data: { filter: false } },
    },
    result: () => {
      alertsMutationCalled = true;
      return { data: { _: true } };
    },
  });

  mockGraphQL({
    request: {
      query: ADD_FILTERS_TO_FEED_MUTATION,
      variables: { filters: { includeTags: ['webdev'] } },
    },
    result: () => {
      addFilterMutationCalled = true;
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

  await act(async () => {
    // eslint-disable-next-line testing-library/prefer-screen-queries
    const button = await screen.findByText('#webdev');
    fireEvent.click(button);
  });

  await waitFor(() => expect(addFilterMutationCalled).toBeTruthy());
  await waitFor(() => expect(alertsMutationCalled).toBeTruthy());
  await waitFor(() => expect(updateAlerts).toBeCalled());
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

it('should utilize local storage to follow a tag when not logged in', async () => {
  loggedUser = null;
  renderComponent([createAllTagCategoriesMock(null)]);
  await waitForNock();
  const category = await screen.findByText('Frontend');
  // eslint-disable-next-line testing-library/no-node-access
  const container = category.parentElement.parentElement;

  container.click();

  const button = await screen.findByTestId('tagCategoryTags');
  expect(button).toBeVisible();

  const webdev = await waitFor(() => screen.findByText('#webdev'));
  expect(webdev).toBeVisible();
  fireEvent.click(webdev);

  const feedSettings = getLocalFeedSettings();
  expect(feedSettings.includeTags.length).toEqual(1);
});

it('should utilize local storage to unfollow a tag when not logged in', async () => {
  loggedUser = null;
  const unfollow = 'react';
  renderComponent();
  await waitForNock();
  const category = await screen.findByText('Frontend');
  // eslint-disable-next-line testing-library/no-node-access
  const container = category.parentElement.parentElement;

  container.click();

  const button = await screen.findByTestId('tagCategoryTags');
  expect(button).toBeVisible();

  const webdev = await waitFor(() => screen.findByText(`#${unfollow}`));
  expect(webdev).toBeVisible();
  fireEvent.click(webdev);

  const feedSettings = getLocalFeedSettings();
  expect(feedSettings.includeTags.find((tag) => tag === unfollow)).toBeFalsy();
});
