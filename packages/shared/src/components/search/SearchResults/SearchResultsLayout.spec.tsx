import React from 'react';
import { render } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useSearchProviderSuggestions } from '../../../hooks/search';
import { useSearchResultsLayout } from '../../../hooks/search/useSearchResultsLayout';
import { SearchResultsLayout } from './SearchResultsLayout';

jest.mock('../../../hooks/search', () => ({
  useSearchProviderSuggestions: jest.fn(),
}));

jest.mock('../../../hooks/search/useSearchResultsLayout', () => ({
  useSearchResultsLayout: jest.fn(),
}));

jest.mock('../../../hooks', () => ({
  useFeedLayout: () => ({ isListMode: true }),
}));

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: jest.fn() }),
}));

jest.mock('../../utilities', () => ({
  PageWidgets: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

jest.mock('../../feeds/FeedContainer', () => ({ gapClass: () => '' }));

jest.mock('./SearchResultsTags', () => ({ SearchResultsTags: () => null }));
jest.mock('./SearchResultsSources', () => ({
  SearchResultsSources: () => null,
}));
jest.mock('./SearchResultsUsers', () => ({ SearchResultsUsers: () => null }));
jest.mock('../SearchFilterTimeButton', () => () => null);
jest.mock('../SearchFilterPostTypeButton', () => () => null);
jest.mock('../../marketing/banners/AskSearchBanner', () => ({
  AskSearchBanner: () => null,
}));

const mockedUseSuggestions = useSearchProviderSuggestions as jest.Mock;
const mockedUseSearchResultsLayout = useSearchResultsLayout as jest.Mock;
const mockedUseRouter = useRouter as jest.Mock;

const suggestionCallsFor = ({
  q,
  isSearchPageLaptop,
}: {
  q?: string | string[];
  isSearchPageLaptop: boolean;
}) => {
  mockedUseRouter.mockReturnValue({ query: { q }, push: jest.fn() });
  mockedUseSearchResultsLayout.mockReturnValue({ isSearchPageLaptop });

  render(
    <SearchResultsLayout>
      <div>results</div>
    </SearchResultsLayout>,
  );

  return mockedUseSuggestions.mock.calls.map(([args]) => args);
};

describe('SearchResultsLayout suggestion fetching', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseSuggestions.mockReturnValue({
      isLoading: false,
      suggestions: { hits: [] },
      queryKey: [],
    });
  });

  it('passes an empty query when the route has no search term', () => {
    const calls = suggestionCallsFor({
      q: undefined,
      isSearchPageLaptop: true,
    });

    expect(calls).toHaveLength(3);
    calls.forEach((args) => expect(args.query).toBe(''));
  });

  it('passes the route search term through', () => {
    const calls = suggestionCallsFor({ q: 'apples', isSearchPageLaptop: true });

    calls.forEach((args) => expect(args.query).toBe('apples'));
  });

  it('disables the suggestion queries outside the laptop layout', () => {
    const calls = suggestionCallsFor({
      q: 'apples',
      isSearchPageLaptop: false,
    });

    expect(calls).toHaveLength(3);
    calls.forEach((args) => expect(args.enabled).toBe(false));
  });
});
