import {
  canGoBackInApp,
  goBackPast,
  isSettingsPath,
  recordShellRoute,
  hidesCluster,
  isRootView,
  owningRoot,
  ShellRoot,
} from './shellNav';

describe('owningRoot', () => {
  it.each([
    ['/', ShellRoot.Home],
    ['/my-feed', ShellRoot.Home],
    ['/posts/[id]', ShellRoot.Home],
    ['/[userId]', ShellRoot.Home],
    ['/posts', ShellRoot.Explore],
    ['/posts/upvoted', ShellRoot.Explore],
    ['/posts/discussed', ShellRoot.Explore],
    ['/posts/latest', ShellRoot.Explore],
    ['/posts/best-of/[period]', ShellRoot.Explore],
    ['/search', ShellRoot.Explore],
    ['/tags/[tag]', ShellRoot.Explore],
    ['/sources/[source]', ShellRoot.Explore],
    ['/users', ShellRoot.Explore],
    ['/squads/[handle]', ShellRoot.Squads],
    ['/squads/discover', ShellRoot.Squads],
    ['/notifications', ShellRoot.Activity],
    ['/notifications/settings', ShellRoot.Activity],
  ])('%s belongs to %s', (path, root) => {
    expect(owningRoot(path)).toBe(root);
  });
});

describe('isRootView', () => {
  it('counts the Home segments and custom feeds, not a feed edit', () => {
    expect(isRootView(ShellRoot.Home, '/following')).toBe(true);
    expect(isRootView(ShellRoot.Home, '/highlights/[channel]')).toBe(true);
    expect(isRootView(ShellRoot.Home, '/feeds/[slugOrId]')).toBe(true);
    expect(isRootView(ShellRoot.Home, '/feeds/[slugOrId]/edit')).toBe(false);
    expect(isRootView(ShellRoot.Home, '/posts/[id]')).toBe(false);
  });

  it('counts every Explore sort, not a post', () => {
    expect(isRootView(ShellRoot.Explore, '/posts')).toBe(true);
    expect(isRootView(ShellRoot.Explore, '/posts/latest')).toBe(true);
    expect(isRootView(ShellRoot.Explore, '/posts/best-of/[period]')).toBe(true);
    expect(isRootView(ShellRoot.Explore, '/popular')).toBe(true);
    expect(isRootView(ShellRoot.Explore, '/posts/[id]')).toBe(false);
    expect(isRootView(ShellRoot.Explore, '/tags/[tag]')).toBe(false);
  });
});

describe('hidesCluster', () => {
  it('hides the bar on settings and forms only', () => {
    expect(hidesCluster('/you')).toBe(true);
    expect(hidesCluster('/settings/profile')).toBe(true);
    expect(hidesCluster('/feeds/[slugOrId]/edit')).toBe(true);
    expect(hidesCluster('/squads/[handle]/edit')).toBe(true);
    expect(hidesCluster('/posts/[id]/edit')).toBe(true);
    expect(hidesCluster('/jobs/[id]')).toBe(true);
    expect(hidesCluster('/jobs')).toBe(false);
    expect(hidesCluster('/feeds/[slugOrId]')).toBe(false);
    expect(hidesCluster('/squads/[handle]')).toBe(false);
    expect(hidesCluster('/posts/[id]')).toBe(false);
  });
});

describe('canGoBackInApp', () => {
  const setHistory = (length: number, idx?: number) => {
    Object.defineProperty(window, 'history', {
      configurable: true,
      value: { length, state: idx === undefined ? null : { idx } },
    });
  };
  const setReferrer = (referrer: string) => {
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: referrer,
    });
  };

  it('is false on the first page of a session', () => {
    setHistory(1);
    expect(canGoBackInApp()).toBe(false);
  });

  it('is true after an in-app navigation', () => {
    setHistory(3, 2);
    setReferrer('https://elsewhere.example');
    expect(canGoBackInApp()).toBe(true);
  });

  it('is true when the previous document was ours', () => {
    setHistory(2, 0);
    setReferrer(`${window.location.origin}/posts`);
    expect(canGoBackInApp()).toBe(true);
  });
});

describe('goBackPast', () => {
  const go = jest.fn();
  const visit = (paths: string[]) =>
    paths.forEach((path, index) => recordShellRoute(path, `k${index}`));
  const setReferrer = (referrer: string) => {
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: referrer,
    });
  };

  beforeEach(() => {
    window.sessionStorage.clear();
    go.mockClear();
    setReferrer('');
    Object.defineProperty(window, 'history', {
      configurable: true,
      value: { length: 5, state: null, go },
    });
  });

  it('jumps past every settings page to the page before them', () => {
    visit([
      '/you',
      '/settings/profile',
      '/settings/notifications',
      '/feeds/abc/edit',
    ]);
    const fallback = jest.fn();

    expect(goBackPast(isSettingsPath, fallback)).toBe('/you');
    expect(go).toHaveBeenCalledWith(-3);
    expect(fallback).not.toHaveBeenCalled();
  });

  it('follows a back to an earlier entry before deciding', () => {
    visit(['/', '/you', '/settings/profile']);
    recordShellRoute('/you', 'k1');
    recordShellRoute('/settings/security', 'k3');

    goBackPast(isSettingsPath, jest.fn());

    expect(go).toHaveBeenCalledWith(-1);
  });

  it('counts a replace as the same entry', () => {
    visit(['/you', '/settings/profile']);
    recordShellRoute('/settings/security', 'k1');

    goBackPast(isSettingsPath, jest.fn());

    expect(go).toHaveBeenCalledWith(-1);
  });

  it('counts a push to the same path as its own entry', () => {
    visit(['/you', '/search']);
    recordShellRoute('/search', 'k2');
    recordShellRoute('/settings/profile', 'k3');

    goBackPast(isSettingsPath, jest.fn());

    expect(go).toHaveBeenCalledWith(-1);
    expect(canGoBackInApp()).toBe(true);
  });

  it('keeps its place over a reload', () => {
    visit(['/you', '/settings/profile']);
    recordShellRoute('/settings/profile', 'fresh', 'reload');

    goBackPast(isSettingsPath, jest.fn());

    expect(go).toHaveBeenCalledWith(-1);
  });

  it('starts over when the tab comes back from another site', () => {
    visit(['/', '/you', '/settings/profile']);
    setReferrer('https://elsewhere.example/results');
    recordShellRoute('/posts/abc', 'fresh', 'navigate');
    const fallback = jest.fn();

    goBackPast(() => false, fallback);

    expect(go).not.toHaveBeenCalled();
    expect(fallback).toHaveBeenCalled();
  });

  it('falls back when the stack holds nothing but settings', () => {
    visit(['/settings/profile', '/settings/security']);
    const fallback = jest.fn();

    expect(goBackPast(isSettingsPath, fallback)).toBeNull();
    expect(go).not.toHaveBeenCalled();
    expect(fallback).toHaveBeenCalled();
  });
});
