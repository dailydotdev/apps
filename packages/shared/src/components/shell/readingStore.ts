import { useSyncExternalStore } from 'react';
import { WebKitMessageHandlers } from '../../lib/ios';
import { hasNativeHandler, postNativeMessage } from '../../lib/nativeBridge';
import { getAbsoluteWebappUrl } from '../../lib/links';

// The article the wrapper shows behind the post while the post page is the
// reading drawer. The wrapper reports the page's state as it changes.
export interface ReadingArticle {
  url?: string;
  title?: string;
  canGoBack?: boolean;
  canGoForward?: boolean;
  loading?: boolean;
  secure?: boolean;
}

export interface ReadingState {
  open: boolean;
  article: ReadingArticle;
}

export enum ReadingAction {
  Open = 'open',
  Close = 'close',
  Touch = 'touch',
  Reload = 'reload',
  Back = 'back',
  Forward = 'forward',
  External = 'external',
}

export enum ReadingEvent {
  State = 'reading-state',
  Scroll = 'reading-scroll',
  Link = 'reading-link',
}

const closed: ReadingState = { open: false, article: {} };
let state = closed;
const listeners = new Set<() => void>();

const set = (next: ReadingState) => {
  state = next;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const supportsReading = (): boolean =>
  hasNativeHandler(WebKitMessageHandlers.Reading);

export const postReading = (
  action: ReadingAction,
  payload: Record<string, unknown> = {},
): void => {
  postNativeMessage(WebKitMessageHandlers.Reading, { action, ...payload });
};

export const isReadingOpen = (): boolean => state.open;

// A member who turned in-app links off gets the system browser, never the
// wrapper's own browser view.
export const openInSystemBrowser = (url: string): boolean =>
  postNativeMessage(WebKitMessageHandlers.Reading, {
    action: ReadingAction.External,
    url,
  });

// The app's own pages are linked as daily.dev and app.daily.dev whatever
// origin serves them, so both count as inside along with the page's own.
const appHosts = (): string[] =>
  [
    'daily.dev',
    'app.daily.dev',
    globalThis.location?.host,
    new URL(getAbsoluteWebappUrl()).host,
  ].filter(Boolean) as string[];

// A web link that leaves the app: not one of its own pages, not a sign-in
// or share hand-off that belongs to the destination.
export const isOutsideLink = (anchor: HTMLAnchorElement): boolean =>
  /^https?:$/.test(anchor.protocol) && !appHosts().includes(anchor.host);

const shareIntents =
  /^(?:[a-z0-9-]+\.)?(?:twitter\.com|x\.com|facebook\.com|linkedin\.com|reddit\.com|wa\.me|whatsapp\.com|t\.me|telegram\.me)$/;

export const isShareLink = (anchor: HTMLAnchorElement): boolean =>
  shareIntents.test(anchor.host);

// A sheet, menu or dialog standing over the page. Each of them closes on
// Escape: the drawers and Radix listen on the document, a modal on its
// focused content.
const layerSelector =
  '[role="dialog"], [role="menu"], .ReactModal__Overlay, [data-radix-popper-content-wrapper]';

export const hasOpenLayer = (): boolean =>
  !!document.querySelector(layerSelector);

export const setReadingOpen = (open: boolean, url?: string): void =>
  set(open ? { open, article: { url } } : closed);

export const updateReadingArticle = (article: ReadingArticle): void => {
  if (!state.open) {
    return;
  }
  set({ ...state, article: { ...state.article, ...article } });
};

// The wrappers' back press and the drawer's own close both end up here: the
// drawer owns one history entry, so leaving it is a history pop.
export const requestReadingClose = (): boolean => {
  if (!state.open) {
    return false;
  }
  globalThis.history.back();
  return true;
};

// Read on a feed card: the shell routes to the post page, which opens the
// article behind itself on arrival, the same drawer as Read on the post.
type FeedOpener = (post: FeedReadingPost) => void;

export interface FeedReadingPost {
  id: string;
  slug?: string | null;
  url: string;
}

let feedOpener: FeedOpener | null = null;
let pendingOpen: { postId: string; url: string } | null = null;

export const setFeedReadingOpener = (opener: FeedOpener | null): void => {
  feedOpener = opener;
};

export const openReadingFromFeed = (post: FeedReadingPost): boolean => {
  if (!feedOpener) {
    return false;
  }
  feedOpener(post);
  return true;
};

export const queueReadingOpen = (postId: string, url: string): void => {
  pendingOpen = { postId, url };
};

export const takeReadingOpen = (postId: string): string | null => {
  const pending = pendingOpen;
  pendingOpen = null;
  return pending?.postId === postId ? pending.url : null;
};

export const useReading = (): ReadingState =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => closed,
  );
