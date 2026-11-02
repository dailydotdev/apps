import { getAdPageViewId } from './adPageView';

const setHistoryKey = (key?: string) =>
  window.history.replaceState(key ? { key } : null, '');

describe('ad page-view identity', () => {
  afterEach(() => setHistoryKey());

  it('shares an id across slots, refreshes, and hash changes', () => {
    const id = getAdPageViewId('/feed?page=1');
    expect(id).toBeTruthy();
    expect(getAdPageViewId('/feed?page=1')).toBe(id);
    expect(getAdPageViewId('/feed?page=1#next')).toBe(id);
  });

  it('creates a new id on navigation to another page', () => {
    const first = getAdPageViewId('/first');
    expect(getAdPageViewId('/second')).not.toBe(first);
  });

  it('rotates when navigating back to the same path through a page without ads', () => {
    setHistoryKey('entry-1');
    const first = getAdPageViewId('/feed');
    // `/ad-free` makes no ad request, so only its history entry changes
    setHistoryKey('entry-2');
    setHistoryKey('entry-3');
    const second = getAdPageViewId('/feed');
    expect(second).not.toBe(first);
    expect(getAdPageViewId('/feed')).toBe(second);
  });

  it('keeps the id within one history entry', () => {
    setHistoryKey('entry-4');
    const id = getAdPageViewId();
    expect(getAdPageViewId()).toBe(id);
  });
});
