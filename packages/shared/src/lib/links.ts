import { webappUrl } from './constants';

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
  return `${process.env.NEXT_PUBLIC_CDN_ASSET_PREFIX || ''}${path}`;
};
