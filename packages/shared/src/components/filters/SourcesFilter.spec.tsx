import nock from 'nock';
import React from 'react';
import {
  findAllByRole,
  queryByText,
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
import SourcesFilter from './SourcesFilter';
import {
  ADD_FILTERS_TO_FEED_MUTATION,
  ALL_SOURCES_AND_SETTINGS_QUERY,
  ALL_SOURCES_QUERY,
  FeedSettings,
  FeedSettingsData,
  REMOVE_FILTERS_FROM_FEED_MUTATION,
  SourcesData,
} from '../../graphql/feedSettings';
import { Source } from '../../graphql/sources';
import { getSourcesSettingsQueryKey } from '../../hooks/useMutateFilters';

const showLogin = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
});

const allSources: Source[] = [
  { id: 'react', name: 'React', image: 'https://reactjs.org' },
  { id: 'golang', name: 'Go', image: 'https://golang.org/' },
  { id: 'vuejs', name: 'Vue.js', image: 'https://vuejs.org/' },
];

const createAllSourcesAndSettingsMock = (
  feedSettings: FeedSettings = { excludeSources: [allSources[0]] },
  sources: Source[] = allSources,
): MockedGraphQLResponse<FeedSettingsData & SourcesData> => ({
  request: { query: ALL_SOURCES_AND_SETTINGS_QUERY },
  result: {
    data: {
      feedSettings,
      sources: {
        pageInfo: {
          hasNextPage: true,
          endCursor: '',
        },
        edges: sources.map((s) => ({ node: s })),
      },
    },
  },
});

const createAllSourcesMock = (
  sources: Source[] = allSources,
): MockedGraphQLResponse<SourcesData> => ({
  request: { query: ALL_SOURCES_QUERY },
  result: {
    data: {
      sources: {
        pageInfo: {
          hasNextPage: true,
          endCursor: '',
        },
        edges: sources.map((s) => ({ node: s })),
      },
    },
  },
});

let client: QueryClient;

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createAllSourcesAndSettingsMock()],
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
          trackingId: '',
          loginState: null,
          closeLogin: jest.fn(),
          getRedirectUri: jest.fn(),
        }}
      >
        <SourcesFilter query={query} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should show followed sources', async () => {
  const { baseElement } = renderComponent();
  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));
  const {
    parentElement: { parentElement: section },
  } = await screen.findByText('All sources (2)');
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const buttons = await findAllByRole(section, 'link');
  const sources = ['Go', 'Vue.js'];
  buttons.map((button, index) =>
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(queryByText(button, sources[index])).toBeInTheDocument(),
  );
});

it('should show unfollowed sources', async () => {
  const { baseElement } = renderComponent();
  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));
  const {
    parentElement: { parentElement: section },
  } = await screen.findByText('Blocked sources (1)');
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const buttons = await findAllByRole(section, 'link');
  const sources = ['React'];
  buttons.map((button, index) =>
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(queryByText(button, sources[index])).toBeInTheDocument(),
  );
});

it('should show only followed sources when no filters', async () => {
  const { baseElement } = renderComponent([
    createAllSourcesAndSettingsMock({ excludeSources: [] }, allSources),
  ]);
  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));
  const {
    parentElement: { parentElement: section },
  } = await screen.findByText('All sources (3)');
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const buttons = await findAllByRole(section, 'link');
  buttons.map((button, index) =>
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(queryByText(button, allSources[index].name)).toBeInTheDocument(),
  );
  expect(screen.queryByText('Blocked sources (0)')).not.toBeInTheDocument();
});

it('should show login popup when logged-out on source click', async () => {
  renderComponent([createAllSourcesMock()], null);
  await waitFor(() => expect(nock.isDone()).toBeTruthy());
  const {
    parentElement: { parentElement: section },
  } = await screen.findByText('All sources (3)');
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const [button] = await findAllByRole(section, 'button');
  button.click();
  expect(showLogin).toBeCalledTimes(1);
});

it('should add source filter on source click', async () => {
  let mutationCalled = false;
  renderComponent();
  await waitFor(async () => {
    const data = await client.getQueryData(
      getSourcesSettingsQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });
  mockGraphQL({
    request: {
      query: ADD_FILTERS_TO_FEED_MUTATION,
      variables: { filters: { excludeSources: ['golang'] } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { feedSettings: { id: defaultUser.id } } };
    },
  });
  const {
    parentElement: { parentElement: section },
  } = await screen.findByText('All sources (2)');
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const [button] = await findAllByRole(section, 'button');
  button.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(async () => {
    expect(button).not.toBeInTheDocument();
  });
});

it('should remove source filter on source click', async () => {
  let mutationCalled = false;
  renderComponent();
  await waitFor(async () => {
    const data = await client.getQueryData(
      getSourcesSettingsQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });
  mockGraphQL({
    request: {
      query: REMOVE_FILTERS_FROM_FEED_MUTATION,
      variables: { filters: { excludeSources: ['react'] } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { feedSettings: { id: defaultUser.id } } };
    },
  });
  const {
    parentElement: { parentElement: section },
  } = await screen.findByText('Blocked sources (1)');
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const [button] = await findAllByRole(section, 'button');
  button.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(async () => {
    expect(button).not.toBeInTheDocument();
  });
});

it('should show filtered followed sources', async () => {
  const { baseElement } = renderComponent(
    [createAllSourcesAndSettingsMock()],
    defaultUser,
    'go',
  );
  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));

  const {
    parentElement: { parentElement: section },
  } = await screen.findByText('All sources (1)');
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const buttons = await findAllByRole(section, 'link');
  const sources = ['Go'];
  buttons.map((button, index) =>
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(queryByText(button, sources[index])).toBeInTheDocument(),
  );
});

it('should show filtered unfollowed sources', async () => {
  const { baseElement } = renderComponent(
    [createAllSourcesAndSettingsMock()],
    defaultUser,
    're',
  );
  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));

  const {
    parentElement: { parentElement: section },
  } = await screen.findByText('Blocked sources (1)');
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const buttons = await findAllByRole(section, 'link');
  const sources = ['React'];
  buttons.map((button, index) =>
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(queryByText(button, sources[index])).toBeInTheDocument(),
  );
});
