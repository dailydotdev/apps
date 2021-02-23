import { ParsedUrlQuery } from 'querystring';
import { BaseRouter } from 'next/dist/next-server/lib/router/router';

export const parsedQueryToString = (query: ParsedUrlQuery): string => {
  const keys = Object.keys(query);
  if (!keys.length) {
    return '';
  }
  return `?${keys.map((key) => `${key}=${query[key]}`).join('&')}`;
};

export const canonicalFromRouter = (router: BaseRouter): string => {
  const includeQuery = router.pathname === '/search';
  return `https://app.daily.dev${router.pathname}${
    includeQuery ? parsedQueryToString(router.query) : ''
  }`;
};
