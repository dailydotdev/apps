import nock from 'nock';
import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import AuthContext from '../../contexts/AuthContext';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '../../../__tests__/helpers/graphql';
import { LoggedUser } from '../../lib/user';
import {
  ALL_BLOCKED_TAGS_AND_SOURCES,
  FeedSettings,
  FeedSettingsData,
  REMOVE_FILTERS_FROM_FEED_MUTATION,
} from '../../graphql/feedSettings';
import BlockedFilter from './BlockedFilter';
import { getSourcesFiltersQueryKey } from '../../hooks/useMutateFilters';

const showLogin = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
});

const createAllBlockedTagsAndSourcesMock = (
  feedSettings: FeedSettings = {
    includeTags: ['react', 'golang'],
    blockedTags: ['javascript'],
    excludeSources: [
      {
        id: 'newstack',
        image:
          'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/newstack',
        name: 'The New Stack',
      },
    ],
  },
): MockedGraphQLResponse<FeedSettingsData> => ({
  request: { query: ALL_BLOCKED_TAGS_AND_SOURCES },
  result: {
    data: {
      feedSettings,
    },
  },
});

let client: QueryClient;

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createAllBlockedTagsAndSourcesMock()],
  user: LoggedUser = defaultUser,
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
        <BlockedFilter />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should show blocked tags', async () => {
  const { baseElement } = renderComponent();
  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));
  expect(await screen.findByText('#javascript')).toBeInTheDocument();
});

it('should show blocked sources', async () => {
  const { baseElement } = renderComponent();
  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));
  expect(await screen.findByText('The New Stack')).toBeInTheDocument();
});

it('should show unblock option for tag', async () => {
  const { baseElement } = renderComponent();
  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));

  const el = await screen.findByLabelText('Options');
  el.click();
  expect(await screen.findByText('Unblock')).toBeInTheDocument();
});

it('should show unblock popup on option click', async () => {
  let mutationCalled = false;

  const { baseElement } = renderComponent();

  await waitFor(async () => {
    const data = await client.getQueryData(
      getSourcesFiltersQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });

  mockGraphQL({
    request: {
      query: REMOVE_FILTERS_FROM_FEED_MUTATION,
      variables: { filters: { blockedTags: ['javascript'] } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { feedSettings: { id: defaultUser.id } } };
    },
  });

  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));

  const el = await screen.findByLabelText('Options');
  el.click();

  const contextBtn = await screen.findByText('Unblock');
  contextBtn.click();

  const unblockBtn = await screen.findByText('Yes, unblock');
  unblockBtn.click();

  await waitFor(() => expect(mutationCalled).toBeTruthy());

  await waitFor(async () => {
    expect(el).not.toBeInTheDocument();
  });
});

it('should show unblock popup on source unblock click', async () => {
  let mutationCalled = false;

  const { baseElement } = renderComponent();

  await waitFor(async () => {
    const data = await client.getQueryData(
      getSourcesFiltersQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });

  mockGraphQL({
    request: {
      query: REMOVE_FILTERS_FROM_FEED_MUTATION,
      variables: { filters: { excludeSources: ['newstack'] } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { feedSettings: { id: defaultUser.id } } };
    },
  });

  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));

  const el = await screen.findByLabelText('Unblock source');
  el.click();

  const unblockBtn = await screen.findByText('Yes, unblock');
  unblockBtn.click();

  await waitFor(() => expect(mutationCalled).toBeTruthy());

  await waitFor(async () => {
    expect(el).not.toBeInTheDocument();
  });
});
