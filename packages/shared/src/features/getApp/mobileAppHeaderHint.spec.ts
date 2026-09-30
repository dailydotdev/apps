import { BOOT_LOCAL_KEY } from '../../contexts/common';
import {
  MOBILE_APP_HEADER_HIDDEN_CLASS,
  mobileAppHeaderHintScript,
} from './mobileAppHeaderHint';

const runHint = ({
  cache,
  isTablet = false,
  isStandalone = false,
  search = '',
}: {
  cache?: Record<string, unknown>;
  isTablet?: boolean;
  isStandalone?: boolean;
  search?: string;
}): boolean => {
  document.documentElement.classList.remove(MOBILE_APP_HEADER_HIDDEN_CLASS);
  localStorage.clear();
  if (cache) {
    localStorage.setItem(BOOT_LOCAL_KEY, JSON.stringify(cache));
  }
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: query.includes('display-mode') ? isStandalone : isTablet,
  }));
  window.history.replaceState({}, '', `/${search}`);

  // Runs the inline <head> script the way the browser would.
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
  new Function(mobileAppHeaderHintScript)();

  return document.documentElement.classList.contains(
    MOBILE_APP_HEADER_HIDDEN_CLASS,
  );
};

describe('mobileAppHeaderHintScript', () => {
  it('should hide the header for a cached member', () => {
    expect(
      runHint({ cache: { user: { id: 'u1', providers: ['google'] } } }),
    ).toBe(true);
  });

  it('should keep the header for an anonymous visitor', () => {
    expect(runHint({ cache: { user: { id: 'anon' } } })).toBe(false);
    expect(runHint({})).toBe(false);
  });

  it('should hide the header in the Android app, cached or on first launch', () => {
    expect(runHint({ cache: { isAndroidApp: true } })).toBe(true);
    expect(runHint({ search: '?android=true' })).toBe(true);
  });

  it('should hide the header in an installed PWA', () => {
    expect(runHint({ isStandalone: true })).toBe(true);
  });

  it('should not touch the boot cache on tablets and desktops', () => {
    const getItem = jest.spyOn(Storage.prototype, 'getItem');

    expect(
      runHint({
        cache: { user: { id: 'u1', providers: ['google'] } },
        isTablet: true,
      }),
    ).toBe(false);
    expect(getItem).not.toHaveBeenCalled();
    getItem.mockRestore();
  });
});
