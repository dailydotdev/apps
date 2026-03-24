import ad from '../../../../../__tests__/fixture/ad';
import { apiUrl } from '../../../../lib/config';
import { adFaviconPlaceholder } from '../../../../lib/image';
import { getAdFaviconImageLink } from './getAdFaviconImageLink';

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  'window',
);

describe('getAdFaviconImageLink', () => {
  afterEach(() => {
    if (originalWindowDescriptor) {
      Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
      return;
    }

    Reflect.deleteProperty(globalThis, 'window');
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
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: undefined,
    });

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
