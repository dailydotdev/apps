/**
 * Taboola fills the feed slots our ad server only has a house ad for. Every
 * slot is one of the placements Taboola set up for us, and one loader serves
 * them all, so requests queue here and go out in batches.
 *
 * The app never reloads between pages, so a Taboola page view starts on the
 * first request after the URL changes. A new page view clears every unit
 * Taboola drew, so a card that remounts on the same page asks again in the
 * page view it is in, with a container Taboola has not filled before.
 */

import type { Ad } from '../../graphql/posts';
import { isExtension } from '../../lib/func';

const publisherId = 'dailydevnetwork';
const loaderId = 'tb_loader_script';
const loaderUrl = `https://cdn.taboola.com/libtrc/${publisherId}/loader.js`;
// Taboola's own fallback for when its main CDN is blocked.
const loaderPrivacyUrl = `https://static.tblcontent.com/libtrc/${publisherId}/loader.privacy.js`;
const mode = 'thumbnails-mid-a';
// Taboola leaves the container of a placement it has nothing for untouched,
// and its `render` event stops reaching the page once a second page view
// starts, so an empty placement is only known by how long it stays empty.
const responseTimeout = 4_000;

export const taboolaMaxPlacements = 15;

// Placements count down the page: the rail's ad slot is the first ad a reader
// meets, the feed's slots follow in order.
export const taboolaWidgetPlacement = 1;

export const getTaboolaFeedPlacement = (adIndex: number): number => adIndex + 2;

export const isTaboolaPlacement = (placement: number): boolean =>
  Number.isInteger(placement) &&
  placement >= 1 &&
  placement <= taboolaMaxPlacements;

let mounts = 0;

const createContainerId = (placement: number): string => {
  mounts += 1;
  return `taboola-mid-article-thumbnails-${placement}-${mounts}`;
};

const getPlacementName = (placement: number): string =>
  `Mid Article Thumbnails ${placement}`;

/**
 * What a Taboola slot logs as: Taboola's items only exist in its own DOM, so
 * the event names the placement rather than the house ad it stands in for.
 */
export const getTaboolaLogAd = (placement: number): Ad => ({
  source: 'Taboola',
  company: 'Taboola',
  providerId: 'taboola',
  link: '',
  description: getPlacementName(placement),
  image: '',
});

export type TaboolaResult = 'filled' | 'empty';

type TaboolaCommand = Record<string, unknown>;

declare global {
  interface Window {
    _taboola?: TaboolaCommand[];
  }
}

interface TaboolaRequest {
  container: HTMLElement;
  onResult?: (result: TaboolaResult) => void;
  observer: MutationObserver;
  timer?: ReturnType<typeof setTimeout>;
}

let loader: Promise<void> | undefined;
let pageUrl: string | undefined;
let queued: TaboolaRequest[] = [];
const pending = new Set<TaboolaRequest>();
let flushTimer: ReturnType<typeof setTimeout> | undefined;

// Taboola's own name for its command queue.
export const taboolaQueueKey = '_taboola';

const push = (command: TaboolaCommand): void => {
  window[taboolaQueueKey] = window[taboolaQueueKey] || [];
  window[taboolaQueueKey].push(command);
};

const isFilled = (container: HTMLElement): boolean =>
  !!container.querySelector('.videoCube');

const drop = (request: TaboolaRequest): void => {
  clearTimeout(request.timer);
  request.observer.disconnect();
  pending.delete(request);
};

const settle = (request: TaboolaRequest, result: TaboolaResult): void => {
  const { onResult } = request;
  drop(request);
  // eslint-disable-next-line no-param-reassign
  request.onResult = undefined;
  onResult?.(result);
};

const injectLoader = (
  id: string,
  src: string,
  onLoad: () => void,
  onError: () => void,
): void => {
  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.async = true;
  script.addEventListener('load', onLoad);
  script.addEventListener('error', () => {
    script.remove();
    onError();
  });
  document.head.appendChild(script);
};

