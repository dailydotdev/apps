import ad from '../../__tests__/fixture/ad';
import { SourceType } from '../graphql/sources';
import { AdConsentExists } from '../features/monetization/adConsent';
import { getBrowserClientHints } from '../features/monetization/browserClientHints';

import {
  AdPlacement,
  fetchAdByPlacement,
  parseSkadiAd,
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

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue([ad]),
      headers: {
        get: (name: string) =>
          name === 'x-generation-id' ? 'gen-123' : undefined,
      },
    } as unknown as Response) as typeof fetch;
  });

  afterEach(() => {
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
        'http://localhost:3000/v1/a?active=true&allow_post_boost=true&allow_squad_boost=true',
        { credentials: 'include', headers: { 'X-Page-View-Id': 'page-view' } },
      );
      expect(result).toEqual({ ...ad, generationId: 'gen-123' });
    });

    it('should fetch comment ads from the post ads endpoint', async () => {
      await fetchAdByPlacement({
        placement: AdPlacement.PostComment,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/a/post',
        { credentials: 'include', headers: { 'X-Page-View-Id': 'page-view' } },
      );
    });

    it('should fetch directory ads from the squads directory endpoint', async () => {
      await fetchAdByPlacement({
        placement: AdPlacement.SquadDirectory,
        allowSquadBoost: true,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v1/a/squads_directory?allow_squad_boost=true',
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
        'http://localhost:3000/v1/a?active=false&gdpr=1&gdpr_consent=tc-string&addtl_consent=1%7E1.2',
        { credentials: 'include', headers: { 'X-Page-View-Id': 'page-view' } },
      );
    });

    it.each([
      {
        placement: AdPlacement.Feed,
        url: 'http://localhost:3000/v1/a?active=false&registered=true&gdpr=0',
        registered: true,
      },
      {
        placement: AdPlacement.PostSidebar,
        url: 'http://localhost:3000/v1/a?active=false&registered=false&gdpr=0',
        registered: false,
      },
      {
        placement: AdPlacement.PostComment,
        url: 'http://localhost:3000/v1/a/post?registered=false&gdpr=0',
        registered: false,
      },
      {
        placement: AdPlacement.SquadDirectory,
        url: 'http://localhost:3000/v1/a/squads_directory?registered=true&gdpr=0',
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
        'http://localhost:3000/v1/a/post?gdpr=0',
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
        'http://localhost:3000/v1/a?active=false&gdpr=1&consent_exists=FALSE_CONSENT',
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
        'http://localhost:3000/v1/a/post?gdpr=1&gdpr_consent=tc-string',
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

  describe('v2 placements', () => {
    const mockResponse = (body: unknown) =>
      jest.mocked(global.fetch).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(body),
        headers: { get: () => undefined },
      } as unknown as Response);

    it.each([
      [AdPlacement.Feed, 'default_card'],
      [AdPlacement.FeedHero, 'feed_hero'],
      [AdPlacement.FeedWidget, 'feed_widget'],
      [AdPlacement.PostSidebar, 'post_sidebar'],
      [AdPlacement.PostComment, 'post_comment'],
      [AdPlacement.SquadDirectory, 'squads_directory'],
      [AdPlacement.SimilarSquads, 'squads_similar'],
    ])('fetches %s from /v2/a/%s', async (placement, skadiPlacement) => {
      mockResponse({});
      await fetchAdByPlacement({
        ...resolveAdFetchOptions({ placement, boostsEnabled: true }),
        v2Placements: true,
      });

      expect(jest.mocked(global.fetch).mock.calls[0][0]).toMatch(
        new RegExp(`^http://localhost:3000/v2/a/${skadiPlacement}(\\?|$)`),
      );
    });

    it('keeps the legacy query params', async () => {
      mockResponse({});
      await fetchAdByPlacement({
        placement: AdPlacement.Feed,
        active: true,
        allowPostBoost: true,
        registered: true,
        consent: { gdprApplies: false },
        v2Placements: true,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/v2/a/default_card?active=true&allow_post_boost=true&registered=true&gdpr=0',
        { credentials: 'include', headers: { 'X-Page-View-Id': 'page-view' } },
      );
    });

    const custom = {
      type: 'custom',
      value: {
        custom: {
          title: 'Title',
          body: 'Body',
          link: 'https://ad.link',
          image: 'https://ad.image',
          company_name: 'Company',
          background_color: '#000',
        },
      },
      generation_id: 'gen-1',
      ad_provider_name: 'direct',
      advertiser_name: 'Advertiser',
      advertiser_logo: 'https://ad.logo',
      advertiser_link: 'https://ad.referral',
      pixels: ['https://ad.pixel'],
      matching_tags: ['react'],
      ad_domain: 'ad.link',
    };

    it('maps a custom creative to the legacy ad shape', () => {
      expect(parseSkadiAd(custom, AdPlacement.Feed)).toEqual({
        source: 'Advertiser',
        company: 'Company',
        description: 'Title',
        image: 'https://ad.image',
        link: 'https://ad.link',
        companyLogo: 'https://ad.logo',
        referralLink: 'https://ad.referral',
        backgroundColor: '#000',
        providerId: 'direct',
        pixel: ['https://ad.pixel'],
        generationId: 'gen-1',
        tags: undefined,
        matchingTags: ['react'],
        adDomain: 'ad.link',
      });
    });

    it('uses the body as the description on the comment placement', () => {
      expect(parseSkadiAd(custom, AdPlacement.PostComment)).toMatchObject({
        company: 'Company',
        description: 'Body',
      });
    });

    it('keeps the resolved post of a boost', () => {
      const data = { post: { id: 'p1' }, user: { username: 'booster' } };

      expect(
        parseSkadiAd(
          { type: 'post', value: { post: { id: 'p1' } }, data },
          AdPlacement.Feed,
        ),
      ).toMatchObject({ data, source: 'booster' });
    });

    it.each([
      ['an empty response', {}],
      ['a boost without resolved data', { type: 'squad', value: {} }],
      ['an unknown creative', { type: 'digest', value: {} }],
    ])('returns no ad for %s', (_, body) => {
      expect(parseSkadiAd(body, AdPlacement.Feed)).toBeNull();
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
