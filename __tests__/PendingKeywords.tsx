import React from 'react';
import nock from 'nock';
import { mocked } from 'ts-jest/utils';
import { NextRouter, useRouter } from 'next/router';
import { LoggedUser, Roles } from '../lib/user';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MockedGraphQLResponse, mockGraphQL } from './helpers/graphql';
import AuthContext from '../components/AuthContext';
import PendingKeywords from '../pages/backoffice/pendingKeywords';
import {
  ALLOW_KEYWORD_MUTATION,
  DENY_KEYWORD_MUTATION,
  Keyword,
  KeywordData,
  RANDOM_PENDING_KEYWORD_QUERY,
} from '../graphql/keywords';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const routerReplace = jest.fn();

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
  mocked(useRouter).mockImplementation(
    () =>
      (({
        replace: routerReplace,
      } as unknown) as NextRouter),
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
};

const createRandomKeywordMock = (
  keyword: Keyword | null = null,
): MockedGraphQLResponse<KeywordData> => ({
  request: {
    query: RANDOM_PENDING_KEYWORD_QUERY,
  },
  result: {
    data: { keyword },
  },
});

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createRandomKeywordMock(defaultKeyword)],
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
        <PendingKeywords />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should redirect to home page if not moderator', async () => {
  renderComponent([], { ...defaultUser, roles: [] });
  await waitFor(() => expect(routerReplace).toBeCalledWith('/'));
});

it('should show empty screen when no keyword', async () => {
  renderComponent([createRandomKeywordMock()]);
  expect(await screen.findByTestId('empty')).toBeInTheDocument();
});

it('should show the keyword', async () => {
  renderComponent();
  expect(await screen.findByText('reactjs')).toBeInTheDocument();
});

it('should show the number of occurrences', async () => {
  renderComponent();
  expect(await screen.findByText('Occurrences: 10')).toBeInTheDocument();
});

it('should send allowKeyword mutation', async () => {
  let mutationCalled = true;
  renderComponent([
    createRandomKeywordMock(defaultKeyword),
    {
      request: {
        query: ALLOW_KEYWORD_MUTATION,
        variables: { keyword: defaultKeyword.value },
      },
      result: () => {
        mutationCalled = true;
        return {
          data: {
            allowKeyword: {
              _: true,
            },
          },
        };
      },
    },
  ]);
  const el = await screen.findByText('Allow');
  el.click();
  await waitFor(() => mutationCalled);
});

it('should send denyKeyword mutation', async () => {
  let mutationCalled = true;
  renderComponent([
    createRandomKeywordMock(defaultKeyword),
    {
      request: {
        query: DENY_KEYWORD_MUTATION,
        variables: { keyword: defaultKeyword.value },
      },
      result: () => {
        mutationCalled = true;
        return {
          data: {
            denyKeyword: {
              _: true,
            },
          },
        };
      },
    },
  ]);
  const el = await screen.findByText('Deny');
  el.click();
  await waitFor(() => mutationCalled);
});
