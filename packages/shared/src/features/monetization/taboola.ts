/**
 * Taboola serves its own widgets from a publisher loader rather than through
 * Prebid, so a slot is only a container div plus a queued placement command.
 * The integration follows the Standard JavaScript code Taboola issued for the
 * `dailydevnetwork` publisher: one page-type command and the loader, a
 * placement command per widget, then a single flush once every placement of
 * the page is queued.
 *
 * Commands queue on `window._taboola` until the loader arrives, so their order
 * is the only contract: the page type must precede the placements, and the
 * flush must follow them all.
 */
export const TABOOLA_PUBLISHER_ID = 'dailydevnetwork';

const TABOOLA_LOADER_SRC = `https://cdn.taboola.com/libtrc/${TABOOLA_PUBLISHER_ID}/loader.js`;
// Taboola's own fallback when an ad blocker drops the CDN loader.
const TABOOLA_LOADER_FALLBACK_SRC = `https://static.tblcontent.com/libtrc/${TABOOLA_PUBLISHER_ID}/loader.privacy.js`;
const TABOOLA_LOADER_ID = 'tb_loader_script';

export type TaboolaPageType = 'article' | 'homepage';

export interface TaboolaPlacement {
  pageType: TaboolaPageType;
  /** The widget template Taboola configured for the placement. */
  mode: string;
  /** Both the container id and the placement's name in Backstage reports. */
  container: string;
  placement: string;
}

/**
 * The article placements Taboola set up for us, named as in their brief.
 * Container ids are fixed per page: each placement renders once per page
 * load, which the hard navigation off every ad route guarantees.
 */
export const TABOOLA_ARTICLE_PLACEMENT = {
  belowArticle: {
    pageType: 'article',
    mode: 'alternating-thumbnails-a',
    container: 'taboola-below-article-thumbnails',
    placement: 'Below Article Thumbnails',
  },
  midArticle: {
    pageType: 'article',
    mode: 'thumbnails-mid-a',
    container: 'taboola-mid-article-thumbnails',
    placement: 'Mid Article Thumbnails',
  },
  rightRail1x1: {
    pageType: 'article',
    mode: 'thumbnails-1x1-rr',
    container: 'taboola-right-rail-thumbnails-1x1',
    placement: 'Right Rail Thumbnails 1x1',
  },
  rightRail4x1: {
    pageType: 'article',
    mode: 'thumbnails-4x1-rr',
    container: 'taboola-right-rail-thumbnails-4x1',
    placement: 'Right Rail Thumbnails 4x1',
  },
} as const satisfies Record<string, TaboolaPlacement>;

/**
 * The layout Taboola configured for the mid-article placement. Placements
 * it has not set up render their raw mode instead, a single full-width item
 * under our logo, so the repeated units ask for this layout directly.
 */
const TABOOLA_MID_ARTICLE_LAYOUT = 'thumbs-feed-01-a-4x1';

/**
 * The mid-article widget repeated through the content, numbered like the
 * homepage's "Mid Article Thumbnails 1-15": the first occurrence keeps the
 * configured placement, later ones get their own name and container.
 */
export const getTaboolaInContentPlacement = (
  occurrence: number,
): TaboolaPlacement => {
  const { midArticle } = TABOOLA_ARTICLE_PLACEMENT;
  if (occurrence === 1) {
    return midArticle;
  }
  return {
    ...midArticle,
    mode: TABOOLA_MID_ARTICLE_LAYOUT,
    container: `${midArticle.container}-${occurrence}`,
    placement: `${midArticle.placement} ${occurrence}`,
  };
};

/** Comments between Taboola units in a thread, denser than the Kueez MPU's. */
export const TABOOLA_COMMENTS_PER_AD = 3;

/** The mid-article widget interleaved through a long comment thread. */
export const getTaboolaCommentsPlacement = (
  occurrence: number,
): TaboolaPlacement => ({
  ...TABOOLA_ARTICLE_PLACEMENT.midArticle,
  mode: TABOOLA_MID_ARTICLE_LAYOUT,
  container: `taboola-comments-thumbnails-${occurrence}`,
  placement: `Comments Thumbnails ${occurrence}`,
});

type TaboolaCommand = Record<string, unknown>;

declare global {
  interface Window {
    _taboola?: TaboolaCommand[];
  }
}

let loadedPageType: TaboolaPageType | undefined;
let flushTimeout: ReturnType<typeof setTimeout> | undefined;
const queuedContainers = new Set<string>();

const getQueue = (): TaboolaCommand[] => {
  // eslint-disable-next-line no-underscore-dangle
  window._taboola = window._taboola || [];
  // eslint-disable-next-line no-underscore-dangle
  return window._taboola;
};

const injectLoader = (id: string, src: string, fallbackSrc?: string): void => {
  if (document.getElementById(id)) {
    return;
  }
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  script.id = id;
  if (fallbackSrc) {
    script.onerror = () => {
      script.remove();
      injectLoader(`${TABOOLA_LOADER_ID}_fb`, fallbackSrc);
    };
  }
  document.head.appendChild(script);
};

/**
 * Queues the page type and injects the loader, once per page load. A page
 * carries a single page type, so a second one is ignored rather than queued.
 */
const loadTaboola = (pageType: TaboolaPageType): void => {
  if (loadedPageType) {
    return;
  }
  loadedPageType = pageType;
  getQueue().push({ [pageType]: 'auto' });
  injectLoader(
    TABOOLA_LOADER_ID,
    TABOOLA_LOADER_SRC,
    TABOOLA_LOADER_FALLBACK_SRC,
  );
  window.performance?.mark?.('tbl_ic');
};

/**
 * Queues a widget and schedules the page's flush. Slots mount in the same
 * commit, so deferring the flush to the next task lets every placement of
 * the page join a single flush, which is what Taboola requires. A container
 * is queued once per page load, however often its slot mounts.
 */
export const pushTaboolaPlacement = ({
  pageType,
  mode,
  container,
  placement,
}: TaboolaPlacement): void => {
  if (queuedContainers.has(container)) {
    return;
  }
  queuedContainers.add(container);
  loadTaboola(pageType);
  getQueue().push({ mode, container, placement, target_type: 'mix' });
  clearTimeout(flushTimeout);
  flushTimeout = setTimeout(() => {
    getQueue().push({ flush: true });
  });
};
