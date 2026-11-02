/* eslint-disable no-underscore-dangle -- __ciads is Content Ignite's mandated global */
/**
 * Content Ignite is the programmatic demand behind every display slot. It
 * arrives as a managed tag, one script per domain, that places, sizes,
 * refreshes and fills every unit from the configuration in their platform,
 * where each unit is a CSS-selector placement with URL, device and geo
 * targeting. The page's part is small: load the tag where ads may show, keep
 * a stable anchor per slot for those selectors (`data-ad-slot`, see
 * ProgrammaticAd), gate the whole thing with the body class their selectors
 * are prefixed with, and tell the tag when a client-side navigation changes
 * the page. Nothing here renders a creative or runs an auction.
 */
import { LogEvent } from '../../lib/log';
import { AdActions } from '../../lib/ads';
import type { LogEvent as LogEventPayload } from '../../hooks/log/useLogQueue';
import type { AdUtm } from './useAdUtm';

/** The daily.dev publisher tag: per domain, not per page or unit. */
export const CONTENT_IGNITE_TAG_SRC =
  'https://cdn.tagdeliver.com/cipt/19223.js';

/** Where the tag comes from, for preconnect while the app hydrates. */
export const CONTENT_IGNITE_PRECONNECT_ORIGINS = ['https://cdn.tagdeliver.com'];

/**
 * Page-level gate, Content Ignite's documented pattern: every unit's selector
 * is prefixed with this class, so a unit can only match while the page says
 * ads are allowed. Set alongside loading the tag; absent for members, Plus,
 * ad-free squads and the kill switches.
 */
export const ADS_ALLOWED_CLASS = 'show-ads';

export const CONTENT_IGNITE_PROVIDER_ID = 'contentignite';

type ContentIgniteApi = {
  /** Runs once the tag has loaded; the tag drains the queue on execution. */
  cmd: Array<() => void>;
  /** SPA navigation: a new page impression, every unit destroyed and rebuilt. */
  reload?: () => void;
  /** Page-level key-values; an array overwrites the key's previous values. */
  setTargeting?: (key: string, values: string | string[] | null) => void;
};

declare global {
  interface Window {
    __ciads?: ContentIgniteApi;
  }
}

/**
 * The command queue, created before the tag arrives. The tag expects exactly
 * this shape and drains it on execution, so callers can queue work during
 * hydration without racing the script.
 */
const getContentIgnite = (): ContentIgniteApi => {
  window.__ciads = window.__ciads ?? { cmd: [] };
  window.__ciads.cmd = window.__ciads.cmd ?? [];
  return window.__ciads;
};

export const isContentIgniteTagInjected = (): boolean =>
  !!document.querySelector(`script[src="${CONTENT_IGNITE_TAG_SRC}"]`);

/**
 * Idempotent: the tag is per domain and survives client-side navigation, so
 * every page that may carry ads asks for it and only the first one injects.
 */
export const injectContentIgniteTag = (): void => {
  if (isContentIgniteTagInjected()) {
    return;
  }

  const script = document.createElement('script');
  script.src = CONTENT_IGNITE_TAG_SRC;
  script.async = true;
  document.head.appendChild(script);
};

/**
 * Tells the tag the page changed under it. Queued, so a navigation that
 * lands before the tag has executed still rebuilds once it does.
 */
export const reloadContentIgnite = (): void => {
  const contentIgnite = getContentIgnite();
  contentIgnite.cmd.push(() => contentIgnite.reload?.());
};

/**
 * Acquisition source as page-level targeting. The strongest signal we have
 * about what a visitor is worth, and page-level rather than per unit.
 */
export const setContentIgniteUtmTargeting = (utm?: AdUtm): void => {
  if (!utm) {
    return;
  }

  const contentIgnite = getContentIgnite();
  contentIgnite.cmd.push(() => {
    Object.entries(utm).forEach(([key, value]) => {
      if (value) {
        contentIgnite.setTargeting?.(`utm_${key}`, [value]);
      }
    });
  });
};

/**
 * The tag reports on the window with plain browser events. The ones that
 * map onto our slot events: fill and miss per unit (once per refresh), the
 * MRC viewable impression, consent denied, and tag errors.
 */
