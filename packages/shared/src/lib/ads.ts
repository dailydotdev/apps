import { apiUrl } from './config';
import type { Ad, AdMeasurementTag } from '../graphql/posts';
import type { Source } from '../graphql/sources';
import { SourceType } from '../graphql/sources';
import type { AdRequestConsent } from '../features/monetization/adConsent';
import { AdConsentExists } from '../features/monetization/adConsent';
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
}

export enum AdPlacement {
  Feed = 'feed',
  FeedHero = 'feed-hero',
  FeedWidget = 'feed-widget',
  PostSidebar = 'post-sidebar',
  PostComment = 'post-comment',
  SquadDirectory = 'squad-directory',
  SimilarSquads = 'similar-squads',
  /**
   * The sponsor strip's logo wall. The wire value is the ad server's own
   * placement name, which is why it does not match the client vocabulary.
   */
  SponsorStrip = 'advertiser_bar',
}

export const skadiPlacements: Record<AdPlacement, string> = {
  [AdPlacement.Feed]: 'default_card',
  [AdPlacement.FeedHero]: 'feed_hero',
  [AdPlacement.FeedWidget]: 'feed_widget',
  [AdPlacement.PostSidebar]: 'post_sidebar',
  [AdPlacement.PostComment]: 'post_comment',
  [AdPlacement.SquadDirectory]: 'squads_directory',
  [AdPlacement.SimilarSquads]: 'squads_similar',
  [AdPlacement.SponsorStrip]: 'advertiser_bar',
};

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
  v2Placements?: boolean;
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

interface SkadiCustomCreative {
  title: string;
  body?: string;
  link: string;
  image: string;
  company_logo?: string;
  company_name?: string;
  background_color?: string;
}

interface SkadiAd {
  type?: string;
  value?: { custom?: SkadiCustomCreative };
  data?: Ad['data'] & { user?: { username?: string } };
  generation_id?: string;
  ad_provider_name?: string;
  advertiser_name?: string;
  advertiser_logo?: string;
  advertiser_link?: string;
  pixels?: string[];
  tags?: AdMeasurementTag[];
  matching_tags?: string[];
  ad_domain?: string;
}

const boostCreativeTypes = ['post', 'squad'];

// Temporary mapping of the generic `/v2/a/:placement` response to the legacy
// `/v1/a` ad shape, behind `ad_v2_placements`. When the flag is cleaned up and
// every placement reads from `/v2`, adapt the ad types and cards to the new
// shape instead of keeping this translation.
export const parseSkadiAd = (
  body: unknown,
  placement: AdPlacement,
): Ad | null => {
  const ad = body as SkadiAd | null;

  if (!ad?.type) {
    return null;
  }

  const base = {
    providerId: ad.ad_provider_name,
    pixel: ad.pixels ?? [],
    generationId: ad.generation_id,
    tags: ad.tags,
    matchingTags: ad.matching_tags,
    adDomain: ad.ad_domain,
  };
  const custom = ad.value?.custom;

  if (custom) {
    const hasBody = placement === AdPlacement.PostComment && !!custom.body;

    return {
      ...base,
      source: ad.advertiser_name || ad.ad_provider_name || '',
      company: custom.company_name || (hasBody ? custom.title : ''),
      description: (hasBody ? custom.body : custom.title) ?? '',
      image: custom.image,
      link: custom.link,
      companyLogo: ad.advertiser_logo || custom.company_logo,
      referralLink: ad.advertiser_link,
      backgroundColor: custom.background_color,
    };
  }

  if (ad.data && boostCreativeTypes.includes(ad.type)) {
    return {
      ...base,
      data: ad.data,
      source: ad.data.user?.username || `${ad.type}_boost`,
      company: '',
      description: '',
      image: '',
      link: '',
    };
  }

  return null;
};

const parseLegacyAd = (body: unknown): Ad | null => (body as Ad[])[0] ?? null;

const fetchAdRequest = async ({
  path,
  params,
  pageViewId = getAdPageViewId(),
  parse = parseLegacyAd,
}: {
  path: string;
  params?: URLSearchParams;
  pageViewId?: string;
  parse?: (body: unknown) => Ad | null;
}): Promise<Ad | null> => {
  const headers: Record<string, string> = {};
  if (pageViewId) {
    headers['X-Page-View-Id'] = pageViewId;
  }
  const hints = await getBrowserClientHints(
    params?.get('consent_exists') === AdConsentExists.True,
  );
  if (hints) {
    headers['X-User-Agent-Client-Hints'] = JSON.stringify(hints);
  }
  const query = params?.toString();
  const res = await fetch(`${apiUrl}${path}${query ? `?${query}` : ''}`, {
    credentials: 'include',
    ...(Object.keys(headers).length > 0 && { headers }),
  });

  return addGenerationIdHeader({ ad: parse(await res.json()), res });
};

export const resolveAdFetchOptions = ({
  placement = AdPlacement.Feed,
  active,
  boostsEnabled = false,
  consent,
  registered,
  pageViewId,
}: {
  placement?: AdPlacement;
  active?: boolean;
  boostsEnabled?: boolean;
  consent?: AdRequestConsent;
  registered?: boolean;
  pageViewId?: string;
}): FetchAdByPlacementOptions => {
  switch (placement) {
    case AdPlacement.PostComment:
      return { placement, consent, registered, pageViewId };
    case AdPlacement.SquadDirectory:
    case AdPlacement.SimilarSquads:
      return {
        placement,
        allowSquadBoost: true,
        consent,
        registered,
        pageViewId,
      };
    case AdPlacement.PostSidebar:
      return {
        placement,
        active,
        allowSquadBoost: boostsEnabled,
        consent,
        registered,
        pageViewId,
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
      };
  }
};

const getAdRequest = ({
  placement,
  active,
  allowPostBoost,
  allowSquadBoost,
  registered,
}: {
  placement: AdPlacement;
  active: boolean;
  allowPostBoost: boolean;
  allowSquadBoost: boolean;
  registered?: boolean;
}): { path: string; params: URLSearchParams } => {
  switch (placement) {
    case AdPlacement.PostComment:
      return {
        path: '/v1/a/post',
        params: appendRegisteredParam(new URLSearchParams(), registered),
      };
    case AdPlacement.SquadDirectory:
    case AdPlacement.SimilarSquads: {
      const params = new URLSearchParams();
      if (allowSquadBoost) {
        params.set('allow_squad_boost', 'true');
      }

      return {
        path: '/v1/a/squads_directory',
        params: appendRegisteredParam(params, registered),
      };
    }
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

      return {
        path: '/v1/a',
        params: appendRegisteredParam(params, registered),
      };
    }
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
  v2Placements = false,
}: FetchAdByPlacementOptions): Promise<Ad | null> => {
  const { path, params } = getAdRequest({
    placement,
    active,
    allowPostBoost,
    allowSquadBoost,
    registered,
  });
  appendConsentParams(params, consent);

  if (v2Placements) {
    return fetchAdRequest({
      path: `/v2/a/${skadiPlacements[placement]}`,
      params,
      pageViewId,
      parse: (body) => parseSkadiAd(body, placement),
    });
  }

  return fetchAdRequest({ path, params, pageViewId });
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
