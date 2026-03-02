import type { ParsedUrlQuery } from 'querystring';
import type { BaseRouter } from 'next/dist/shared/lib/router/router';
import type { NextRouter } from 'next/router';
import { absoluteWebappUrl } from './constants';

export const parsedQueryToString = (query: ParsedUrlQuery): string => {
  const keys = Object.keys(query);
  if (!keys.length) {
    return '';
  }
  return `?${keys.map((key) => `${key}=${query[key]}`).join('&')}`;
};

export const canonicalFromRouter = (router: BaseRouter): string | undefined => {
  const [path] = router.asPath.split('?');
  if ((router as NextRouter)?.isFallback) {
    return undefined;
  }
  const includeQuery = path === '/search';
  return `${absoluteWebappUrl}${path}${
    includeQuery ? parsedQueryToString(router.query) : ''
  }`;
};
