import type { ParsedUrlQuery } from 'querystring';
import type { BaseRouter } from 'next/dist/shared/lib/router/router';

const CANONICAL_ORIGIN = 'https://daily.dev';

export const parsedQueryToString = (query: ParsedUrlQuery): string => {
  const keys = Object.keys(query);
  if (!keys.length) {
    return '';
  }
  return `?${keys.map((key) => `${key}=${query[key]}`).join('&')}`;
};

export const canonicalFromRouter = (router: BaseRouter): string => {
  const [path] = router.asPath.split('?');
  const includeQuery = path === '/search';
  return `${CANONICAL_ORIGIN}${path}${
    includeQuery ? parsedQueryToString(router.query) : ''
  }`;
};
