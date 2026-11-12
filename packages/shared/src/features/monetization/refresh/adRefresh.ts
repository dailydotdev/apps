import type { QueryKey } from '@tanstack/react-query';
import type { Ad, AdRefreshConfig } from '../../../graphql/posts';
import { isExtension, isIOSNative } from '../../../lib/func';
import { tablet } from '../../../styles/media';

export enum AdRefreshSlot {
  FeedCard = 'feed_card',
  FeedWidget = 'feed_widget',
}

/**
 * Where a rotated or refreshed creative goes for an ad that is not one of the
 * feed's own ads, e.g. the feed widget rail's pinned slot, which has its own
 * query. Both refresh engines take it (v1 `useAutoRotatingAds`, v2
 * `useFeedAdRefresh`). Without it, they write into the feed's ad list at the
 * ad's `index`, which would swap one of the feed's ads instead.
 */
export interface AdRotationTarget {
  /** v1: its own key for the rotation timer, apart from the feed's ad list. */
  queryKey: QueryKey;
  /** Shows the new creative in the slot. */
  replace: (ad: Ad) => void;
  /** v2: how the refresh logs name the slot. */
  slot?: AdRefreshSlot;
}

export enum AdRefreshPlatform {
  Extension = 'extension',
  WebDesktop = 'web_desktop',
  WebMobile = 'web_mobile',
  Ios = 'ios',
  Android = 'android',
}

export enum AdRefreshOutcome {
  Refreshed = 'refreshed',
  NoFill = 'no_fill',
  Failed = 'failed',
}

export enum AdRefreshStopReason {
  Clicked = 'clicked',
  SlotCap = 'slot_cap',
  SessionCap = 'session_cap',
  NoConfig = 'no_config',
  NoFill = 'no_fill',
  Failed = 'failed',
}

export enum AdRefreshPause {
  Hidden = 'hidden',
  Idle = 'idle',
  Hover = 'hover',
}

const DEFAULT_IDLE_AFTER_SEC = 60;
export const MIN_VISIBLE_PERCENT = 50;

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isPositive = (value: unknown): value is number =>
  isNumber(value) && value > 0;

const isCount = (value: unknown): value is number =>
  Number.isSafeInteger(value) && (value as number) >= 0;

const isValidConfig = (
  refresh: AdRefreshConfig | null | undefined,
): refresh is AdRefreshConfig =>
  typeof refresh === 'object' &&
  refresh !== null &&
  !Array.isArray(refresh) &&
  typeof refresh.id === 'string' &&
  isPositive(refresh.intervalSec) &&
  isCount(refresh.maxPerSlot) &&
  isCount(refresh.maxPerSession) &&
  (refresh.idleAfterSec === undefined || isPositive(refresh.idleAfterSec)) &&
  (refresh.minVisiblePercent === undefined ||
    (isNumber(refresh.minVisiblePercent) && refresh.minVisiblePercent <= 100));

export interface AdRefreshPolicy {
  configId: string;
  intervalMs: number;
  idleAfterMs: number;
  maxPerSlot: number;
  maxPerSession: number;
  minVisiblePercent: number;
}

export interface AdRefreshPauseStats {
  count: number;
  ms: number;
}

export interface AdRefreshStats {
  visibleMs: number;
  shownMs: number;
  pauses: Record<AdRefreshPause, AdRefreshPauseStats>;
}

export const getAdRefreshPolicy = (
  refresh?: AdRefreshConfig | null,
): AdRefreshPolicy | null => {
  if (!isValidConfig(refresh)) {
    return null;
  }

  if (!refresh.maxPerSlot || !refresh.maxPerSession) {
    return null;
  }

  return {
    configId: refresh.id,
    intervalMs: refresh.intervalSec * 1_000,
    idleAfterMs: (refresh.idleAfterSec ?? DEFAULT_IDLE_AFTER_SEC) * 1_000,
    maxPerSlot: refresh.maxPerSlot,
    maxPerSession: refresh.maxPerSession,
    minVisiblePercent: Math.max(
      refresh.minVisiblePercent ?? MIN_VISIBLE_PERCENT,
      MIN_VISIBLE_PERCENT,
    ),
  };
};

const phoneQuery = tablet.replace('@media ', '');

export const getAdRefreshPlatform = (
  isAndroidApp?: boolean,
): AdRefreshPlatform => {
  if (isExtension) {
    return AdRefreshPlatform.Extension;
  }

  if (isIOSNative()) {
    return AdRefreshPlatform.Ios;
  }

  if (isAndroidApp) {
    return AdRefreshPlatform.Android;
  }

  return globalThis.matchMedia?.(phoneQuery).matches === false
    ? AdRefreshPlatform.WebMobile
    : AdRefreshPlatform.WebDesktop;
};

const toSec = (ms: number): number => Math.round(ms / 1_000);

const getPolicyLogExtra = (
  policy: AdRefreshPolicy,
): Record<string, unknown> => ({
  refresh_config: policy.configId,
  refresh_interval_sec: toSec(policy.intervalMs),
  refresh_max_per_slot: policy.maxPerSlot,
  refresh_max_per_session: policy.maxPerSession,
  refresh_idle_after_sec: toSec(policy.idleAfterMs),
  refresh_min_visible_percent: policy.minVisiblePercent,
});

export const getAdRefreshLogExtra = ({
  slot,
  platform,
  providerId,
  count,
  sessionCount,
  policy,
  stats,
  outcome,
  nextGenerationId,
}: {
  slot: AdRefreshSlot;
  platform: AdRefreshPlatform;
  providerId?: string;
  count: number;
  sessionCount: number;
  policy: AdRefreshPolicy;
  stats: AdRefreshStats;
  outcome: AdRefreshOutcome;
  nextGenerationId?: string;
}): Record<string, unknown> => ({
  refresh_trigger: 'auto',
  refresh_outcome: outcome,
  refresh_count: count,
  refresh_session_count: sessionCount,
  refresh_slot: slot,
  refresh_platform: platform,
  refresh_provider: providerId,
  ...getPolicyLogExtra(policy),
  refresh_visible_sec: toSec(stats.visibleMs),
  refresh_shown_sec: toSec(stats.shownMs),
  ...Object.values(AdRefreshPause).reduce<Record<string, number>>(
    (extra, pause) => ({
      ...extra,
      [`refresh_pause_${pause}_count`]: stats.pauses[pause].count,
      [`refresh_pause_${pause}_sec`]: toSec(stats.pauses[pause].ms),
    }),
    {},
  ),
  next_gen_id: nextGenerationId,
});

export const getAdRefreshStopLogExtra = ({
  slot,
  platform,
  providerId,
  reason,
  count,
  sessionCount,
  policy,
}: {
  slot: AdRefreshSlot;
  platform: AdRefreshPlatform;
  providerId?: string;
  reason: AdRefreshStopReason;
  count: number;
  sessionCount: number;
  policy: AdRefreshPolicy | null;
}): Record<string, unknown> => ({
  refresh_stop_reason: reason,
  refresh_count: count,
  refresh_session_count: sessionCount,
  refresh_slot: slot,
  refresh_platform: platform,
  refresh_provider: providerId,
  ...(policy && getPolicyLogExtra(policy)),
});
