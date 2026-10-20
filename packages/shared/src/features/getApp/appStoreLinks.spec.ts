import {
  appleProviderToken,
  getAppDownloadUrl,
  getAppStoreCampaignToken,
  getAppStoreUrl,
} from './appStoreLinks';

describe('appStoreLinks', () => {
  it('should tag the App Store link with the provider and campaign', () => {
    const url = new URL(getAppStoreUrl('get_app_button'));

    expect(url.origin + url.pathname).toBe(
      'https://apps.apple.com/app/daily-dev/id6740634400',
    );
    expect(url.searchParams.get('pt')).toBe(appleProviderToken);
    expect(url.searchParams.get('ct')).toBe('webapp_get_app_button');
  });

  it('should keep utm_source on the smart link next to the Apple tokens', () => {
    const url = new URL(getAppDownloadUrl('mobile_header'));

    expect(url.searchParams.get('utm_source')).toBe('mobile_header');
    expect(url.searchParams.get('pt')).toBe(appleProviderToken);
    expect(url.searchParams.get('ct')).toBe('webapp_mobile_header');
  });

  it('should keep the campaign token within the 40 characters Apple accepts', () => {
    expect(getAppStoreCampaignToken('x'.repeat(60))).toHaveLength(40);
  });
});
