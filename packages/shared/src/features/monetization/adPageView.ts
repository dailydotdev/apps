let pageView: { entry: string; id: string } | undefined;

const generatePageViewId = (): string => {
  const cryptoApi = globalThis.crypto as Crypto | undefined;
  return (
    cryptoApi?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  );
};

// Next's router gives every pushed history entry a fresh `key` and keeps it
// on replaceState and Back/Forward, so a navigation always gets a new page
// view, even back to a path seen before, without a global route listener.
const getHistoryEntryKey = (): string => {
  const state = window.history.state as { key?: unknown } | null;
  return typeof state?.key === 'string' ? state.key : '';
};

export const getAdPageViewId = (path?: string): string | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const url = new URL(path ?? window.location.href, window.location.origin);
  const entry = `${getHistoryEntryKey()}:${url.pathname}${url.search}`;
  if (pageView?.entry !== entry) {
    pageView = { entry, id: generatePageViewId() };
  }

  return pageView.id;
};
