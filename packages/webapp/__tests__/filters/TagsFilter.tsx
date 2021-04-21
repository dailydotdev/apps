import { MockedGraphQLResponse, mockGraphQL } from '../helpers/graphql';
import nock from 'nock';
import AuthContext from '../../contexts/AuthContext';
import React from 'react';
import {
  findAllByRole,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/preact';
import defaultUser from '../fixture/loggedUser';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LoggedUser } from '../../lib/user';
import TagsFilter from '../../components/filters/TagsFilter';
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
  feedSettings: FeedSettings = { includeTags: ['react', 'golang'] },
  tags: string[] = ['react', 'webdev', 'vue'],
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
        }}
      >
        <TagsFilter query={query} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should show followed tags', async () => {
  const res = renderComponent();
  await waitFor(() => expect(res.baseElement).not.toHaveAttribute('aria-busy'));
  const { parentElement: section } = await screen.findByText('Tags you follow');
  const buttons = await findAllByRole(section, 'button');
  const tags = ['react', 'golang'];
  buttons.map((button, index) =>
    expect(button).toHaveTextContent(`#${tags[index]}`),
  );
});

it('should show available tags', async () => {
  const res = renderComponent();
  await waitFor(() => expect(res.baseElement).not.toHaveAttribute('aria-busy'));
  const { parentElement: section } = await screen.findByText('Everything else');
  const buttons = await findAllByRole(section, 'button');
  const tags = ['webdev', 'vue'];
  buttons.map((button, index) =>
    expect(button).toHaveTextContent(`#${tags[index]}`),
  );
});

it('should show only available tags when no filters', async () => {
  const res = renderComponent([
    createAllTagsAndSettingsMock({ includeTags: [] }, [
      'react',
      'webdev',
      'vue',
    ]),
  ]);
  await waitFor(() => expect(res.baseElement).not.toHaveAttribute('aria-busy'));
  const { parentElement: section } = await screen.findByText(
    'Choose tags to follow',
  );
  const buttons = await findAllByRole(section, 'button');
  const tags = ['react', 'webdev', 'vue'];
  buttons.map((button, index) =>
    expect(button).toHaveTextContent(`#${tags[index]}`),
  );
  expect(screen.queryByText('Tags you follow')).not.toBeInTheDocument();
});

it('should show login popup when logged-out on tag click', async () => {
  renderComponent([createAllTagsMock()], null);
  await waitFor(() => expect(nock.isDone()).toBeTruthy());
  const { parentElement: section } = await screen.findByText(
    'Choose tags to follow',
  );
  const [button] = await findAllByRole(section, 'button');
  button.click();
  expect(showLogin).toBeCalledTimes(1);
});

it('should add new tag filter on tag click', async () => {
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
      variables: { filters: { includeTags: ['webdev'] } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { feedSettings: { id: defaultUser.id } } };
    },
  });
  const { parentElement: section } = await screen.findByText('Everything else');
  const [button] = await findAllByRole(section, 'button');
  button.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(async () => {
    expect(button).not.toBeInTheDocument();
  });
});

it('should remove tag filter on tag click', async () => {
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
  const { parentElement: section } = await screen.findByText('Tags you follow');
  const [button] = await findAllByRole(section, 'button');
  button.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(async () => {
    expect(button).not.toBeInTheDocument();
  });
});

it('should show filter followed tags', async () => {
  const res = renderComponent(
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
  await waitFor(() => expect(res.baseElement).not.toHaveAttribute('aria-busy'));
  await waitFor(() => expect(nock.isDone()).toBeTruthy());

  const { parentElement: section } = await screen.findByText('Tags you follow');
  const buttons = await findAllByRole(section, 'button');
  const tags = ['react'];
  buttons.map((button, index) =>
    expect(button).toHaveTextContent(`#${tags[index]}`),
  );
});

it('should show filtered available tags', async () => {
  const res = renderComponent(
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
  await waitFor(() => expect(res.baseElement).not.toHaveAttribute('aria-busy'));
  await waitFor(() => expect(nock.isDone()).toBeTruthy());

  const { parentElement: section } = await screen.findByText('Everything else');
  const buttons = await findAllByRole(section, 'button');
  const tags = ['react-native'];
  buttons.map((button, index) =>
    expect(button).toHaveTextContent(`#${tags[index]}`),
  );
});