export const CONTENT_IGNITE_EVENTS = [
  'ci_al',
  'ci_am',
  'ci_ai',
  'ci_cd',
  'ci_te',
] as const;

export type ContentIgniteEventName = (typeof CONTENT_IGNITE_EVENTS)[number];

export interface ContentIgniteEventDetail {
  /** The unit config in their platform that fired the event. */
  config_id?: string | number;
  msg?: string;
  /** The served creative, on fill and impression; fields vary by demand. */
  slot?: {
    creativeId?: number;
    lineItemId?: number;
    advertiserId?: number;
    campaignId?: number;
    size?: string;
  };
}

/**
 * One shape for every slot event, so ClickHouse queries never have to guess
 * which fields a given event remembered to include. The unit is identified
 * by Content Ignite's config id: the tag places units by selector, so there
 * is no slot number on this side to attribute an event to.
 */
const getSlotLogExtra = (
  detail: ContentIgniteEventDetail,
  utm: AdUtm | undefined,
  extra?: Record<string, unknown>,
): string =>
  JSON.stringify({
    provider: CONTENT_IGNITE_PROVIDER_ID,
    config_id: detail.config_id,
    utm_source: utm?.source,
    utm_medium: utm?.medium,
    utm_campaign: utm?.campaign,
    utm_content: utm?.content,
    ...extra,
  });

const creativeLogExtra = (
  detail: ContentIgniteEventDetail,
): Record<string, unknown> => ({
  creative_id: detail.slot?.creativeId,
  line_item_id: detail.slot?.lineItemId,
  advertiser_id: detail.slot?.advertiserId,
  campaign_id: detail.slot?.campaignId,
  creative_size: detail.slot?.size,
});

/**
 * Maps a tag event onto the slot event it stands for. Fill, miss and errors
 * keep the slot event names the auction used, so fill rate stays one query
 * across providers. The viewable impression uses the internal ads' exact
 * shape (adLogEvent): the provider in ad_provider_id and the creative as the
 * target, so one query covers every ad on the platform. It is the strict
 * MRC measurement under the strict name; the tag reports no loose
 * impression and no click, so neither is invented here.
 */
export const toAdSlotLogEvent = (
  type: ContentIgniteEventName,
  detail: ContentIgniteEventDetail = {},
  utm?: AdUtm,
): LogEventPayload => {
  switch (type) {
    case 'ci_al':
      return {
        event_name: LogEvent.FillAdSlot,
        extra: getSlotLogExtra(detail, utm, creativeLogExtra(detail)),
      };
    case 'ci_am':
      return {
        event_name: LogEvent.EmptyAdSlot,
        extra: getSlotLogExtra(detail, utm, { reason: detail.msg }),
      };
    case 'ci_cd':
      return {
        event_name: LogEvent.EmptyAdSlot,
        extra: getSlotLogExtra(detail, utm, { reason: 'consent_denied' }),
      };
    case 'ci_te':
      return {
        event_name: LogEvent.AdSlotError,
        extra: getSlotLogExtra(detail, utm, { error_type: detail.msg }),
      };
    case 'ci_ai':
    default:
      return {
        event_name: AdActions.Viewable,
        target_type: 'ad',
        target_id: String(detail.slot?.creativeId ?? detail.config_id ?? ''),
        ad_provider_id: CONTENT_IGNITE_PROVIDER_ID,
        extra: getSlotLogExtra(detail, utm, creativeLogExtra(detail)),
      };
  }
};

/**
 * Forwards the tag's events to the logger for as long as the subscription
 * lives. Window-level, because the tag dispatches there.
 */
export const subscribeContentIgniteEvents = (
  onEvent: (event: LogEventPayload) => void,
  utm?: AdUtm,
): (() => void) => {
  const listeners = CONTENT_IGNITE_EVENTS.map((type) => {
    const listener = (event: Event): void =>
      onEvent(
        toAdSlotLogEvent(
          type,
          (event as CustomEvent<ContentIgniteEventDetail>).detail ?? {},
          utm,
        ),
      );
    window.addEventListener(type, listener);
    return () => window.removeEventListener(type, listener);
  });

  return () => listeners.forEach((unsubscribe) => unsubscribe());
};
