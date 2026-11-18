import type { PatchyConfig, PatchyTrigger } from './patchyConfig';
import { getPatchyConfig } from './patchyConfig';

// Different reactions show one after the other: the next waits this long after
// the previous one started (a peek is in view for about 3s).
export const PATCHY_PEEK_GAP_MS = 4000;
// Reactions waiting for their turn; past this the lowest priority is dropped.
export const PATCHY_PEEK_QUEUE_LIMIT = 3;

interface PendingPeek {
  trigger: PatchyTrigger;
  at: number;
}

export interface PatchyPeekScheduler {
  // Asks for a peek. Returns false when it was dropped: the same reaction
  // peeked within the config's cooldown or is already waiting, or the queue is
  // full of higher-priority reactions.
  request: (trigger: PatchyTrigger, now: number) => boolean;
  // Hands out the next peek (highest priority, then oldest) once nothing
  // blocks it and the previous peek has had its gap. A waiting peek is
  // dropped when its TTL runs out.
  take: (now: number, isBlocked: boolean) => PatchyTrigger | null;
  hasPending: () => boolean;
}

export const createPatchyPeekScheduler = (
  getConfig: () => PatchyConfig = getPatchyConfig,
): PatchyPeekScheduler => {
  let lastShownAt: number | null = null;
  const lastShownByTrigger: Partial<Record<PatchyTrigger, number>> = {};
  let queue: PendingPeek[] = [];

  const isCoolingDown = (trigger: PatchyTrigger, now: number) => {
    const shownAt = lastShownByTrigger[trigger];
    return shownAt !== undefined && now - shownAt < getConfig().cooldownMs;
  };

  const isInGap = (now: number) =>
    lastShownAt !== null && now - lastShownAt < PATCHY_PEEK_GAP_MS;

  const dropStale = (now: number) => {
    const { reactions } = getConfig();
    queue = queue.filter(
      ({ trigger, at }) => now - at <= reactions[trigger].ttlMs,
    );
  };

  return {
    request: (trigger, now) => {
      const { reactions } = getConfig();
      if (!reactions[trigger].enabled || isCoolingDown(trigger, now)) {
        return false;
      }
      dropStale(now);
      if (queue.some((peek) => peek.trigger === trigger)) {
        return false;
      }
      // Stable sort: equal priorities keep their arrival order.
      queue = [...queue, { trigger, at: now }]
        .sort(
          (a, b) =>
            reactions[b.trigger].priority - reactions[a.trigger].priority,
        )
        .slice(0, PATCHY_PEEK_QUEUE_LIMIT);
      return queue.some((peek) => peek.trigger === trigger);
    },
    take: (now, isBlocked) => {
      dropStale(now);
      if (!queue.length || isBlocked || isInGap(now)) {
        return null;
      }
      const [{ trigger }, ...rest] = queue;
      queue = rest;
      lastShownAt = now;
      lastShownByTrigger[trigger] = now;
      return trigger;
    },
    hasPending: () => queue.length > 0,
  };
};

// One per page session, so remounting the rail (layout switches) can't reset
// the cooldowns.
export const patchyPeekScheduler = createPatchyPeekScheduler();
