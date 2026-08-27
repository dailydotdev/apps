import { isAdsenseProductionHost } from './adsense';

describe('isAdsenseProductionHost', () => {
  it('treats the production host as live', () => {
    expect(isAdsenseProductionHost('daily.dev')).toBe(true);
  });

  it('treats previews and local hosts as test mode', () => {
    expect(isAdsenseProductionHost('localhost')).toBe(false);
    expect(
      isAdsenseProductionHost('apps-git-feature-dailydotdev.vercel.app'),
    ).toBe(false);
    expect(isAdsenseProductionHost('www.daily.dev')).toBe(false);
    expect(isAdsenseProductionHost('app.daily.dev')).toBe(false);
  });
});
