import { apiUrl } from './config';
import type { Ad } from '../graphql/posts';

export enum AdActions {
  Click = 'click',
  Refresh = 'refresh',
  Impression = 'impression',
}

export const fetchAd = async (
  active = false,
  pageParam = undefined,
): Promise<Ad | null> => {
  const res = await fetch(
    `${apiUrl}/v1/a?active=${active}${pageParam ? `&p=${pageParam}` : ''}`,
  );
  const ads = (await res.json()) as Ad[];
  return ads[0];
};

export const fetchCommentAd = async (): Promise<Ad | null> => {
  const res = await fetch(`${apiUrl}/v1/a/post`);
  const ads = (await res.json()) as Ad[];
  return ads[0];
};
