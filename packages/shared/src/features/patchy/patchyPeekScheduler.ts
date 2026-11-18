import type { PatchyTrigger } from './patchyTriggers';
import { patchyPeeks } from './patchyTriggers';

// At most one peek every 3 minutes.
export const PATCHY_PEEK_COOLDOWN_MS = 3 * 60 * 1000;

interface PendingPeek {
  trigger: PatchyTrigger;
  at: number;
}

export interface PatchyPeekScheduler {
  // Asks for a peek. Returns false when it was dropped: still cooling down
  // from the last peek, or a peek of the same or higher priority is already
  // waiting (one pending peek at most, the rest are dropped).
  request: (trigger: PatchyTrigger, now: number) => boolean;
  // Hands out the pending peek when nothing blocks it, and starts the
  // cooldown. A blocked peek stays pending until its TTL runs out.
  take: (now: number, isBlocked: boolean) => PatchyTrigger | null;
  hasPending: () => boolean;
}

export const createPatchyPeekScheduler = (
  cooldownMs = PATCHY_PEEK_COOLDOWN_MS,
): PatchyPeekScheduler => {
  let lastShownAt: number | null = null;
  let pending: PendingPeek | null = null;

  const isCoolingDown = (now: number) =>
    lastShownAt !== null && now - lastShownAt < cooldownMs;

  const dropStale = (now: number) => {
    if (pending && now - pending.at > patchyPeeks[pending.trigger].ttlMs) {
      pending = null;
    }
  };

  return {
    request: (trigger, now) => {
      if (isCoolingDown(now)) {
        return false;
      }
      dropStale(now);
      if (
        pending &&
        patchyPeeks[pending.trigger].priority >= patchyPeeks[trigger].priority
      ) {
        return false;
      }
      pending = { trigger, at: now };
      return true;
    },
    take: (now, isBlocked) => {
      dropStale(now);
      if (!pending || isBlocked || isCoolingDown(now)) {
        return null;
      }
      const { trigger } = pending;
      pending = null;
      lastShownAt = now;
      return trigger;
    },
    hasPending: () => pending !== null,
  };
};

// One per page session, so remounting the rail (layout switches) can't reset
// the cooldown.
export const patchyPeekScheduler = createPatchyPeekScheduler();
