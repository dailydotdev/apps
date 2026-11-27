import { BOOT_LOCAL_KEY } from '../contexts/common';
import { dailyClientHeader } from '../graphql/common';
import { getAdRequestHeaders } from './adRequestHeaders';
import * as funcs from './func';
import { storageWrapper as storage } from './storageWrapper';

const originalVersion = process.env.CURRENT_VERSION;
const originalTargetBrowser = process.env.TARGET_BROWSER;
const originalPath = window.location.pathname + window.location.search;

beforeEach(() => {
  process.env.CURRENT_VERSION = '3.45.0';
  storage.removeItem(BOOT_LOCAL_KEY);
  window.history.replaceState({}, '', '/');
  jest.spyOn(funcs, 'isIOSNative').mockReturnValue(false);
});

afterEach(() => {
  storage.removeItem(BOOT_LOCAL_KEY);
  window.history.replaceState({}, '', originalPath);
  jest.restoreAllMocks();
  if (originalVersion === undefined) {
    delete process.env.CURRENT_VERSION;
  } else {
    process.env.CURRENT_VERSION = originalVersion;
  }
  if (originalTargetBrowser === undefined) {
    delete process.env.TARGET_BROWSER;
  } else {
    process.env.TARGET_BROWSER = originalTargetBrowser;
  }
});

it.each([true, false])(
  'uses webapp for either web viewport (tablet: %s)',
  (matches) => {
    jest
      .spyOn(window, 'matchMedia')
      .mockReturnValue({ matches } as MediaQueryList);

    expect(getAdRequestHeaders()).toEqual({
      [dailyClientHeader]: 'webapp',
      'X-Daily-Version': '3.45.0',
    });
  },
);

it('detects Android on the first request before boot is cached', () => {
  window.history.replaceState({}, '', '/?android=true');

  expect(getAdRequestHeaders()[dailyClientHeader]).toBe('android');
});

it('preserves Android after navigation removes the query parameter', () => {
  storage.setItem(BOOT_LOCAL_KEY, JSON.stringify({ isAndroidApp: true }));

  expect(getAdRequestHeaders()[dailyClientHeader]).toBe('android');
});

it('detects the iOS wrapper', () => {
  jest.mocked(funcs.isIOSNative).mockReturnValue(true);

  expect(getAdRequestHeaders()[dailyClientHeader]).toBe('ios');
});

it('identifies extension builds even when Android is cached', () => {
  storage.setItem(BOOT_LOCAL_KEY, JSON.stringify({ isAndroidApp: true }));
  process.env.TARGET_BROWSER = 'chrome';

  jest.isolateModules(() => {
    const { getAdRequestHeaders: getExtensionHeaders } = jest.requireActual<{
      getAdRequestHeaders: typeof getAdRequestHeaders;
    }>('./adRequestHeaders');
    expect(getExtensionHeaders()[dailyClientHeader]).toBe('extension');
  });
});

it('does not block ad requests when the boot cache is malformed', () => {
  storage.setItem(BOOT_LOCAL_KEY, '{');

  expect(getAdRequestHeaders()[dailyClientHeader]).toBe('webapp');
});

it('does not block ad requests when reading storage fails', () => {
  jest.spyOn(storage, 'getItem').mockImplementationOnce(() => {
    throw new Error('Storage is unavailable');
  });

  expect(getAdRequestHeaders()[dailyClientHeader]).toBe('webapp');
});
