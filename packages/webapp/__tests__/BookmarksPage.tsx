import { FeedData } from '@dailydotdev/shared/src/graphql/posts';
import { BOOKMARKS_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import nock from 'nock';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { NextRouter, useRouter } from 'next/router';
import { mocked } from 'ts-jest/utils';
import SettingsContext, {
  SettingsContextData,
  ThemeMode,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import ad from '@dailydotdev/shared/__tests__/fixture/ad';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import defaultFeedPage from '@dailydotdev/shared/__tests__/fixture/feed';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import BookmarksPage from '../pages/bookmarks';

const showLogin = jest.fn();
const routerReplace = jest.fn();

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/bookmarks',
        query: {},
        replace: routerReplace,
        push: jest.fn(),
      } as unknown as NextRouter),
  );
});

const createFeedMock = (
  page = defaultFeedPage,
  query: string = BOOKMARKS_FEED_QUERY,
  variables: unknown = {
    first: 7,
    loggedIn: true,
    unreadOnly: false,
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

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createFeedMock()],
  user: LoggedUser = defaultUser,
): RenderResult => {
  const client = new QueryClient();

  mocks.forEach(mockGraphQL);
  nock('http://localhost:3000').get('/v1/a').reply(200, [ad]);
  const settingsContext: SettingsContextData = {
    spaciness: 'eco',
    showOnlyUnreadPosts: false,
    openNewTab: true,
    setTheme: jest.fn(),
    themeMode: ThemeMode.Dark,
    setSpaciness: jest.fn(),
    toggleOpenNewTab: jest.fn(),
    toggleShowOnlyUnreadPosts: jest.fn(),
    insaneMode: false,
    loadedSettings: true,
    toggleInsaneMode: jest.fn(),
    showTopSites: true,
    toggleShowTopSites: jest.fn(),
    sidebarExpanded: false,
    sortingEnabled: true,
    optOutWeeklyGoal: false,
    optOutCompanion: false,
    autoDismissNotifications: true,
    toggleSidebarExpanded: jest.fn(),
    toggleSortingEnabled: jest.fn(),
    toggleOptOutWeeklyGoal: jest.fn(),
    toggleAutoDismissNotifications: jest.fn(),
    toggleOptOutCompanion: jest.fn(),
    updateCustomLinks: jest.fn(),
  };
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
          closeLogin: jest.fn(),
        }}
      >
        <SettingsContext.Provider value={settingsContext}>
          {BookmarksPage.getLayout(
            <BookmarksPage />,
            {},
            BookmarksPage.layoutProps,
          )}
        </SettingsContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};
it('should request bookmarks feed', async () => {
  renderComponent();
  await waitForNock();
  await waitFor(async () => {
    const elements = await screen.findAllByTestId('postItem');
    expect(elements.length).toBeTruthy();
  });
});

it('should redirect to home page when logged-out', async () => {
  renderComponent([], null);
  await waitFor(() => expect(routerReplace).toBeCalledWith('/'));
});

it('should show empty screen when feed is empty', async () => {
  renderComponent([
    createFeedMock({
      pageInfo: {
        hasNextPage: false,
        endCursor: null,
      },
      edges: [],
    }),
  ]);
  await waitForNock();
  expect(
    await screen.findByText('Your bookmark list is empty.'),
  ).toBeInTheDocument();
  await waitFor(() => {
    const elements = screen.queryAllByTestId('postItem');
    expect(elements.length).toBeFalsy();
  });
});

it('should show the search bar', async () => {
  renderComponent();
  await waitForNock();
  expect(await screen.findByTestId('searchField')).toBeInTheDocument();
});

it('should update query param on enter', async (done) => {
  renderComponent();
  await waitForNock();
  const input = (await screen.findByRole('textbox')) as HTMLInputElement;
  input.value = 'daily';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  setTimeout(async () => {
    input.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, keyCode: 13 }),
    );
    await waitFor(() =>
      expect(routerReplace).toBeCalledWith({
        pathname: '/bookmarks',
        query: { q: 'daily' },
      }),
    );
    done();
  }, 150);
});
