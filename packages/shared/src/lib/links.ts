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

export const stripLinkParameters = (link: string): string => {
  const { origin, pathname } = new URL(link);

  return origin + pathname;
};

export const link = {
  post: {
    create: `${webappUrl}squads/create`,
  },
};
