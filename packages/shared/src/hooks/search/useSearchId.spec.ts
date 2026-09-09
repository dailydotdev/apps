import { renderHook } from '@testing-library/react';
import { useSearchId } from './useSearchId';

describe('useSearchId hook', () => {
  it('keeps the same id while the key is unchanged', () => {
    const { result, rerender } = renderHook(({ key }) => useSearchId(key), {
      initialProps: { key: 'react|4|all' },
    });

    const first = result.current;
    rerender({ key: 'react|4|all' });

    expect(result.current).toEqual(first);
  });

  it('mints a new id when the key changes', () => {
    const { result, rerender } = renderHook(({ key }) => useSearchId(key), {
      initialProps: { key: 'react|4|all' },
    });

    const first = result.current;
    rerender({ key: 'react|4|posts' });

    expect(result.current).not.toEqual(first);
  });

  it('does not reuse an id after the key returns to a previous value', () => {
    const { result, rerender } = renderHook(({ key }) => useSearchId(key), {
      initialProps: { key: 'react' },
    });

    const first = result.current;
    rerender({ key: 'vue' });
    rerender({ key: 'react' });

    expect(result.current).not.toEqual(first);
  });
});
