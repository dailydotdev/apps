import nock from 'nock';
import React from 'react';
import {
  findAllByRole,
  render,
  RenderResult,
  screen,
  waitFor,
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
  ALL_TAGS_AND_SETTINGS_QUERY,
  ALL_TAGS_QUERY,
  FeedSettings,
  FeedSettingsData,
  REMOVE_FILTERS_FROM_FEED_MUTATION,
  SEARCH_TAGS_QUERY,
  TagsData,
} from '../../graphql/feedSettings';
import { getTagsSettingsQueryKey } from '../../hooks/useMutateFilters';

const showLogin = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
});

const createAllTagsAndSettingsMock = (
  feedSettings: FeedSettings = {
    includeTags: ['react', 'golang'],
    blockedTags: ['webdev'],
  },
  tags: string[] = ['react', 'webdev', 'vue', 'golang'],
): MockedGraphQLResponse<FeedSettingsData & TagsData> => ({
  request: { query: ALL_TAGS_AND_SETTINGS_QUERY },
  result: {
    data: {
      feedSettings,
      tags: tags.map((tag) => ({ name: tag })),
    },
  },
});

const createAllTagsMock = (
  tags: string[] = ['react', 'webdev', 'vue', 'golang'],
): MockedGraphQLResponse<TagsData> => ({
  request: { query: ALL_TAGS_QUERY },
  result: {
    data: {
      tags: tags.map((tag) => ({ name: tag })),
    },
  },
});

let client: QueryClient;

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createAllTagsAndSettingsMock()],
  user: LoggedUser = defaultUser,
  query?: string,
): RenderResult => {
  client = new QueryClient();
  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
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
        <TagsFilter query={query} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should show followed tags', async () => {
  const { baseElement } = renderComponent();
  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));
  const {
    parentElement: { parentElement: section },
  } = await screen.findByText('Followed tags (2)');
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const buttons = await findAllByRole(section, 'link');
  const tags = ['react', 'golang'];
  buttons.map((button, index) =>
    expect(button).toHaveTextContent(`#${tags[index]}`),
  );
});

it('should show available tags', async () => {
  const { baseElement } = renderComponent();
  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));
  const {
    parentElement: { parentElement: section },
  } = await screen.findByText('All tags (1)');
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const buttons = await findAllByRole(section, 'link');
  const tags = ['vue'];
  buttons.map((button, index) =>
    expect(button).toHaveTextContent(`#${tags[index]}`),
  );
});

it('should show blocked tags', async () => {
  const { baseElement } = renderComponent();
  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));
  const {
    parentElement: { parentElement: section },
  } = await screen.findByText('Blocked tags (1)');
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const buttons = await findAllByRole(section, 'link');
  const tags = ['webdev'];
  buttons.map((button, index) =>
    expect(button).toHaveTextContent(`#${tags[index]}`),
  );
});

it('should show only available tags when no filters', async () => {
  const { baseElement } = renderComponent([
    createAllTagsAndSettingsMock({ includeTags: [], blockedTags: [] }, [
      'react',
      'webdev',
      'vue',
    ]),
  ]);
  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));
  const {
    parentElement: { parentElement: section },
  } = await screen.findByText('All tags (3)');
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const buttons = await findAllByRole(section, 'link');
  const tags = ['react', 'webdev', 'vue'];
  buttons.map((button, index) =>
    expect(button).toHaveTextContent(`#${tags[index]}`),
  );
  expect(screen.queryByText('Followed tags (0)')).not.toBeInTheDocument();
  expect(screen.queryByText('Blocked tags (0)')).not.toBeInTheDocument();
});

it('should show login popup when logged-out on follow click', async () => {
  renderComponent([createAllTagsMock()], null);
  await waitFor(() => expect(nock.isDone()).toBeTruthy());
  const {
    parentElement: { parentElement: section },
  } = await screen.findByText('All tags (4)');
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const [button] = await findAllByRole(section, 'button');
  button.click();
  const contextBtn = await screen.findByText('Follow');
  contextBtn.click();
  expect(showLogin).toBeCalledTimes(1);
});

it('should show login popup when logged-out on block click', async () => {
  renderComponent([createAllTagsMock()], null);
  await waitFor(() => expect(nock.isDone()).toBeTruthy());
  const {
    parentElement: { parentElement: section },
  } = await screen.findByText('All tags (4)');
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const [button] = await findAllByRole(section, 'button');
  button.click();
  const contextBtn = await screen.findByText('Block');
  contextBtn.click();
  expect(showLogin).toBeCalledTimes(1);
});

