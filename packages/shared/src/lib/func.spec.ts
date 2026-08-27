import { getDailyClientPlatform } from './func';

// In the test environment `TARGET_BROWSER` is unset, so `isExtension` is false
// and these cases exercise the web (non-extension) branches.
describe('getDailyClientPlatform', () => {
  it('reports the native platform from the app version', () => {
    expect(getDailyClientPlatform('ios')).toBe('ios');
    expect(getDailyClientPlatform('android')).toBe('android');
  });

  it('falls back to webapp for any other or missing version', () => {
    expect(getDailyClientPlatform('pwa')).toBe('webapp');
    expect(getDailyClientPlatform()).toBe('webapp');
  });
});
