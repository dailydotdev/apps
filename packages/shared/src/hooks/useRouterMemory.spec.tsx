import { act, renderHook } from '@testing-library/react';
import { useRouterMemory } from './useRouterMemory';

describe('useRouterMemory', () => {
  it('updates router state when replace is called', async () => {
    const { result } = renderHook(() => useRouterMemory());

    await act(async () => {
      await result.current.push(
        '/feed?pmid=post-1',
        'http://localhost/posts/post-1',
      );
    });

    expect(result.current.pathname).toBe('/feed');
    expect(result.current.query).toEqual({ pmid: 'post-1' });
    expect(result.current.asPath).toBe('/posts/post-1');

    await act(async () => {
      await result.current.replace(
        '/feed?pmid=post-2',
        'http://localhost/posts/post-2',
      );
    });

    expect(result.current.pathname).toBe('/feed');
    expect(result.current.query).toEqual({ pmid: 'post-2' });
    expect(result.current.asPath).toBe('/posts/post-2');
  });
});
