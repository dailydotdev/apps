import { apiUrl } from './config';
import type { Ad } from '../graphql/posts';
import type { Source } from '../graphql/sources';
import { SourceType } from '../graphql/sources';
import type { AdRequestConsent } from '../features/monetization/adConsent';
import { getAdPageViewId } from '../features/monetization/adPageView';
import { getBrowserClientHints } from '../features/monetization/browserClientHints';

/**
 * Squads with the paid `adFree` feature carry no ads on their feed, their
 * search results, or the page and modal of any of their posts. Every ad
 * placement reads this one rule.
 */
export const isSourceAdFree = (
  source?: Pick<Source, 'features'> | null,
): boolean => !!source?.features?.adFree;

/**
 * A squad post opened from a feed card has no features until its own post
 * query lands, so the ads that request an ad wait for it.
 */
export const shouldSkipSourceAds = (
  source?: Pick<Source, 'features' | 'type'> | null,
): boolean =>
  isSourceAdFree(source) ||
  (source?.type === SourceType.Squad && !source.features);

export enum AdActions {
  Click = 'click',
  Refresh = 'refresh',
  Impression = 'impression',
  // Rendered and seen by IAB rules, unlike `Impression` which only means the
  // creative reached the viewport.
  Viewable = 'viewable impression',
  // Duration event: logged through `logEventStart`/`logEventEnd`, so it lands
  // with `event_duration` set to how long the creative held its slot. A
  // rotating placement needs it because a count of impressions says nothing
  // about how long any one logo was actually up.
  AirTime = 'air time',
}

export enum AdPlacement {
  Feed = 'feed',
  PostSidebar = 'post-sidebar',
  PostComment = 'post-comment',
  SquadDirectory = 'squad-directory',
  /**
   * The sponsor strip's logo wall. The wire value is the ad server's own
   * placement name, which is why it does not match the client vocabulary.
   */
  SponsorStrip = 'advertiser_bar',
}

export interface FetchAdByPlacementOptions {
  placement: AdPlacement;
  active?: boolean;
  allowPostBoost?: boolean;
  allowSquadBoost?: boolean;
  consent?: AdRequestConsent;
  /**
   * Whether the viewer is signed in. Undefined while auth is still loading,
   * so the ad server never gets a guess.
   */
  registered?: boolean;
  pageViewId?: string;
  taboolaUserId?: string;
}

// Skadi matches any query param against ad set `REQUEST_METADATA` targeting,
// so campaigns can target `{"registered":"true"}` or `{"registered":"false"}`.
export const appendRegisteredParam = (
  params: URLSearchParams,
  registered?: boolean,
): URLSearchParams => {
  if (typeof registered !== 'undefined') {
    params.set('registered', registered ? 'true' : 'false');
  }

  return params;
};

// IAB-standard consent params; the ad server promotes them to typed request
// metadata, so names must match its extraction (gdpr, gdpr_consent,
// addtl_consent).
export const appendConsentParams = (
  params: URLSearchParams,
  consent?: AdRequestConsent,
): URLSearchParams => {
  if (typeof consent?.gdprApplies !== 'undefined') {
    params.set('gdpr', consent.gdprApplies ? '1' : '0');
  }

  if (consent?.consentString) {
    params.set('gdpr_consent', consent.consentString);
    params.delete('consent_exists');
  } else if (consent?.consentExists) {
    params.set('consent_exists', consent.consentExists);
    params.delete('gdpr_consent');
  }

  if (consent?.addtlConsent) {
    params.set('addtl_consent', consent.addtlConsent);
  }

  return params;
};

const skadiGenerationIdHeader = 'x-generation-id';

const addGenerationIdHeader = ({
  ad,
  res,
}: {
  ad: Ad | null;
  res: Response;
}): Ad | null => {
  if (!ad) {
    return ad;
  }

  const generationId = res.headers.get(skadiGenerationIdHeader);

  if (!generationId) {
    return ad;
  }

  return {
    ...ad,
    generationId,
  };
};

