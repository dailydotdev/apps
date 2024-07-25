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
