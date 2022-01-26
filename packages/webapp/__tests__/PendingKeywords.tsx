import React from 'react';
import nock from 'nock';
import { mocked } from 'ts-jest/utils';
import { NextRouter, useRouter } from 'next/router';
import { defaultSettings } from '@dailydotdev/shared/__tests__/fixture/defaultSettings';
import { LoggedUser, Roles } from '@dailydotdev/shared/src/lib/user';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  CountPendingKeywordsData,
  Keyword,
  KeywordData,
  RANDOM_PENDING_KEYWORD_QUERY,
} from '@dailydotdev/shared/src/graphql/keywords';
import { SettingsContextProvider } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { MockedGraphQLResponse, mockGraphQL } from './helpers/graphql';
import PendingKeywords from '../pages/backoffice/pendingKeywords';

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

const defaultUser: LoggedUser = {
  id: 'u1',
  name: 'Ido Shamun',
  providers: ['github'],
  email: 'ido@acme.com',
  image: 'https://daily.dev/ido.png',
  infoConfirmed: true,
  premium: false,
  createdAt: '',
  roles: [Roles.Moderator],
};

const defaultKeyword: Keyword = {
  value: 'reactjs',
  occurrences: 10,
  status: 'pending',
};

const createRandomKeywordMock = (
  keyword: Keyword | null = defaultKeyword,
): MockedGraphQLResponse<KeywordData & CountPendingKeywordsData> => ({
  request: {
    query: RANDOM_PENDING_KEYWORD_QUERY,
  },
  result: {
    data: { keyword, countPendingKeywords: 1234 },
  },
});

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createRandomKeywordMock()],
  user: LoggedUser = defaultUser,
): RenderResult => {
  const client = new QueryClient();

  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
        }}
      >
        <SettingsContextProvider
          updateSettings={jest.fn()}
          settings={defaultSettings}
          loadedSettings
        >
          <PendingKeywords />
        </SettingsContextProvider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should redirect to home page if not moderator', async () => {
  renderComponent([], { ...defaultUser, roles: [] });
  await waitFor(() => expect(routerReplace).toBeCalledWith('/'));
});

it('should show empty screen when no keyword', async () => {
  renderComponent([createRandomKeywordMock(null)]);
  expect(await screen.findByTestId('empty')).toBeInTheDocument();
});

it('should show the keyword', async () => {
  renderComponent();
  expect(await screen.findByText('reactjs')).toBeInTheDocument();
});

it('should show the number of pending keywords', async () => {
  renderComponent();
  const el = await screen.findByText('Only 1234 left!');
  expect(el).toBeInTheDocument();
});
