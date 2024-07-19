import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react';
import { AlertContextProvider } from '../../contexts/AlertContext';
import { AuthContextProvider } from '../../contexts/AuthContext';
import { Alerts } from '../../graphql/alerts';
import {
  SEARCH_POST_SUGGESTIONS,
  SearchProviderEnum,
  defaultSearchSuggestionsLimit,
} from '../../graphql/search';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { useSearchProviderSuggestions } from './useSearchProviderSuggestions';

const client = new QueryClient();
const noop = jest.fn();
const updateAlerts = jest.fn();
const defaultAlerts: Alerts = {};

const Wrapper = ({ children }) => {
  return (
    <QueryClientProvider client={client}>
      <AuthContextProvider
        user={null}
        squads={[]}
        getRedirectUri={noop}
        updateUser={noop}
        tokenRefreshed={false}
      >
        <AlertContextProvider
          alerts={defaultAlerts}
          updateAlerts={updateAlerts}
          loadedAlerts
        >
          {children}
        </AlertContextProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  );
};

describe('useSearchProviderSuggestions hook', () => {
  beforeEach(() => {
    client.clear();

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useSearchProviderSuggestions).toBeDefined();
  });

  it('should get suggesstions', async () => {
    let queryCalled = false;
    const mockedSuggestions = [
      {
        title: 'Picking apples, beginners guide',
      },
      {
        title: 'How to pick apples?',
      },
    ];

    mockGraphQL({
      request: {
        query: SEARCH_POST_SUGGESTIONS,
        variables: {
          query: 'apples',
          version: 2,
          limit: defaultSearchSuggestionsLimit,
        },
      },
      result: () => {
        queryCalled = true;

        return {
          data: {
            searchPostSuggestions: {
              hits: mockedSuggestions,
            },
          },
        };
      },
    });

    const { result } = renderHook(
      () =>
        useSearchProviderSuggestions({
          provider: SearchProviderEnum.Posts,
          query: 'apples',
        }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(queryCalled).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.suggestions).toMatchObject({
      hits: mockedSuggestions,
    });
  });

  it('should not get suggesstions if query length is lower then min', () => {
    const { result } = renderHook(
      () =>
        useSearchProviderSuggestions({
          provider: SearchProviderEnum.Posts,
          query: 'a',
        }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.suggestions).toBeUndefined();
  });
});
