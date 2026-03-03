import { webappUrl } from './constants';
import { checkIsExtension, isExtension } from './func';

export const settingsBackPathQueryParam = 'settingsBackPath';

const ensureTrailingSlash = (url: string): string =>
  url.endsWith('/') ? url : `${url}/`;

const getAppUrlBase = (): string => {
  if (!webappUrl) {
    return 'http://localhost/';
  }

  if (webappUrl.startsWith('http://') || webappUrl.startsWith('https://')) {
    return ensureTrailingSlash(webappUrl);
  }

  if (webappUrl.startsWith('/')) {
    return ensureTrailingSlash(`http://localhost${webappUrl}`);
  }

  return ensureTrailingSlash(`http://${webappUrl}`);
};

const appUrlBase = getAppUrlBase();
const appOrigin = new URL(appUrlBase).origin;

const isSettingsPath = (pathname: string): boolean =>
  pathname === '/settings' || pathname.startsWith('/settings/');

const isValidSettingsBackPath = (path?: string): path is string =>
  !!path &&
  path.startsWith('/') &&
  !path.startsWith('//') &&
  !isSettingsPath(path);

export const getTagPageLink = (tag: string): string =>
  `${process.env.NEXT_PUBLIC_WEBAPP_URL}tags/${encodeURIComponent(tag)}`;

export function isValidHttpUrl(link: string): boolean {
  try {
    const url = new URL(link);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

const validSchema = ['http:', 'https:'];
export const withHttps = (url: string): string =>
  url.replace(/^(?:(.*:)?\/\/)?(.*)/i, (match, schema, nonSchemaUrl) => {
    return validSchema.includes(schema) ? match : `https://${nonSchemaUrl}`;
  });

export const withoutProtocol = (url: string): string =>
  url.replace(/(^\w+:|^)\/\//, '');

export const stripLinkParameters = (link: string): string => {
  const { origin, pathname } = new URL(link);

  return origin + pathname;
};

export const removeQueryParam = (url: string, param: string): string => {
  const link = new URL(url);
  link.searchParams.delete(param);
  return link.toString();
};

export const setQueryParams = (
  url: string,
  params: Record<string, string>,
): string => {
  const link = new URL(url);
  Object.entries(params).forEach(([param, value]) => {
    link.searchParams.set(param, value);
  });
  return link.toString();
};

export const objectToQueryParams = (params: Record<string, string>): string => {
  const link = new URLSearchParams();

  Object.entries(params).forEach(([param, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    link.set(param, value);
  });

  return link.toString();
};

export const link = {
  post: {
    create: `${webappUrl}squads/create`,
  },
  search: {
    requestKeys:
      'mailto:hi@daily.dev?subject=I want more invites for daily.dev search',
  },
  referral: {
    defaultUrl: 'https://daily.dev',
  },
};

export const getPathnameWithQuery = (
  pathname: string,
  params: URLSearchParams | string,
): string => {
  const searchParams = new URLSearchParams(params);
  const queryString = searchParams.toString();

  return `${pathname}${queryString ? `?${queryString}` : ''}`;
};

export const withPrefix = (prefix: string, url?: string): string => {
  if (!url) {
    return '';
  }

  if (url.includes(prefix)) {
    return url;
  }

  return `${prefix}${url}`;
};

export const fromCDN = (path: string): string => {
  let cdnPrefix = isExtension ? webappUrl : '';

  if (process.env.NEXT_PUBLIC_CDN_ASSET_PREFIX) {
    cdnPrefix = process.env.NEXT_PUBLIC_CDN_ASSET_PREFIX;
  }

  return `${cdnPrefix}${path}`;
};

export const checkSameSite = (): boolean => {
  const referrer = globalThis?.document?.referrer;
  const origin = globalThis?.window?.location.origin;

  if (!referrer) {
    return true; // empty referrer means you are from the same site or from blank tab or no-referrer header was used :/
  }

  return (
    referrer === origin || origin === referrer.substring(0, referrer.length - 1) // remove trailing slash
  );
};

export const resolveSettingsBackPath = (
  value?: string | string[],
): string | undefined => {
  const path = Array.isArray(value) ? value[0] : value;

  if (!isValidSettingsBackPath(path)) {
    return undefined;
  }

  return path;
};

export const addSettingsBackPath = (
  href: string,
  value?: string | string[],
): string => {
  const backPath = resolveSettingsBackPath(value);

  if (!backPath) {
    return href;
  }

  try {
    const url = new URL(href, appUrlBase);
    const isAbsoluteHref = /^[a-z][a-z\d+\-.]*:\/\//i.test(href);

    if (url.origin !== appOrigin || !isSettingsPath(url.pathname)) {
      return href;
    }

    url.searchParams.set(settingsBackPathQueryParam, backPath);

    return isAbsoluteHref
      ? url.toString()
      : `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return href;
  }
};

export const getRedirectNextPath = (params: URLSearchParams): string => {
  const next = params.get('next');

  let nextPath = '/';

  if (next) {
    try {
      const nextUrl = new URL(next, 'http://localhost');
      // infinite redirect loop prevention
      nextUrl.searchParams.delete('next');

      // we ignore url origin since we don't allow cross-origin redirects
      nextPath = getPathnameWithQuery(nextUrl.pathname, nextUrl.searchParams);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }

  return checkIsExtension() ? `${webappUrl}${nextPath}` : nextPath;
};