// One loader for the page's lifetime. A failure stays cached too: it is almost
// always a content blocker, which would block every retry.
const loadTaboola = (): Promise<void> => {
  if (!loader) {
    loader = new Promise<void>((resolve, reject) => {
      injectLoader(loaderId, loaderUrl, resolve, () =>
        injectLoader(`${loaderId}_fb`, loaderPrivacyUrl, resolve, () =>
          reject(new Error('Failed to load the Taboola loader')),
        ),
      );
    });
  }

  return loader;
};

const failAll = (): void =>
  pending.forEach((request) => settle(request, 'empty'));

const flush = (): void => {
  flushTimer = undefined;
  const requests = queued;
  queued = [];

  if (!requests.length) {
    return;
  }

  push({ flush: true });
  loadTaboola().then(
    () =>
      requests
        .filter((request) => pending.has(request))
        .forEach((request) => {
          // eslint-disable-next-line no-param-reassign
          request.timer = setTimeout(
            () => settle(request, 'empty'),
            responseTimeout,
          );
        }),
    failAll,
  );
};

// Taboola serves a test host as the live site when its URL names that site
// (`?taboola_sim_domain=daily.dev`). In-app navigation drops the query, so
// every page view keeps the one an earlier page carried.
const simDomainParam = 'taboola_sim_domain';
let simDomain: string | null = null;

const getPageUrl = (): string => {
  const url = new URL(globalThis.location.href);
  url.hash = '';
  simDomain = url.searchParams.get(simDomainParam) ?? simDomain;

  if (simDomain) {
    url.searchParams.set(simDomainParam, simDomain);
  }

  return url.toString();
};

// Taboola's QA build: a page that names a simulated domain gets Taboola in
// every creative slot, whatever the flag or the ad server says. Revert this
// commit before merging.
const isTaboolaQa = (): boolean => {
  if (typeof globalThis.location === 'undefined') {
    return false;
  }

  getPageUrl();

  return !!simDomain;
};

/**
 * Whether Taboola fills the slot the ad server sent `ad` for: only a house ad,
 * never a boost, which carries our own post or squad. The extension's pages
 * can't load Taboola's remote script.
 */
export const isTaboolaAd = (ad: Ad, isEnabled: boolean): boolean =>
  (isTaboolaQa() || (isEnabled && !!ad.fallback)) && !ad.data && !isExtension;

const startPageView = (url: string): void => {
  if (pageUrl !== undefined) {
    push({ notify: 'newPageLoad' });
  }

  pageUrl = url;
  push({ homepage: 'auto', url });
};

/**
 * Asks Taboola to fill a placement into `container`, which it gives a fresh
 * id. `onResult` fires once, with `filled`
 * when Taboola rendered an item and `empty` when it had none or never loaded.
 * The returned function drops the callback, for a card that unmounts first.
 */
export const requestTaboolaPlacement = ({
  placement,
  container,
  onResult,
}: {
  placement: number;
  container: HTMLElement;
  onResult: (result: TaboolaResult) => void;
}): (() => void) => {
  const request: TaboolaRequest = {
    container,
    onResult,
    observer: new MutationObserver(() => {
      if (isFilled(container)) {
        settle(request, 'filled');
      }
    }),
  };
  request.observer.observe(container, { childList: true, subtree: true });
  pending.add(request);
  const url = getPageUrl();

  if (url !== pageUrl) {
    startPageView(url);
  }

  // eslint-disable-next-line no-param-reassign
  container.id = createContainerId(placement);
  push({
    mode,
    container: container.id,
    placement: getPlacementName(placement),
    target_type: 'mix',
  });
  queued = [...queued, request];

  if (!flushTimer) {
    // Slots mounting in the same commit share one request.
    flushTimer = setTimeout(flush);
  }

  return () => drop(request);
};
