import { apiUrl } from './config';
import type { Ad } from '../graphql/posts';

export enum AdActions {
  Click = 'click',
  Refresh = 'refresh',
  Impression = 'impression',
}

export const fetchAd = async (params: URLSearchParams): Promise<Ad | null> => {
  const res = await fetch(`${apiUrl}/v1/a?${params.toString()}`, {
    credentials: 'include',
  });
  const ads = (await res.json()) as Ad[];
  return ads[0];
};

export const fetchCommentAd = async (): Promise<Ad | null> => {
  const res = await fetch(`${apiUrl}/v1/a/post`, {
    credentials: 'include',
  });
  const ads = (await res.json()) as Ad[];
  return ads[0];
};
