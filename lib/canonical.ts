import { ParsedUrlQuery } from 'querystring';
import { Router } from 'next/router';

export const parsedQueryToString = (query: ParsedUrlQuery): string => {
  const keys = Object.keys(query);
  if (!keys.length) {
    return '';
  }
  return `?${keys.map((key) => `${key}=${query[key]}`).join('&')}`;
};

export const canonicalFromRouter = (
  router: Router,
  includeQuery = false,
): string =>
  `https://app.daily.dev${router.pathname}${
    includeQuery ? parsedQueryToString(router.query) : ''
  }`;
