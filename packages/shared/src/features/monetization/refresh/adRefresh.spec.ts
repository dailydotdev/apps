import type { AdRefreshConfig } from '../../../graphql/posts';
import {
  AdRefreshPlatform,
  getAdRefreshPlatform,
  getAdRefreshPolicy,
} from './adRefresh';

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
  it.each([
    ['ios', false, AdRefreshPlatform.Ios],
    ['android', true, AdRefreshPlatform.Android],
    [undefined, true, AdRefreshPlatform.WebMobile],
    [undefined, false, AdRefreshPlatform.WebDesktop],
  ])('maps version %s (phone: %s) to %s', (version, isPhone, expected) => {
    expect(getAdRefreshPlatform({ version, isPhone })).toEqual(expected);
  });
});