const fetchAdRequest = async ({
  path,
  params,
  pageViewId = getAdPageViewId(),
  taboolaUserId,
}: {
  path: string;
  params?: URLSearchParams;
  pageViewId?: string;
  taboolaUserId?: string;
}): Promise<Ad | null> => {
  const headers: Record<string, string> = {};
  if (pageViewId) {
    headers['X-Page-View-Id'] = pageViewId;
  }
  if (taboolaUserId) {
    headers['X-Taboola-User-Id'] = taboolaUserId;
  }
  const hints = await getBrowserClientHints();
  if (hints) {
    headers['X-User-Agent-Client-Hints'] = JSON.stringify(hints);
  }
  const query = params?.toString();
  const res = await fetch(`${apiUrl}${path}${query ? `?${query}` : ''}`, {
    credentials: 'include',
    ...(Object.keys(headers).length > 0 && { headers }),
  });

  const ads = (await res.json()) as Ad[];
  return addGenerationIdHeader({ ad: ads[0] ?? null, res });
};

export const resolveAdFetchOptions = ({
  placement = AdPlacement.Feed,
  active,
  boostsEnabled = false,
  consent,
  registered,
  pageViewId,
  taboolaUserId,
}: {
  placement?: AdPlacement;
  active?: boolean;
  boostsEnabled?: boolean;
  consent?: AdRequestConsent;
  registered?: boolean;
  pageViewId?: string;
  taboolaUserId?: string;
}): FetchAdByPlacementOptions => {
  switch (placement) {
    case AdPlacement.PostComment:
      return { placement, consent, registered, pageViewId, taboolaUserId };
    case AdPlacement.SquadDirectory:
      return {
        placement,
        allowSquadBoost: true,
        consent,
        registered,
        pageViewId,
        taboolaUserId,
      };
    case AdPlacement.PostSidebar:
      return {
        placement,
        active,
        allowSquadBoost: boostsEnabled,
        consent,
        registered,
        pageViewId,
        taboolaUserId,
      };
    case AdPlacement.Feed:
    default:
      return {
        placement,
        active,
        allowPostBoost: boostsEnabled,
        allowSquadBoost: boostsEnabled,
        consent,
        registered,
        pageViewId,
        taboolaUserId,
      };
  }
};

export const fetchAdByPlacement = async ({
  placement,
  active = false,
  allowPostBoost = false,
  allowSquadBoost = false,
  consent,
  registered,
  pageViewId,
  taboolaUserId,
}: FetchAdByPlacementOptions): Promise<Ad | null> => {
  switch (placement) {
    case AdPlacement.PostComment:
      return fetchAdRequest({
        path: '/v1/a/post',
        params: appendConsentParams(
          appendRegisteredParam(new URLSearchParams(), registered),
          consent,
        ),
        pageViewId,
        taboolaUserId,
      });
    case AdPlacement.SquadDirectory: {
      const params = new URLSearchParams();
      if (allowSquadBoost) {
        params.set('allow_squad_boost', 'true');
      }

      appendRegisteredParam(params, registered);

      return fetchAdRequest({
        path: '/v1/a/squads_directory',
        params: appendConsentParams(params, consent),
        pageViewId,
        taboolaUserId,
      });
    }
    case AdPlacement.PostSidebar:
    case AdPlacement.Feed:
    default: {
      const params = new URLSearchParams({
        active: active ? 'true' : 'false',
      });

      if (allowPostBoost) {
        params.append('allow_post_boost', 'true');
      }

      if (allowSquadBoost) {
        params.append('allow_squad_boost', 'true');
      }

      appendRegisteredParam(params, registered);

      return fetchAdRequest({
        path: '/v1/a',
        params: appendConsentParams(params, consent),
        pageViewId,
        taboolaUserId,
      });
    }
  }
};

export const fetchAd = async (params: URLSearchParams): Promise<Ad | null> =>
  fetchAdRequest({ path: '/v1/a', params });

export const fetchCommentAd = async (): Promise<Ad | null> => {
  return fetchAdByPlacement({
    placement: AdPlacement.PostComment,
  });
};

export const fetchDirectoryAd = async (): Promise<Ad | null> => {
  return fetchAdByPlacement({
    placement: AdPlacement.SquadDirectory,
    allowSquadBoost: true,
  });
};
