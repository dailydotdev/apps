import { useEffect, useRef } from 'react';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import type { WorldDistrict } from '../../graphql/world';
import { levelOf, nearestLevelUp } from './ladder';
import type { WorldState } from './worldState';

/**
 * Where a visit came from, as far as a client can honestly tell.
 *
 * Referrer only, and deliberately coarse. `external` is the question worth
 * answering, because it is the one thing no other event can see: a link that has
 * left the product and come back with somebody on it. Navigation inside the app
 * is already attributed by the click that caused it (`ProfileWorldToggle`), so
 * this does not try to beat `document.referrer`'s known blind spot, which is
 * that a soft navigation leaves it describing whatever last hard-loaded.
 */
const worldSource = (): 'direct' | 'internal' | 'external' => {
  const { referrer } = globalThis.document ?? {};
  if (!referrer) {
    return 'direct';
  }

  try {
    return new URL(referrer).origin === globalThis.location.origin
      ? 'internal'
      : 'external';
  } catch {
    // A referrer we cannot parse is not a referrer we can attribute.
    return 'direct';
  }
};

interface UseWorldLogProps {
  userId: string;
  isOwn: boolean;
  /** The handheld renderer tier, which is a different product and a different boot. */
  isLite: boolean;
  /** Districts and settings have settled, so we know whether this world is refused. */
  isSettled: boolean;
  isPrivate: boolean;
  /** Six realms of bare ground. Still a world, and still worth counting as one. */
  isUnbuilt: boolean;
  /** The engine has this reader's world standing. */
  isReady: boolean;
  /** Why the boot died, if it did. */
  failure?: string;
  state: WorldState;
  districts?: WorldDistrict[];
}

/**
 * The world's own funnel: one `world view` per visit, resolving to exactly one
 * `world ready` or one `world boot failed`.
 *
 * Kept as three events rather than one with an outcome field because the view is
 * knowable long before the outcome is, and a single event would have to wait for
 * the slowest boot on the worst connection to report the visit at all. Which is
 * exactly the population that never reports.
 *
 * A hidden world is the one visit with no outcome: nothing is raised, so nothing
 * succeeds or fails. It is still a view, and `is_private` is what separates it
 * from a boot that never came back.
 *
 * Every guard is keyed by reader rather than by mount: a soft navigation from one
 * world to another keeps this component, its engine and its refs, and the second
 * world is a second visit.
 */
export const useWorldLog = ({
  userId,
  isOwn,
  isLite,
  isSettled,
  isPrivate,
  isUnbuilt,
  isReady,
  failure,
  state,
  districts,
}: UseWorldLogProps): void => {
  const { logEvent } = useLogContext();
  const viewedFor = useRef<string | null>(null);
  const settledFor = useRef<string | null>(null);
  const startedAt = useRef(0);

  /* Read through a ref so the effects below depend on the reader and the one
     fact that moved them, and not on a render-scoped `logEvent` or on a `state`
     the engine replaces sixty times a second while the replay runs. */
  const latest = useRef({
    logEvent,
    isOwn,
    isLite,
    isPrivate,
    state,
    districts,
  });
  latest.current = { logEvent, isOwn, isLite, isPrivate, state, districts };

  useEffect(() => {
    if (!isSettled || viewedFor.current === userId) {
      return;
    }
    viewedFor.current = userId;
    settledFor.current = null;
    startedAt.current = globalThis.performance?.now() ?? 0;

    const { current } = latest;
    current.logEvent({
      event_name: LogEvent.WorldView,
      target_id: userId,
      extra: JSON.stringify({
        source: worldSource(),
        is_own: current.isOwn,
        is_private: current.isPrivate,
        is_lite: current.isLite,
      }),
    });
  }, [isSettled, userId]);

  useEffect(() => {
    if (viewedFor.current !== userId || settledFor.current === userId) {
      return;
    }
    if (!isReady && !failure) {
      return;
    }
    settledFor.current = userId;

    const { current } = latest;
    /* Measured from the view, so it covers the districts query and the engine
       raising the world. It does NOT cover the renderer chunk: this hook only
       exists once that has landed, and the wait before it is the thing the
       profile's prefetch is already trying to spend. */
    const bootMs = Math.round(
      (globalThis.performance?.now() ?? 0) - startedAt.current,
    );

    if (failure) {
      current.logEvent({
        event_name: LogEvent.WorldBootFailed,
        target_id: userId,
        extra: JSON.stringify({
          is_own: current.isOwn,
          is_lite: current.isLite,
          boot_ms: bootMs,
          reason: failure,
        }),
      });
      return;
    }

    /* Off the districts, not off `state.rank`, which holds REALMS at the top
       level and is scored on the realm ladder. The level anyone is ever shown is
       a district's. */
    const rows = current.districts ?? [];
    const nearest = nearestLevelUp(
      rows.map(({ niche, reads }) => ({
        key: niche.slug,
        name: niche.slug,
        reads,
      })),
    );

    current.logEvent({
      event_name: LogEvent.WorldReady,
      target_id: userId,
      extra: JSON.stringify({
        is_own: current.isOwn,
        is_lite: current.isLite,
        is_unbuilt: isUnbuilt,
        boot_ms: bootMs,
        articles: current.state.articles ?? 0,
        districts: current.state.districts ?? 0,
        realms: current.state.realms ?? 0,
        top_level: rows.reduce(
          (top, { reads }) => Math.max(top, levelOf(reads)),
          0,
        ),
        /* The baseline the level-up nudge would be built on: how far the closest
           district is from its next rung, at the moment somebody looked. Null
           when every district has topped out, which is nobody yet. */
        nearest_gap: nearest?.toNext ?? null,
      }),
    });
  }, [failure, isReady, isUnbuilt, userId]);
};
