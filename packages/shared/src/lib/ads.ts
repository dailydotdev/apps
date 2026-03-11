import { apiUrl } from './config';
import type { Ad } from '../graphql/posts';

export enum AdActions {
  Click = 'click',
  Refresh = 'refresh',
  Impression = 'impression',
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
}

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
}: {
  placement?: AdPlacement;
  active?: boolean;
  boostsEnabled?: boolean;
}): FetchAdByPlacementOptions => {
  switch (placement) {
    case AdPlacement.PostComment:
      return { placement };
    case AdPlacement.SquadDirectory:
      return {
        placement,
        allowSquadBoost: true,
      };
    case AdPlacement.PostSidebar:
    case AdPlacement.Feed:
    default:
      return {
        placement,
        active,
        allowPostBoost: boostsEnabled,
        allowSquadBoost: boostsEnabled,
      };
  }
};

export const fetchAdByPlacement = async ({
  placement,
  active = false,
  allowPostBoost = false,
  allowSquadBoost = false,
}: FetchAdByPlacementOptions): Promise<Ad | null> => {
  switch (placement) {
    case AdPlacement.PostComment:
      return fetchAdRequest({ path: '/v1/a/post' });
    case AdPlacement.SquadDirectory: {
      const params = new URLSearchParams();
      if (allowSquadBoost) {
        params.set('allow_squad_boost', 'true');
      }

      return fetchAdRequest({ path: '/v1/a/squads_directory', params });
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

      return fetchAdRequest({ path: '/v1/a', params });
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
