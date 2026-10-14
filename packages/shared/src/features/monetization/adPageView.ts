import { v4 as uuid } from 'uuid';

let pageView: { path: string; id: string } | undefined;

export const getAdPageViewId = (path?: string): string | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const url = new URL(path ?? window.location.href, window.location.origin);
  const pagePath = `${url.pathname}${url.search}`;
  if (pageView?.path !== pagePath) {
    pageView = { path: pagePath, id: uuid() };
  }

  return pageView.id;
};
