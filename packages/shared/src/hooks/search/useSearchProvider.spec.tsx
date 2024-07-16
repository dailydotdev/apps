import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-hooks';
import { NextRouter, useRouter } from 'next/router';
import { mocked } from 'ts-jest/utils';
import { AlertContextProvider } from '../../contexts/AlertContext';
import { AuthContextProvider } from '../../contexts/AuthContext';
import { Alerts } from '../../graphql/alerts';
import { useSearchProvider } from './useSearchProvider';
import {
  SEARCH_POST_SUGGESTIONS,
  SearchProviderEnum,
  defaultSearchSuggestionsLimit,
} from '../../graphql/search';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';

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

const routerPush = jest.fn();

describe('useSearchProvider hook', () => {
  beforeEach(() => {
    client.clear();

    jest.clearAllMocks();
    mocked(useRouter).mockImplementation(
      () =>
        ({
          pathname: '/search',
          query: {},
          replace: jest.fn(),
          push: routerPush,
          isReady: true,
        } as unknown as NextRouter),
    );
  });

  it('should be defined', () => {
    expect(useSearchProvider).toBeDefined();
  });

  it('should return search provider', () => {
    const { result } = renderHook(() => useSearchProvider(), {
      wrapper: Wrapper,
    });

    expect(result.current).toMatchObject({
      search: expect.any(Function),
      getSuggestions: expect.any(Function),
    });
  });

  it('should search with provider', () => {
    const { result } = renderHook(() => useSearchProvider(), {
      wrapper: Wrapper,
    });

    result.current.search({
      provider: SearchProviderEnum.Posts,
      query: 'apples',
    });

    expect(routerPush).toHaveBeenCalledWith('/search?q=apples');
  });

  it('should search with non default provider', () => {
    const { result } = renderHook(() => useSearchProvider(), {
      wrapper: Wrapper,
    });

    result.current.search({
      provider: SearchProviderEnum.Chat,
      query: 'How to pick apples?',
    });

    expect(routerPush).toHaveBeenCalledWith(
      '/search?provider=chat&q=How+to+pick+apples%3F',
    );
  });

  it('should get suggesstions', async () => {
    const { result } = renderHook(() => useSearchProvider(), {
      wrapper: Wrapper,
    });

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

    const suggesstions = await result.current.getSuggestions({
      provider: SearchProviderEnum.Posts,
      query: 'apples',
    });

    expect(queryCalled).toBe(true);
    expect(suggesstions).toMatchObject({
      hits: mockedSuggestions,
    });
  });

  it('should return empty suggesstions if search with not supported provider', async () => {
    const { result } = renderHook(() => useSearchProvider(), {
      wrapper: Wrapper,
    });

    const suggesstions = await result.current.getSuggestions({
      provider: 'notSupported' as SearchProviderEnum,
      query: 'apples',
    });

    expect(suggesstions).toMatchObject({
      hits: [],
    });
  });
});
