import { apiUrl } from './config';
import type { Ad } from '../graphql/posts';

export const fetchAd = async (active = false): Promise<Ad | null> => {
  const res = await fetch(`${apiUrl}/v1/a?active=${active}`);
  const ads = (await res.json()) as Ad[];

  if (!ads.length) {
    return null;
  }

  return ads[0];
};
