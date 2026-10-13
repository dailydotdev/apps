import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { SearchProviderResults } from './SearchProviderResults';
import { SearchProviderEnum } from '../../../graphql/search';
import { useSearchProviderSuggestions } from '../../../hooks/search/useSearchProviderSuggestions';

jest.mock('../../../hooks/search/useSearchProviderSuggestions', () => ({
  useSearchProviderSuggestions: jest.fn(),
}));

const refetch = jest.fn();

const mockSuggestions = (state: { isLoading: boolean; isError: boolean }) =>
  jest.mocked(useSearchProviderSuggestions).mockReturnValue({
    ...state,
    refetch,
    suggestions: undefined,
    queryKey: [],
    searchId: 'search',
    searchVersion: 1,
  });

describe('SearchProviderResults', () => {
  beforeEach(() => refetch.mockClear());

  it('offers a retry instead of "no results" when the request failed', () => {
    mockSuggestions({ isLoading: false, isError: true });
    render(
      <SearchProviderResults
        provider={SearchProviderEnum.Sources}
        query="go"
      />,
    );

    expect(screen.queryByText('No results found')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows no results when the request succeeded empty', () => {
    mockSuggestions({ isLoading: false, isError: false });
    render(
      <SearchProviderResults
        provider={SearchProviderEnum.Sources}
        query="go"
      />,
    );

    expect(screen.getByText('No results found')).toBeInTheDocument();
  });
});
