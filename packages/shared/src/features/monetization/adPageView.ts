let pageView: { path: string; id: string } | undefined;

const generatePageViewId = (): string => {
  const cryptoApi = globalThis.crypto as Crypto | undefined;
  return (
    cryptoApi?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  );
};

export const getAdPageViewId = (path?: string): string | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const url = new URL(path ?? window.location.href, window.location.origin);
  const pagePath = `${url.pathname}${url.search}`;
  if (pageView?.path !== pagePath) {
    pageView = { path: pagePath, id: generatePageViewId() };
  }

  return pageView.id;
};
