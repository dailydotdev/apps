import { apiUrl } from './config';
import type { Ad } from '../graphql/posts';

export enum AdActions {
  Click = 'click',
  Refresh = 'refresh',
  Impression = 'impression',
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

export const fetchAd = async (params: URLSearchParams): Promise<Ad | null> => {
  const res = await fetch(`${apiUrl}/v1/a?${params.toString()}`, {
    credentials: 'include',
  });

  const ads = (await res.json()) as Ad[];
  return addGenerationIdHeader({ ad: ads[0], res });
};

export const fetchCommentAd = async (): Promise<Ad | null> => {
  const res = await fetch(`${apiUrl}/v1/a/post`, {
    credentials: 'include',
  });
  const ads = (await res.json()) as Ad[];
  return addGenerationIdHeader({ ad: ads[0], res });
};

export const fetchDirectoryAd = async (): Promise<Ad | null> => {
  const res = await fetch(
    `${apiUrl}/v1/a/squads_directory?allow_squad_boost=true`,
    { credentials: 'include' },
  );
  const ads = (await res.json()) as Ad[];
  return addGenerationIdHeader({ ad: ads[0], res });
};
