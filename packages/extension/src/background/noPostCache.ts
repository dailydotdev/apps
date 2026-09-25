import { ONE_HOUR } from '@dailydotdev/shared/src/lib/time';

export const NO_POST_CACHE_TTL = ONE_HOUR;
export const NO_POST_CACHE_MAX_SIZE = 500;

export const createNoPostCache = () => {
  const cache = new Map<string, number>();

  const has = (url: string, now = Date.now()): boolean => {
    const expiresAt = cache.get(url);
    if (!expiresAt) {
      return false;
    }

    if (expiresAt > now) {
      return true;
    }

    cache.delete(url);
    return false;
  };

  const add = (url: string, now = Date.now()): void => {
    cache.delete(url);
    cache.set(url, now + NO_POST_CACHE_TTL);
    if (cache.size > NO_POST_CACHE_MAX_SIZE) {
      cache.delete(cache.keys().next().value as string);
    }
  };

  return { has, add };
};

export const noPostCache = createNoPostCache();
