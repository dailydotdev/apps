// Matches the publisher line in packages/webapp/public/ads.txt.
export const ADSENSE_CLIENT_ID = 'ca-pub-6445455356070086';

export const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;

/**
 * The origins the first ad request touches, in order: script + ad requests,
 * the auction, creative iframes. Preconnecting from <Head> runs DNS/TLS setup
 * during hydration instead of serially after the script loads — the cheapest
 * few hundred ms in the whole chain.
 */
/**
 * Hosts that serve paying creatives. Any other host — preview deployments,
 * local dev — requests test creatives via `data-adtest`. Not derived from
 * NEXT_PUBLIC_WEBAPP_URL: that is a relative `/` in production, which made
 * every live unit request test creatives and zeroed AdSense impressions.
 */
export const ADSENSE_PRODUCTION_HOSTS = ['daily.dev', 'app.daily.dev'];

export const isAdsenseProductionHost = (hostname: string): boolean =>
  ADSENSE_PRODUCTION_HOSTS.includes(hostname);

export const ADSENSE_PRECONNECT_ORIGINS = [
  'https://pagead2.googlesyndication.com',
  'https://googleads.g.doubleclick.net',
  'https://tpc.googlesyndication.com',
];

// Which AdSense ad-unit type the slot id was created as in the AdSense UI —
// the <ins> data attributes must match the unit type, not our visual format.
export type AdsenseUnitType = 'display' | 'inArticle' | 'inFeed';

export type AdsenseSlotConfig = {
  /** The 10-digit `data-ad-slot` from the unit's generated code. */
  id: string;
  type: AdsenseUnitType;
  /** Only for inFeed units: `data-ad-layout-key` from the generated code. */
  layoutKey?: string;
  /** Fixed-size units (e.g. 240x400, 300x600) render at exactly this size. */
  width?: number;
  height?: number;
};

export type AdsenseSlots = Record<string, AdsenseSlotConfig>;

/**
 * Whether a slot map has anything to serve. Key presence is not enough: units
 * that are not yet created in AdSense sit in the map with an empty id, and a
 * page must not load adsbygoogle.js — script, preconnects and third-party
 * surface — for inventory that cannot fill.
 */
export const hasLiveAdsenseUnits = (slots: AdsenseSlots): boolean =>
  Object.values(slots).some((slot) => !!slot.id);

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}
