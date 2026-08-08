import { apiUrl } from './config';
import type { Ad } from '../graphql/posts';
import type { AdMacroContext } from '../features/monetization/adMacros';

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
  PostSidebar = 'post-sidebar',
  PostComment = 'post-comment',
  SquadDirectory = 'squad-directory',
}

export interface FetchAdByPlacementOptions {
  placement: AdPlacement;
  active?: boolean;
  allowPostBoost?: boolean;
  allowSquadBoost?: boolean;
  consent?: AdMacroContext;
}

// IAB-standard consent params; the ad server promotes them to typed request
// metadata, so names must match its extraction (gdpr, gdpr_consent,
// addtl_consent).
const appendConsentParams = (
  params: URLSearchParams,
  consent?: AdMacroContext,
): URLSearchParams => {
  if (typeof consent?.gdprApplies !== 'undefined') {
    params.set('gdpr', consent.gdprApplies ? '1' : '0');
  }

  if (consent?.consentString) {
    params.set('gdpr_consent', consent.consentString);
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
}: {
  path: string;
  params?: URLSearchParams;
}): Promise<Ad | null> => {
  const query = params?.toString();
  const res = await fetch(`${apiUrl}${path}${query ? `?${query}` : ''}`, {
    credentials: 'include',
  });

  const ads = (await res.json()) as Ad[];
  return addGenerationIdHeader({ ad: ads[0], res });
};

export const resolveAdFetchOptions = ({
  placement = AdPlacement.Feed,
  active,
  boostsEnabled = false,
  consent,
}: {
  placement?: AdPlacement;
  active?: boolean;
  boostsEnabled?: boolean;
  consent?: AdMacroContext;
}): FetchAdByPlacementOptions => {
  switch (placement) {
    case AdPlacement.PostComment:
      return { placement, consent };
    case AdPlacement.SquadDirectory:
      return {
        placement,
        allowSquadBoost: true,
        consent,
      };
    case AdPlacement.PostSidebar:
    case AdPlacement.Feed:
    default:
      return {
        placement,
        active,
        allowPostBoost: boostsEnabled,
        allowSquadBoost: boostsEnabled,
        consent,
      };
  }
};

export const fetchAdByPlacement = async ({
  placement,
  active = false,
  allowPostBoost = false,
  allowSquadBoost = false,
  consent,
}: FetchAdByPlacementOptions): Promise<Ad | null> => {
  switch (placement) {
    case AdPlacement.PostComment:
      return fetchAdRequest({
        path: '/v1/a/post',
        params: appendConsentParams(new URLSearchParams(), consent),
      });
    case AdPlacement.SquadDirectory: {
      const params = new URLSearchParams();
      if (allowSquadBoost) {
        params.set('allow_squad_boost', 'true');
      }

      return fetchAdRequest({
        path: '/v1/a/squads_directory',
        params: appendConsentParams(params, consent),
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

      return fetchAdRequest({
        path: '/v1/a',
        params: appendConsentParams(params, consent),
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
