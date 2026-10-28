import ad from '../../__tests__/fixture/ad';
import { SourceType } from '../graphql/sources';
import { AdConsentExists } from '../features/monetization/adConsent';
import { getBrowserClientHints } from '../features/monetization/browserClientHints';

import {
  AdPlacement,
  fetchAd,
  fetchAdByPlacement,
  resolveAdFetchOptions,
  shouldSkipSourceAds,
} from './ads';

jest.mock('../features/monetization/browserClientHints', () => ({
  getBrowserClientHints: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../features/monetization/adPageView', () => ({
  getAdPageViewId: () => 'page-view',
}));

describe('ads', () => {
  const originalFetch = global.fetch;
  const clearCookies = () => {
    document.cookie.split(';').forEach((cookie) => {
      document.cookie = `${cookie.split('=')[0].trim()}=;max-age=0;path=/`;
    });
  };

  beforeEach(() => {
    clearCookies();
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue([ad]),
      headers: {
        get: (name: string) =>
          name === 'x-generation-id' ? 'gen-123' : undefined,
      },
    } as unknown as Response) as typeof fetch;
  });

  afterEach(() => {
    clearCookies();
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  describe('resolveAdFetchOptions', () => {
    it.each(Object.values(AdPlacement))(
      'preserves request context for %s',
      (placement) => {
        expect(
          resolveAdFetchOptions({
            placement,
            pageViewId: 'shared-view',
          }),
        ).toMatchObject({
          placement,
          pageViewId: 'shared-view',
        });
      },
    );
    it('should enable boost flags for feed placements', () => {
      expect(
        resolveAdFetchOptions({
          placement: AdPlacement.Feed,
          active: true,
          boostsEnabled: true,
        }),
      ).toEqual({
        placement: AdPlacement.Feed,
        active: true,
        allowPostBoost: true,
        allowSquadBoost: true,
      });
    });

    it('should not request post boosts for the post sidebar, which cannot render them', () => {
      expect(
        resolveAdFetchOptions({
          placement: AdPlacement.PostSidebar,
          boostsEnabled: true,
        }),
      ).toEqual({
        placement: AdPlacement.PostSidebar,
        allowSquadBoost: true,
      });
    });

    it('should keep comment placement minimal', () => {
      expect(
        resolveAdFetchOptions({
          placement: AdPlacement.PostComment,
          boostsEnabled: true,
        }),
      ).toEqual({
        placement: AdPlacement.PostComment,
      });
    });

    it('should always enable squad boost for directory placement', () => {
      expect(
        resolveAdFetchOptions({
          placement: AdPlacement.SquadDirectory,
          boostsEnabled: false,
        }),
      ).toEqual({
        placement: AdPlacement.SquadDirectory,
        allowSquadBoost: true,
      });
    });
  });

  describe('fetchAdByPlacement', () => {
    it('should fetch feed ads from the general ads endpoint', async () => {
      const result = await fetchAdByPlacement({
        placement: AdPlacement.Feed,
        active: true,
        allowPostBoost: true,
        allowSquadBoost: true,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/a?active=true&allow_post_boost=true&allow_squad_boost=true&ad_measurement_consent=false',
        { credentials: 'include', headers: { 'X-Page-View-Id': 'page-view' } },
      );
      expect(result).toEqual({ ...ad, generationId: 'gen-123' });
    });

    it('should fetch comment ads from the post ads endpoint', async () => {
      await fetchAdByPlacement({
        placement: AdPlacement.PostComment,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/a/post?ad_measurement_consent=false',
        { credentials: 'include', headers: { 'X-Page-View-Id': 'page-view' } },
      );
    });

    it('should fetch directory ads from the squads directory endpoint', async () => {
      await fetchAdByPlacement({
        placement: AdPlacement.SquadDirectory,
        allowSquadBoost: true,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/a/squads_directory?allow_squad_boost=true&ad_measurement_consent=false',
        { credentials: 'include', headers: { 'X-Page-View-Id': 'page-view' } },
      );
    });

    it('should append IAB consent params when a consent context is provided', async () => {
      await fetchAdByPlacement({
        placement: AdPlacement.Feed,
        consent: {
          gdprApplies: true,
          consentString: 'tc-string',
          addtlConsent: '1~1.2',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/a?active=false&gdpr=1&gdpr_consent=tc-string&addtl_consent=1%7E1.2&ad_measurement_consent=false',
        { credentials: 'include', headers: { 'X-Page-View-Id': 'page-view' } },
      );
    });

    it.each([
      {
        placement: AdPlacement.Feed,
        url: 'http://localhost:3000/v1/a?active=false&registered=true&gdpr=0&ad_measurement_consent=false',
        registered: true,
      },
      {
        placement: AdPlacement.PostSidebar,
        url: 'http://localhost:3000/v1/a?active=false&registered=false&gdpr=0&ad_measurement_consent=false',
        registered: false,
      },
      {
        placement: AdPlacement.PostComment,
        url: 'http://localhost:3000/v1/a/post?registered=false&gdpr=0&ad_measurement_consent=false',
        registered: false,
      },
      {
        placement: AdPlacement.SquadDirectory,
        url: 'http://localhost:3000/v1/a/squads_directory?registered=true&gdpr=0&ad_measurement_consent=false',
        registered: true,
      },
    ])(
      'should send registered=$registered for $placement',
      async ({ placement, url, registered }) => {
        await fetchAdByPlacement({
          placement,
          registered,
          consent: { gdprApplies: false },
        });

        expect(global.fetch).toHaveBeenCalledWith(url, {
          credentials: 'include',
          headers: { 'X-Page-View-Id': 'page-view' },
        });
      },
    );

    it('should pass registered through every placement', () => {
      Object.values(AdPlacement)
        .filter((placement) => placement !== AdPlacement.SponsorStrip)
        .forEach((placement) => {
          expect(
            resolveAdFetchOptions({ placement, registered: false }).registered,
          ).toBe(false);
        });
    });

    it('should send gdpr=0 without consent strings outside GDPR scope', async () => {
      await fetchAdByPlacement({
        placement: AdPlacement.PostComment,
        consent: { gdprApplies: false },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/a/post?gdpr=0&ad_measurement_consent=false',
        { credentials: 'include', headers: { 'X-Page-View-Id': 'page-view' } },
      );
    });

    it('sends direct consent without replacing the page-view id', async () => {
      await fetchAdByPlacement({
        placement: AdPlacement.Feed,
        pageViewId: 'shared-view',
        consent: { gdprApplies: true, consentExists: AdConsentExists.False },
      });
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/a?active=false&gdpr=1&consent_exists=FALSE_CONSENT&ad_measurement_consent=false',
        {
          credentials: 'include',
          headers: {
            'X-Page-View-Id': 'shared-view',
          },
        },
      );
    });

    it.each([
      { consentExists: undefined, allowed: false },
      { consentExists: AdConsentExists.None, allowed: false },
      { consentExists: AdConsentExists.False, allowed: false },
      { consentExists: AdConsentExists.True, allowed: true },
    ])(
      'gates high-entropy hints for $consentExists',
      async ({ consentExists, allowed }) => {
        await fetchAdByPlacement({
          placement: AdPlacement.Feed,
          consent: { gdprApplies: true, consentExists },
        });
        expect(getBrowserClientHints).toHaveBeenCalledWith(allowed);
      },
    );

    it('sends only TCF when both consent mechanisms are supplied', async () => {
      await fetchAdByPlacement({
        placement: AdPlacement.PostComment,
        consent: {
          gdprApplies: true,
          consentString: 'tc-string',
          consentExists: AdConsentExists.True,
        },
      });
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/a/post?gdpr=1&gdpr_consent=tc-string&ad_measurement_consent=false',
        { credentials: 'include', headers: { 'X-Page-View-Id': 'page-view' } },
      );
    });

    it.each([
      {
        name: 'TCF',
        consent: { gdprApplies: true, consentString: 'tc-string' },
      },
      { name: 'outside CMP scope', consent: { gdprApplies: false } },
    ])(
      'sends available basic browser hints with $name consent context',
      async ({ consent }) => {
        const hints = {
          brands: [{ brand: 'Chromium', version: '134' }],
          mobile: false,
          platform: 'macOS',
        };
        jest.mocked(getBrowserClientHints).mockResolvedValueOnce(hints);
        await fetchAdByPlacement({ placement: AdPlacement.Feed, consent });
        expect(getBrowserClientHints).toHaveBeenCalledWith(false);
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: {
              'X-Page-View-Id': 'page-view',
              'X-User-Agent-Client-Hints': JSON.stringify(hints),
            },
          }),
        );
      },
    );
  });

  describe('ad measurement consent', () => {
    const measurementChoice = (call: number): string | null => {
      const url = jest.mocked(global.fetch).mock.calls[call][0] as string;
      return new URL(url).searchParams.get('ad_measurement_consent');
    };

    it.each([
      AdPlacement.Feed,
      AdPlacement.PostSidebar,
      AdPlacement.PostComment,
      AdPlacement.SquadDirectory,
    ])('forwards a saved marketing grant for %s', async (placement) => {
      document.cookie = 'ilikecookies_marketing=true;path=/';

      await fetchAdByPlacement({ placement });

      expect(measurementChoice(0)).toBe('true');
    });

    it.each([
      '',
      'ilikecookies=true',
      'ilikecookies_marketing=false',
      'ilikecookies_marketing=expired',
      'ilikecookies_marketing=%E0%A4%A',
    ])('denies measurement without a valid grant: %s', async (cookie) => {
      document.cookie = cookie;

      await fetchAdByPlacement({
        placement: AdPlacement.Feed,
        consent: { gdprApplies: false },
      });

      expect(measurementChoice(0)).toBe('false');
    });

    it('reads grants and withdrawals again on the next request', async () => {
      const options = { placement: AdPlacement.Feed };
      await fetchAdByPlacement(options);
      document.cookie = 'ilikecookies_marketing=true;path=/';
      await fetchAdByPlacement(options);
      document.cookie = 'ilikecookies_marketing=;max-age=0;path=/';
      await fetchAdByPlacement(options);

      expect([0, 1, 2].map(measurementChoice)).toEqual([
        'false',
        'true',
        'false',
      ]);
    });

    it('overrides stale legacy parameters without mutating the caller', async () => {
      const params = new URLSearchParams({
        active: 'true',
        allow_post_boost: 'true',
        ad_measurement_consent: 'true',
      });
      const original = params.toString();

      await fetchAd(params);
      expect(measurementChoice(0)).toBe('false');
      document.cookie = 'ilikecookies_marketing=true;path=/';
      await fetchAd(params);
      expect(measurementChoice(1)).toBe('true');
      expect(params.toString()).toBe(original);
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        'http://localhost:3000/v1/a?active=true&allow_post_boost=true&ad_measurement_consent=false',
        { credentials: 'include', headers: { 'X-Page-View-Id': 'page-view' } },
      );
    });
  });

  describe('shouldSkipSourceAds', () => {
    const features = {
      verified: null,
      adFree: null,
      links: null,
      products: null,
    };

    it.each([
      {
        name: 'skips an ad-free squad',
        source: {
          type: SourceType.Squad,
          features: { ...features, adFree: true },
        },
        expected: true,
      },
      {
        name: 'waits on a squad from a feed card until its post loads',
        source: { type: SourceType.Squad },
        expected: true,
      },
      {
        name: 'serves a free squad',
        source: { type: SourceType.Squad, features },
        expected: false,
      },
      {
        name: 'serves any other source from a feed card',
        source: { type: SourceType.Machine },
        expected: false,
      },
    ])('$name', ({ source, expected }) => {
      expect(shouldSkipSourceAds(source)).toBe(expected);
    });
  });
});