it('should follow tag on follow button click', async () => {
  let mutationCalled = false;
  renderComponent();
  await waitFor(async () => {
    const data = await client.getQueryData(
      getTagsSettingsQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });
  mockGraphQL({
    request: {
      query: ADD_FILTERS_TO_FEED_MUTATION,
      variables: { filters: { includeTags: ['vue'] } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { feedSettings: { id: defaultUser.id } } };
    },
  });
  const {
    parentElement: { parentElement: section },
  } = await screen.findByText('All tags (1)');
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const [button] = await findAllByRole(section, 'button');
  button.click();
  const contextBtn = await screen.findByText('Follow');
  contextBtn.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(async () => {
    expect(button).not.toBeInTheDocument();
  });
});

it('should block tag on block button click', async () => {
  let mutationCalled = false;
  renderComponent();
  await waitFor(async () => {
    const data = await client.getQueryData(
      getTagsSettingsQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });
  mockGraphQL({
    request: {
      query: ADD_FILTERS_TO_FEED_MUTATION,
      variables: { filters: { blockedTags: ['vue'] } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { feedSettings: { id: defaultUser.id } } };
    },
  });
  const {
    parentElement: { parentElement: section },
  } = await screen.findByText('All tags (1)');
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const [button] = await findAllByRole(section, 'button');
  button.click();
  const contextBtn = await screen.findByText('Block');
  contextBtn.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(async () => {
    expect(button).not.toBeInTheDocument();
  });
});

it('should unfollow tag on button click', async () => {
  let mutationCalled = false;
  renderComponent();
  await waitFor(async () => {
    const data = await client.getQueryData(
      getTagsSettingsQueryKey(defaultUser),
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
  const {
    parentElement: { parentElement: section },
  } = await screen.findByText('Followed tags (2)');
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const [button] = await findAllByRole(section, 'button');
  button.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(async () => {
    expect(button).not.toBeInTheDocument();
  });
});

it('should unblock tag on button click', async () => {
  let mutationCalled = false;
  renderComponent();
  await waitFor(async () => {
    const data = await client.getQueryData(
      getTagsSettingsQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });
  mockGraphQL({
    request: {
      query: REMOVE_FILTERS_FROM_FEED_MUTATION,
      variables: { filters: { blockedTags: ['webdev'] } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { feedSettings: { id: defaultUser.id } } };
    },
  });
  const {
    parentElement: { parentElement: section },
  } = await screen.findByText('Blocked tags (1)');
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const [button] = await findAllByRole(section, 'button');
  button.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(async () => {
    expect(button).not.toBeInTheDocument();
  });
});

it('should show filtered followed tags', async () => {
  const { baseElement } = renderComponent(
    [
      createAllTagsAndSettingsMock(),
      {
        request: {
          query: SEARCH_TAGS_QUERY,
          variables: { query: 'r' },
        },
        result: {
          data: {
            searchTags: { tags: [{ name: 'react' }, { name: 'react-native' }] },
          },
        },
      },
    ],
    defaultUser,
    'r',
  );
  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));
  await waitFor(() => expect(nock.isDone()).toBeTruthy());

  const {
    parentElement: { parentElement: section },
  } = await screen.findByText('Followed tags (1)');
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const buttons = await findAllByRole(section, 'link');
  const tags = ['react'];
  buttons.map((button, index) =>
    expect(button).toHaveTextContent(`#${tags[index]}`),
  );
});

it('should show filtered available tags', async () => {
  const { baseElement } = renderComponent(
    [
      createAllTagsAndSettingsMock(),
      {
        request: {
          query: SEARCH_TAGS_QUERY,
          variables: { query: 'r' },
        },
        result: {
          data: {
            searchTags: { tags: [{ name: 'react' }, { name: 'react-native' }] },
          },
        },
      },
    ],
    defaultUser,
    'r',
  );
  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));
  await waitFor(() => expect(nock.isDone()).toBeTruthy());

  const {
    parentElement: { parentElement: section },
  } = await screen.findByText('All tags (1)');
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const buttons = await findAllByRole(section, 'link');
  const tags = ['react-native'];
  buttons.map((button, index) =>
    expect(button).toHaveTextContent(`#${tags[index]}`),
  );
});
