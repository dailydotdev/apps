import React from 'react';
import nock from 'nock';
import { mocked } from 'ts-jest/utils';
import { NextRouter, useRouter } from 'next/router';
import { LoggedUser, Roles } from '@dailydotdev/shared/src/lib/user';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  Keyword,
  KEYWORD_QUERY,
  KeywordData,
} from '@dailydotdev/shared/src/graphql/keywords';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '@dailydotdev/shared/__tests__/helpers/graphql';
import user from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import SettingsContext, {
  ThemeMode,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import KeywordsPage from '../pages/backoffice/keywords/[value]';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const routerReplace = jest.fn();

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
  mocked(useRouter).mockImplementation(
    () =>
      ({
        replace: routerReplace,
      } as unknown as NextRouter),
  );
});

const defaultKeyword: Keyword = {
  value: 'reactjs',
  occurrences: 10,
  status: 'allow',
};

const createKeywordMock = (
  keyword: Keyword | null = defaultKeyword,
): MockedGraphQLResponse<KeywordData> => ({
  request: {
    query: KEYWORD_QUERY,
    variables: {
      value: defaultKeyword.value,
    },
  },
  result: {
    data: { keyword },
  },
});

let client: QueryClient;

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createKeywordMock()],
  userUpdate: LoggedUser = { ...user, roles: [Roles.Moderator] },
): RenderResult => {
  client = new QueryClient();

  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user: userUpdate,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          getRedirectUri: jest.fn(),
        }}
      >
        <SettingsContext.Provider
          value={{
            spaciness: 'eco',
            openNewTab: true,
            setTheme: jest.fn(),
            themeMode: ThemeMode.Dark,
            setSpaciness: jest.fn(),
            toggleOpenNewTab: jest.fn(),
            insaneMode: false,
            loadedSettings: true,
            toggleInsaneMode: jest.fn(),
            showTopSites: true,
            toggleShowTopSites: jest.fn(),
          }}
        >
          <KeywordsPage keyword={defaultKeyword.value} />
        </SettingsContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should redirect to home page if not moderator', async () => {
  renderComponent([], { ...user, roles: [] });
  await waitFor(() => expect(routerReplace).toBeCalledWith('/'));
});

it('should show 404 when no keyword', async () => {
  renderComponent([createKeywordMock(null)]);
  expect(await screen.findByTestId('notFound')).toBeInTheDocument();
});

it('should show the keyword', async () => {
  renderComponent();
  expect(await screen.findByText('reactjs')).toBeInTheDocument();
});

it('should show the status', async () => {
  renderComponent();
  const el = await screen.findByText('Status: allow');
  expect(el).toBeInTheDocument();
});
