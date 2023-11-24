import nock from 'nock';
import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
} from '../../graphql/feedSettings';
import BlockedFilter from './BlockedFilter';

const showLogin = jest.fn();
const setUnblockItem = jest.fn();

beforeEach(() => {
  jest.restoreAllMocks();
  jest.restoreAllMocks();
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
): MockedGraphQLResponse<AllTagCategoriesData> => ({
  request: { query: FEED_SETTINGS_QUERY },
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
        <BlockedFilter onUnblockItem={setUnblockItem} />
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

it('should show unblock popup on option click', async () => {
  const { baseElement } = renderComponent();

  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));

  const el = await screen.findByLabelText('Unblock tag');
  el.click();

  await waitFor(() => expect(setUnblockItem).toBeCalled());
});

it('should show unblock popup on source unblock click', async () => {
  const { baseElement } = renderComponent();

  await waitFor(() => expect(baseElement).not.toHaveAttribute('aria-busy'));

  const el = await screen.findByLabelText('Unblock source');
  el.click();

  await waitFor(() => expect(setUnblockItem).toBeCalled());
});
