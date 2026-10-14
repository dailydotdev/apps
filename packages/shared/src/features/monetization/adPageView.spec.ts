import { renderHook } from '@testing-library/react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { getAdPageViewId } from './adPageView';
import { useAdPageViewId } from './useAdPageViewId';

describe('ad page-view identity', () => {
  it('shares an id across slots, refreshes, and hash changes', () => {
    const id = getAdPageViewId('/feed?page=1');
    expect(id).toBeTruthy();
    expect(getAdPageViewId('/feed?page=1')).toBe(id);
    expect(getAdPageViewId('/feed?page=1#next')).toBe(id);
  });

  it('creates a new id on navigation, including a return to a previous page', () => {
    const first = getAdPageViewId('/first');
    const second = getAdPageViewId('/second');
    expect(second).not.toBe(first);
    expect(getAdPageViewId('/first')).not.toBe(first);
  });

  it('rotates after visiting a page that makes no ad requests', () => {
    let asPath = '/feed';
    jest.mocked(useRouter).mockImplementation(() => ({ asPath } as NextRouter));
    const { result, rerender } = renderHook(() => useAdPageViewId());
    const first = result.current;
    asPath = '/ad-free';
    rerender();
    asPath = '/feed';
    rerender();
    expect(getAdPageViewId('/feed')).not.toBe(first);
    expect(getAdPageViewId('/feed')).toBe(result.current);
  });
});
