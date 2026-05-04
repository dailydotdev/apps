import React from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSpotlightSearchCommands } from './search';

jest.mock('../../../hooks/search', () => ({
  useSearchProviderSuggestions: jest.fn(() => ({
    suggestions: { hits: [] },
    isLoading: false,
    queryKey: [],
  })),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('useSpotlightSearchCommands', () => {
  it('emits no fallthrough when the query is blank', () => {
    const { result } = renderHook(
      () =>
        useSpotlightSearchCommands({
          router: { push: jest.fn() },
          query: '',
        }),
      { wrapper },
    );

    expect(result.current.fallthrough).toEqual([]);
  });

  it('always returns a posts fallthrough when there is a typed query', () => {
    const { result } = renderHook(
      () =>
        useSpotlightSearchCommands({
          router: { push: jest.fn() },
          query: 'react query  ',
        }),
      { wrapper },
    );

    expect(result.current.fallthrough).toHaveLength(1);
    expect(result.current.fallthrough[0].title).toContain('react query');
    expect(result.current.fallthrough[0].id).toBe('search.fallthrough.posts');
  });
});
