import { FeedData } from '../graphql/posts';
import { MockedGraphQLResponse, mockGraphQL } from './helpers/graphql';
import { TAG_FEED_QUERY } from '../graphql/feed';
import nock from 'nock';
import AuthContext from '../contexts/AuthContext';
import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import defaultFeedPage from './fixture/feed';
import defaultUser from './fixture/loggedUser';
import ad from './fixture/ad';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LoggedUser } from '../lib/user';
import TagPage from '../pages/tags/[tag]';
import { NextRouter } from 'next/router';
import {
  ADD_FILTERS_TO_FEED_MUTATION,
  FeedSettings,
  FeedSettingsData,
  TAGS_SETTINGS_QUERY,
} from '../graphql/feedSettings';
import { getTagsSettingsQueryKey } from '../hooks/useMutateFilters';

const showLogin = jest.fn();

jest.mock('next/router', () => ({
  useRouter: jest.fn().mockImplementation(
    () =>
      (({
        isFallback: false,
        query: {},
      } as unknown) as NextRouter),
  ),
}));

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
});

const createFeedMock = (
  page = defaultFeedPage,
  query: string = TAG_FEED_QUERY,
  variables: unknown = {
    first: 7,
    loggedIn: true,
    tag: 'react',
  },
): MockedGraphQLResponse<FeedData> => ({
  request: {
    query,
    variables,
  },
  result: {
    data: {
      page,
    },
  },
});

const createTagsSettingsMock = (
  feedSettings: FeedSettings = { includeTags: [] },
): MockedGraphQLResponse<FeedSettingsData> => ({
  request: { query: TAGS_SETTINGS_QUERY },
  result: {
    data: {
      feedSettings,
    },
  },
});

let client: QueryClient;

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createFeedMock(), createTagsSettingsMock()],
  user: LoggedUser = defaultUser,
): RenderResult => {
  client = new QueryClient();

  mocks.forEach(mockGraphQL);
  nock('http://localhost:3000').get('/v1/a').reply(200, [ad]);
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
        <TagPage tag="react" />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should request tag feed', async () => {
  renderComponent();
  await waitFor(() => expect(nock.isDone()).toBeTruthy());
  await waitFor(async () => {
    const elements = await screen.findAllByTestId('postItem');
    expect(elements.length).toBeTruthy();
  });
});

it('should show add to feed button', async () => {
  renderComponent();
  await waitFor(() => expect(nock.isDone()).toBeTruthy());
  const [button] = await screen.findAllByLabelText('Add tag to feed');
  expect(button).toHaveStyleRule('visibility', 'visible');
});

it('should not show add to feed button', async () => {
  renderComponent([
    createFeedMock(),
    createTagsSettingsMock({ includeTags: ['react'] }),
  ]);
  await waitFor(() => expect(nock.isDone()).toBeTruthy());
  await waitFor(async () => {
    const [button] = await screen.findAllByLabelText('Add tag to feed');
    expect(button).toHaveStyleRule('visibility', 'hidden');
  });
});

it('should show add to feed button when logged-out', async () => {
  renderComponent(
    [
      createFeedMock(defaultFeedPage, TAG_FEED_QUERY, {
        first: 7,
        loggedIn: false,
        tag: 'react',
      }),
    ],
    null,
  );
  await waitFor(() => expect(nock.isDone()).toBeTruthy());
  const [button] = await screen.findAllByLabelText('Add tag to feed');
  expect(button).toHaveStyleRule('visibility', 'visible');
});

it('should show login popup when logged-out on add to feed click', async () => {
  renderComponent(
    [
      createFeedMock(defaultFeedPage, TAG_FEED_QUERY, {
        first: 7,
        loggedIn: false,
        tag: 'react',
      }),
    ],
    null,
  );
  await waitFor(() => expect(nock.isDone()).toBeTruthy());
  const [button] = await screen.findAllByLabelText('Add tag to feed');
  button.click();
  expect(showLogin).toBeCalledTimes(1);
});

it('should add new tag filter', async () => {
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
      variables: { filters: { includeTags: ['react'] } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { feedSettings: { id: defaultUser.id } } };
    },
  });
  const [button] = await screen.findAllByLabelText('Add tag to feed');
  button.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(async () => {
    expect(button).toHaveStyleRule('visibility', 'hidden');
  });
});
