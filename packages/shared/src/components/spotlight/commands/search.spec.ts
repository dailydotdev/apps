import { renderHook } from '@testing-library/react';
import {
  SearchProviderEnum,
  type SearchSuggestion,
} from '../../../graphql/search';
import { webappUrl } from '../../../lib/constants';
import { useSearchProviderSuggestions } from '../../../hooks/search';
import { SpotlightScope } from '../types';
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

describe('useSpotlightSearchCommands post metadata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseSuggestions.mockImplementation(({ provider }) => ({
      isLoading: false,
      suggestions:
        provider === SearchProviderEnum.Posts
          ? {
              hits: [
                {
                  id: 'post-id',
                  title: 'Post title',
                  subtitle: 'Source name',
                  image: 'https://daily.dev/source.png',
                },
              ],
            }
          : { hits: [] },
      queryKey: [],
    }));
  });

  it('uses the source image for post result rows', () => {
    const { result } = renderHook(() =>
      useSpotlightSearchCommands({
        router: { push: jest.fn() },
        query: 'source',
      }),
    );

    expect(result.current.posts[0].meta).toMatchObject({
      kind: 'post',
      sourceImage: 'https://daily.dev/source.png',
      sourceName: 'Source name',
    });
  });
});

describe('useSpotlightSearchCommands provider fetching', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseSuggestions.mockImplementation(() => ({
      isLoading: false,
      suggestions: { hits: [] },
      queryKey: [],
    }));
  });

  const enabledProvidersForScope = (scope: SpotlightScope) => {
    renderHook(() =>
      useSpotlightSearchCommands({
        router: { push: jest.fn() },
        query: 'elixir',
        scope,
      }),
    );

    return Object.fromEntries(
      mockedUseSuggestions.mock.calls.map(([args]) => [
        args.provider,
        args.enabled,
      ]),
    );
  };

  it('fetches every provider in the all scope', () => {
    expect(enabledProvidersForScope(SpotlightScope.All)).toEqual({
      [SearchProviderEnum.Posts]: true,
      [SearchProviderEnum.Tags]: true,
      [SearchProviderEnum.Sources]: true,
      [SearchProviderEnum.Users]: true,
    });
  });

  it.each<[SpotlightScope, SearchProviderEnum]>([
    [SpotlightScope.Posts, SearchProviderEnum.Posts],
    [SpotlightScope.Squads, SearchProviderEnum.Sources],
    [SpotlightScope.People, SearchProviderEnum.Users],
    [SpotlightScope.Tags, SearchProviderEnum.Tags],
  ])('only fetches the provider matching the %s scope', (scope, provider) => {
    const enabledByProvider = enabledProvidersForScope(scope);

    Object.entries(enabledByProvider).forEach(([current, enabled]) => {
      expect(enabled).toBe(current === provider);
    });
  });

  it('fetches no provider in the actions scope', () => {
    const enabledByProvider = enabledProvidersForScope(SpotlightScope.Actions);

    Object.values(enabledByProvider).forEach((enabled) => {
      expect(enabled).toBe(false);
    });
  });

  it('reports loading per provider instead of collapsing them', () => {
    mockedUseSuggestions.mockImplementation(({ provider }) => ({
      isLoading: provider === SearchProviderEnum.Posts,
      suggestions: { hits: [] },
      queryKey: [],
    }));

    const { result } = renderHook(() =>
      useSpotlightSearchCommands({
        router: { push: jest.fn() },
        query: 'elixir',
        scope: SpotlightScope.All,
      }),
    );

    expect(result.current.postsLoading).toBe(true);
    expect(result.current.tagsLoading).toBe(false);
    expect(result.current.sourcesLoading).toBe(false);
    expect(result.current.usersLoading).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });
});
