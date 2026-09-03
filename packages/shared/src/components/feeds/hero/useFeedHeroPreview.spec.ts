import { renderHook } from '@testing-library/react';
import { useFeedHeroPreview } from './useFeedHeroPreview';

const setSearch = (search: string): void => {
  window.history.replaceState({}, '', `/${search}`);
};

beforeEach(() => {
  window.localStorage.clear();
  setSearch('');
});

describe('useFeedHeroPreview', () => {
  it('is off without the param', () => {
    const { result } = renderHook(() => useFeedHeroPreview());

    expect(result.current).toBe(false);
  });

  it('turns on with the param and remembers it', () => {
    setSearch('?feed_hero=1');
    expect(renderHook(() => useFeedHeroPreview()).result.current).toBe(true);

    setSearch('');
    expect(renderHook(() => useFeedHeroPreview()).result.current).toBe(true);
  });

  it('turns back off with feed_hero=0', () => {
    setSearch('?feed_hero=1');
    renderHook(() => useFeedHeroPreview());

    setSearch('?feed_hero=0');
    expect(renderHook(() => useFeedHeroPreview()).result.current).toBe(false);

    setSearch('');
    expect(renderHook(() => useFeedHeroPreview()).result.current).toBe(false);
  });
});
