import ad from '../../../../../__tests__/fixture/ad';
import { apiUrl } from '../../../../lib/config';
import { adFaviconPlaceholder } from '../../../../lib/image';
import { getAdFaviconImageLink } from './getAdFaviconImageLink';

describe('getAdFaviconImageLink', () => {
  afterEach(() => {
    delete (globalThis as typeof globalThis & { window?: Window }).window;
  });

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

  it('uses a large fallback favicon size during SSR when window is unavailable', () => {
    expect(
      getAdFaviconImageLink({
        ad: { ...ad, adDomain: 'daily.dev' },
        adImprovementsV3: true,
      }),
    ).toBe(`${apiUrl}/icon?url=daily.dev&size=96`);
  });

  it('uses the minimum favicon size when device pixel ratio would produce a smaller request', () => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { devicePixelRatio: 2 },
    });

    expect(
      getAdFaviconImageLink({
        ad: { ...ad, adDomain: 'daily.dev' },
        adImprovementsV3: true,
      }),
    ).toBe(`${apiUrl}/icon?url=daily.dev&size=96`);
  });

  it('uses the current device pixel ratio when it produces a larger request', () => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { devicePixelRatio: 5 },
    });

    expect(
      getAdFaviconImageLink({
        ad: { ...ad, adDomain: 'daily.dev' },
        adImprovementsV3: true,
      }),
    ).toBe(`${apiUrl}/icon?url=daily.dev&size=120`);
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
