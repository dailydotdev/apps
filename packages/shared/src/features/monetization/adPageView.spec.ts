import { getAdPageViewId } from './adPageView';

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
});
