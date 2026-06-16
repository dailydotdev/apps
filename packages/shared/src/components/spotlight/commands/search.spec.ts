import { renderHook } from '@testing-library/react';
import {
  SearchProviderEnum,
  type SearchSuggestion,
} from '../../../graphql/search';
import { webappUrl } from '../../../lib/constants';
import { useSearchProviderSuggestions } from '../../../hooks/search';
import { useSpotlightSearchCommands } from './search';

jest.mock('../../../hooks/search', () => ({
  useSearchProviderSuggestions: jest.fn(),
}));

const mockedUseSuggestions = useSearchProviderSuggestions as jest.Mock;

const mockTagHits = (hits: SearchSuggestion[]) => {
  mockedUseSuggestions.mockImplementation(({ provider }) => ({
    isLoading: false,
    suggestions: provider === SearchProviderEnum.Tags ? { hits } : { hits: [] },
    queryKey: [],
  }));
};

const renderTagCommands = (hits: SearchSuggestion[]) => {
  mockTagHits(hits);
  const router = { push: jest.fn() };
  const { result } = renderHook(() =>
    useSpotlightSearchCommands({ router, query: 'elixir' }),
  );
  return { router, result };
};

describe('useSpotlightSearchCommands tag navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates using the normalized tag id, not the humanized title', () => {
    const { router, result } = renderTagCommands([
      { id: 'elixir', title: 'Elixir' },
    ]);

    result.current.tags[0].perform();

    expect(router.push).toHaveBeenCalledWith(`${webappUrl}tags/elixir`);
    expect(result.current.tags[0].meta).toMatchObject({ tagName: 'Elixir' });
  });

  it('falls back to the title when id is missing', () => {
    const { router, result } = renderTagCommands([{ title: 'Elixir' }]);

    result.current.tags[0].perform();

    expect(router.push).toHaveBeenCalledWith(`${webappUrl}tags/Elixir`);
  });

  it('encodes the tag segment', () => {
    const { router, result } = renderTagCommands([{ id: 'c#', title: 'C#' }]);

    result.current.tags[0].perform();

    expect(router.push).toHaveBeenCalledWith(`${webappUrl}tags/c%23`);
  });
});
