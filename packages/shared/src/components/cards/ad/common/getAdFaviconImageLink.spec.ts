import ad from '../../../../../__tests__/fixture/ad';
import { adFaviconPlaceholder } from '../../../../lib/image';
import { getAdFaviconImageLink } from './getAdFaviconImageLink';

describe('getAdFaviconImageLink', () => {
  it('returns companyLogo first when available', () => {
    const companyLogo = 'https://daily.dev/company-logo.png';

    expect(
      getAdFaviconImageLink({
        ad: { ...ad, companyLogo, adDomain: 'daily.dev' },
        adImprovementsV3: true,
      }),
    ).toBe(companyLogo);
  });

  it('returns the icon endpoint when companyLogo is missing and ad improvements v3 is enabled', () => {
    expect(
      getAdFaviconImageLink({
        ad: { ...ad, adDomain: 'daily.dev' },
        adImprovementsV3: true,
      }),
    ).toContain('/icon?url=');
  });

  it('returns the placeholder when companyLogo is missing and adDomain cannot be used', () => {
    expect(
      getAdFaviconImageLink({
        ad,
        adImprovementsV3: false,
      }),
    ).toBe(adFaviconPlaceholder);
  });
});
