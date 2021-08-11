import { ParsedUrlQuery } from 'querystring';
import { BaseRouter } from 'next/dist/shared/lib/router/router';
import { NextRouter } from 'next/router';

export const parsedQueryToString = (query: ParsedUrlQuery): string => {
  const keys = Object.keys(query);
  if (!keys.length) {
    return '';
  }
  return `?${keys.map((key) => `${key}=${query[key]}`).join('&')}`;
};

export const canonicalFromRouter = (router: BaseRouter): string => {
  const [path] = router.asPath.split('?');
  if ((router as NextRouter)?.isFallback) {
    return undefined;
  }
  const includeQuery = path === '/search';
  return `https://app.daily.dev${path}${
    includeQuery ? parsedQueryToString(router.query) : ''
  }`;
};
