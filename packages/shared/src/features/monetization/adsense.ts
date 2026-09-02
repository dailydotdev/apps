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
 * The only host that serves paying creatives. Any other host — preview
 * deployments, local dev — requests test creatives via `data-adtest`. Not
 * derived from NEXT_PUBLIC_WEBAPP_URL: that is a relative `/` in production,
 * which made every live unit request test creatives and zeroed impressions.
 */
export const ADSENSE_PRODUCTION_HOST = 'daily.dev';

export const isAdsenseProductionHost = (hostname: string): boolean =>
  hostname === ADSENSE_PRODUCTION_HOST;

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

/**
 * AdSense custom channel ids keyed by UTM value. `data-ad-channel` only
 * accepts ids of channels that exist in the account and drops anything else,
 * so a raw utm value can never be sent — every value to report on needs an
 * entry here and a matching channel in the AdSense UI. At most 5 channels ride
 * one request, so one per utm dimension leaves headroom for a combined one.
 */
export const ADSENSE_UTM_KEYS = [
  'source',
  'medium',
  'campaign',
  'content',
] as const;

export type AdsenseUtmKey = (typeof ADSENSE_UTM_KEYS)[number];

export type AdsenseUtm = Partial<Record<AdsenseUtmKey, string>>;

export const ADSENSE_UTM_CHANNELS: Record<
  AdsenseUtmKey,
  Record<string, string>
> = {
  source: {
    quora: '1363957592',
    fb: '8140474737',
  },
  medium: {
    cpc: '4451381864',
  },
  campaign: {
    traffic_general_202608: '7344304362',
    rpm_test_usa_ca_v1: '1523095492',
  },
  content: {
    text_v1: '2065831022',
    text_v2: '8747623594',
    text_v3: '6121460250',
    image_v1: '1520754748',
  },
};

export const getAdsenseUtmChannel = (utm: AdsenseUtm): string | undefined => {
  const ids = ADSENSE_UTM_KEYS.map((key) => {
    const value = utm[key];
    return value && ADSENSE_UTM_CHANNELS[key][value.toLowerCase()];
  }).filter(Boolean);
  return ids.length ? ids.join(',') : undefined;
};
