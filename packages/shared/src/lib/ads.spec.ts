import ad from '../../__tests__/fixture/ad';
import { SourceType } from '../graphql/sources';
import { AdConsentExists } from '../features/monetization/adConsent';
import { getBrowserClientHints } from '../features/monetization/browserClientHints';

import {
  AdEntity,
  AdPlacement,
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
        }),
      ).toEqual({
        placement: AdPlacement.PostComment,
      });
    });

    it('should always enable squad boost for directory placement', () => {
      expect(
        resolveAdFetchOptions({
          placement: AdPlacement.SquadDirectory,
        }),
      ).toEqual({
        placement: AdPlacement.SquadDirectory,
        allowSquadBoost: true,
      });
    });
  });

  describe('fetchAdByPlacement', () => {
    it('rejects a non-JSON initial failure so the query can retry it', async () => {
      const failure = new SyntaxError('Unexpected token <');
      jest.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 503,
        json: jest.fn().mockRejectedValue(failure),
      } as unknown as Response);
      const onTransition = jest.fn();

      await expect(
        fetchAdByPlacement({ placement: AdPlacement.Feed, onTransition }),
      ).rejects.toBe(failure);
      expect(onTransition.mock.calls).toEqual([
        [{ type: 'pre-fetch' }],
        [{ type: 'fetch-error' }],
      ]);
    });

    it('rejects a failed refresh even when the error body is JSON', async () => {
      const json = jest.fn().mockResolvedValue({ error: 'unavailable' });
      jest.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 503,
        json,
      } as unknown as Response);
      const onTransition = jest.fn();

      await expect(
        fetchAdByPlacement({
          placement: AdPlacement.Feed,
          refresh: {
            platform: 'web_desktop',
            count: 1,
            generationId: 'previous',
          },
          onTransition,
        }),
      ).rejects.toThrow('Ad request failed with status 503');
      expect(json).not.toHaveBeenCalled();
      expect(onTransition.mock.calls).toEqual([
        [{ type: 'pre-fetch' }],
        [{ type: 'fetch-error' }],
      ]);
    });

    it('reports pre-fetch before the request and post-fetch with the generation id', async () => {
      const onTransition = jest.fn();
      const request = fetchAdByPlacement({
        placement: AdPlacement.Feed,
        onTransition,
      });

      expect(onTransition.mock.calls).toEqual([[{ type: 'pre-fetch' }]]);
      expect(global.fetch).not.toHaveBeenCalled();

      const result = await request;
      expect(onTransition.mock.calls).toEqual([
        [{ type: 'pre-fetch' }],
        [{ type: 'post-fetch', ad: { ...ad, generationId: 'gen-123' } }],
      ]);
      expect(result).toEqual({ ...ad, generationId: 'gen-123' });
    });

    it.each([
      { ok: true, status: 200, body: [], outcome: 'no-fill' },
      {
        ok: false,
        status: 503,
        body: { error: 'unavailable' },
        outcome: 'fetch-error',
      },
    ])(
      'reports $outcome for an HTTP $status response',
      async ({ ok, status, body, outcome }) => {
        jest.mocked(global.fetch).mockResolvedValue({
          ok,
          status,
          json: async () => body,
          headers: new Headers(),
        } as Response);
        const onTransition = jest.fn();

        await expect(
          fetchAdByPlacement({ placement: AdPlacement.Feed, onTransition }),
        ).resolves.toBeNull();
        expect(onTransition.mock.calls).toEqual([
          [{ type: 'pre-fetch' }],
          [{ type: outcome }],
        ]);
      },
    );

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

    it.each([
      {
        placement: AdPlacement.Feed,
        entity: { entity: AdEntity.Source, id: 'squad-1' },
        url: 'http://localhost:3000/v1/a?active=false&allow_post_boost=true&allow_squad_boost=true&entity=source&entity_id=squad-1',
      },
      {
        placement: AdPlacement.PostSidebar,
        entity: { entity: AdEntity.Post, id: 'post-1' },
        url: 'http://localhost:3000/v1/a?active=false&allow_squad_boost=true&entity=post&entity_id=post-1',
      },
      {
        placement: AdPlacement.PostComment,
        entity: { entity: AdEntity.Post, id: 'post-1' },
        url: 'http://localhost:3000/v1/a/post?entity=post&entity_id=post-1',
      },
      {
        placement: AdPlacement.SquadDirectory,
        entity: { entity: AdEntity.Source, id: 'squad-1' },
        url: 'http://localhost:3000/v1/a/squads_directory?allow_squad_boost=true&entity=source&entity_id=squad-1',
      },
    ])(
      'should send the page entity for $placement',
      async ({ placement, entity, url }) => {
        await fetchAdByPlacement(resolveAdFetchOptions({ placement, entity }));

        expect(global.fetch).toHaveBeenCalledWith(url, {
          credentials: 'include',
          headers: { 'X-Page-View-Id': 'page-view' },
        });
      },
    );

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

    it('throws on a failed refresh request but not on the first request', async () => {
      jest.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ error: 'failed' }),
        headers: { get: () => undefined },
      } as unknown as Response);

      await expect(
        fetchAdByPlacement({
          placement: AdPlacement.Feed,
          refresh: { platform: 'web_desktop', count: 0 },
        }),
      ).resolves.toBeNull();
      await expect(
        fetchAdByPlacement({
          placement: AdPlacement.Feed,
          refresh: { platform: 'web_desktop', count: 1, generationId: 'gen' },
        }),
      ).rejects.toThrow();
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
        name: 'serves an ad-free squad that turned ads back on',
        source: {
          type: SourceType.Squad,
          features: { ...features, adFree: true, hideAds: false },
        },
        expected: false,
      },
      {
        name: 'skips a squad the API says hides ads',
        source: {
          type: SourceType.Squad,
          features: { ...features, hideAds: true },
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
