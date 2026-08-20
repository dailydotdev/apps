// Matches the publisher line in packages/webapp/public/ads.txt.
export const ADSENSE_CLIENT_ID = 'ca-pub-6445455356070086';

export const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;

// Which AdSense ad-unit type the slot id was created as in the AdSense UI —
// the <ins> data attributes must match the unit type, not our visual format.
export type AdsenseUnitType = 'display' | 'inArticle' | 'inFeed' | 'multiplex';

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

/**
 * Remote config value for the /read template: ArbitrageAdSlot number →
 * AdSense unit. An empty object (the flag default) means no ad code renders
 * or loads anywhere; any entry switches the template to live mode.
 */
export type ReadAdsenseSlots = Record<string, AdsenseSlotConfig>;

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}
