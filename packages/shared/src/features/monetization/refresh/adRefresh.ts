import { z } from 'zod';
import type { AdRefreshConfig } from '../../../graphql/posts';
import { getDailyClientPlatform } from '../../../lib/func';

export enum AdRefreshSlot {
  FeedCard = 'feed_card',
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
}

export enum AdRefreshPause {
  Hidden = 'hidden',
  Idle = 'idle',
  Hover = 'hover',
}

const DEFAULT_IDLE_AFTER_SEC = 60;
export const MIN_VISIBLE_PERCENT = 50;

const adRefreshConfigSchema = z.object({
  id: z.string(),
  intervalSec: z.number().positive(),
  maxPerSlot: z.number().int().nonnegative(),
  maxPerSession: z.number().int().nonnegative(),
  idleAfterSec: z.number().positive().optional(),
  minVisiblePercent: z.number().max(100).optional(),
});

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
  const result = adRefreshConfigSchema.safeParse(refresh);

  if (!result.success) {
    return null;
  }

  const config = result.data;

  if (!config.maxPerSlot || !config.maxPerSession) {
    return null;
  }

  return {
    configId: config.id,
    intervalMs: config.intervalSec * 1_000,
    idleAfterMs: (config.idleAfterSec ?? DEFAULT_IDLE_AFTER_SEC) * 1_000,
    maxPerSlot: config.maxPerSlot,
    maxPerSession: config.maxPerSession,
    minVisiblePercent: Math.max(
      config.minVisiblePercent ?? MIN_VISIBLE_PERCENT,
      MIN_VISIBLE_PERCENT,
    ),
  };
};

export const getAdRefreshPlatform = ({
  version,
  isPhone,
}: {
  version?: string;
  isPhone: boolean;
}): AdRefreshPlatform => {
  switch (getDailyClientPlatform(version)) {
    case 'extension':
      return AdRefreshPlatform.Extension;
    case 'android':
      return AdRefreshPlatform.Android;
    case 'ios':
      return AdRefreshPlatform.Ios;
    default:
      return isPhone
        ? AdRefreshPlatform.WebMobile
        : AdRefreshPlatform.WebDesktop;
  }
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
