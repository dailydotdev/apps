import type { AdRefreshConfig } from '../../../graphql/posts';
import { isIOSNative } from '../../../lib/func';
import {
  AdRefreshPlatform,
  getAdRefreshPlatform,
  getAdRefreshPolicy,
} from './adRefresh';

jest.mock('../../../lib/func', () => ({
  ...jest.requireActual('../../../lib/func'),
  isIOSNative: jest.fn(),
}));

const config: AdRefreshConfig = {
  id: 'feed-us-desktop@v3',
  intervalSec: 30,
  maxPerSlot: 3,
  maxPerSession: 20,
};

describe('getAdRefreshPolicy', () => {
  it('turns the config into a policy with defaults', () => {
    expect(getAdRefreshPolicy(config)).toEqual({
      configId: 'feed-us-desktop@v3',
      intervalMs: 30_000,
      idleAfterMs: 60_000,
      maxPerSlot: 3,
      maxPerSession: 20,
      minVisiblePercent: 50,
    });
  });

  it.each([
    ['missing', undefined],
    ['null', null],
    ['zero interval', { ...config, intervalSec: 0 }],
    ['zero slot cap', { ...config, maxPerSlot: 0 }],
    ['zero session cap', { ...config, maxPerSession: 0 }],
  ])('never refreshes when the config is %s', (_, refresh) => {
    expect(getAdRefreshPolicy(refresh)).toBeNull();
  });

  it('never goes below 50% visible', () => {
    expect(
      getAdRefreshPolicy({ ...config, minVisiblePercent: 20 })
        ?.minVisiblePercent,
    ).toEqual(50);
    expect(
      getAdRefreshPolicy({ ...config, minVisiblePercent: 80 })
        ?.minVisiblePercent,
    ).toEqual(80);
  });
});

describe('getAdRefreshPlatform', () => {
  const { matchMedia } = window;
  const setViewport = (isWide?: boolean) =>
    Object.assign(window, {
      matchMedia:
        typeof isWide === 'undefined' ? undefined : () => ({ matches: isWide }),
    });

  beforeEach(() => {
    jest.mocked(isIOSNative).mockReturnValue(false);
    setViewport(true);
  });

  afterEach(() => {
    Object.assign(window, { matchMedia });
  });

  it('reports the iOS shell', () => {
    jest.mocked(isIOSNative).mockReturnValue(true);
    expect(getAdRefreshPlatform()).toEqual(AdRefreshPlatform.Ios);
  });

  it('reports the Android shell', () => {
    expect(getAdRefreshPlatform(true)).toEqual(AdRefreshPlatform.Android);
  });

  it.each([
    [false, AdRefreshPlatform.WebMobile],
    [true, AdRefreshPlatform.WebDesktop],
    [undefined, AdRefreshPlatform.WebDesktop],
  ])('reads the viewport at call time (wide: %s)', (isWide, expected) => {
    setViewport(isWide);
    expect(getAdRefreshPlatform()).toEqual(expected);
  });
});
