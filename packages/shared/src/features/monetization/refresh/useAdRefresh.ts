import type { MutableRefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import type { AdRefreshConfig } from '../../../graphql/posts';
import type {
  AdRefreshPauseStats,
  AdRefreshPolicy,
  AdRefreshStats,
} from './adRefresh';
import {
  AdRefreshOutcome,
  AdRefreshPause,
  AdRefreshStopReason,
  getAdRefreshPolicy,
  MIN_VISIBLE_PERCENT,
} from './adRefresh';

export const AD_REFRESH_TICK_MS = 1_000;
const MAX_VISIBLE_TICK_MS = 2 * AD_REFRESH_TICK_MS;

const activityEvents = [
  'pointermove',
  'pointerdown',
  'keydown',
  'scroll',
  'wheel',
  'touchstart',
];

let lastActivityAt = 0;
let isTrackingActivity = false;

const onActivity = (): void => {
  lastActivityAt = Date.now();
};

const trackActivity = (): void => {
  if (isTrackingActivity || typeof window === 'undefined') {
    return;
  }

  isTrackingActivity = true;
  onActivity();
  activityEvents.forEach((event) =>
    window.addEventListener(event, onActivity, {
      capture: true,
      passive: true,
    }),
  );
};

const createPauses = (): Record<AdRefreshPause, AdRefreshPauseStats> => ({
  [AdRefreshPause.Hidden]: { count: 0, ms: 0 },
  [AdRefreshPause.Idle]: { count: 0, ms: 0 },
  [AdRefreshPause.Hover]: { count: 0, ms: 0 },
});

interface SlotState {
  elapsed: number;
  shownAt: number | null;
  tickedAt: number | null;
  count: number;
  hovered: boolean;
  busy: boolean;
  stopped: boolean;
  pause: AdRefreshPause | null;
  pauses: Record<AdRefreshPause, AdRefreshPauseStats>;
}

const createSlotState = (): SlotState => ({
  elapsed: 0,
  shownAt: null,
  tickedAt: null,
  count: 0,
  hovered: false,
  busy: false,
  stopped: false,
  pause: null,
  pauses: createPauses(),
});

const session = { count: 0, slots: new Map<string, SlotState>() };

export const resetAdRefreshSession = (): void => {
  session.count = 0;
  session.slots.clear();
};

const getSessionCount = (): number => session.count;

const resumeSlotState = (id?: string): SlotState => {
  const saved = id ? session.slots.get(id) : undefined;

  if (!saved) {
    const slot = createSlotState();
    if (id) {
      session.slots.set(id, slot);
    }
    return slot;
  }

  saved.shownAt = null;
  saved.tickedAt = null;
  saved.hovered = false;
  saved.pause = null;
  return saved;
};

const useSlotState = (id?: string): MutableRefObject<SlotState> => {
  const state = useRef<SlotState>();
  const stateId = useRef(id);

  if (!state.current) {
    state.current = resumeSlotState(id);
  } else if (id && id !== stateId.current) {
    const saved = session.slots.get(id);
    if (saved) {
      state.current = saved;
    } else {
      session.slots.set(id, state.current);
    }
  }
  stateId.current = id;

  return state as MutableRefObject<SlotState>;
};

export interface AdRefreshAttempt {
  count: number;
  sessionCount: number;
  policy: AdRefreshPolicy;
  stats: AdRefreshStats;
}

export interface AdRefreshStop {
  reason: AdRefreshStopReason;
  count: number;
  sessionCount: number;
  policy: AdRefreshPolicy | null;
}

interface UseAdRefreshProps {
  id?: string;
  refresh?: AdRefreshConfig | null;
  disabled?: boolean;
  onRefresh: (attempt: AdRefreshAttempt) => Promise<AdRefreshOutcome>;
  onStop: (stop: AdRefreshStop) => void;
}

export const useAdRefresh = ({
  id,
  refresh,
  disabled = false,
  onRefresh,
  onStop,
}: UseAdRefreshProps): {
  ref: (node?: Element | null) => void;
  policy: AdRefreshPolicy | null;
  onAdClick: () => void;
} => {
  const policy = useMemo(
    () => (disabled ? null : getAdRefreshPolicy(refresh)),
    [disabled, refresh],
  );
  const { ref: inViewRef, inView } = useInView({
    threshold: (policy?.minVisiblePercent ?? MIN_VISIBLE_PERCENT) / 100,
    skip: !policy,
  });
  const [node, setNode] = useState<Element | null>(null);
  const isInView = useRef(inView);
  isInView.current = inView;
  const policyRef = useRef(policy);
  policyRef.current = policy;
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;
  const onStopRef = useRef(onStop);
  onStopRef.current = onStop;
  const state = useSlotState(id);

  const stop = useCallback(
    (reason: AdRefreshStopReason) => {
      const { current } = state;

      if (current.stopped) {
        return;
      }

      current.stopped = true;
      onStopRef.current({
        reason,
        count: current.count,
        sessionCount: getSessionCount(),
        policy: policyRef.current,
      });
    },
    [state],
  );

  const ref = useCallback(
    (element?: Element | null) => {
      inViewRef(element);
      setNode(element ?? null);
    },
    [inViewRef],
  );

  useEffect(() => {
    const { current } = state;

    if (!disabled && !policy && current.count > 0) {
      stop(AdRefreshStopReason.NoConfig);
    }
  }, [disabled, policy, state, stop]);

  useEffect(() => {
    if (!node || !policy) {
      return undefined;
    }

    const setHovered = (hovered: boolean) => {
      const { current } = state;
      current.hovered = hovered;
    };
    const onEnter = (event: Event) => {
      if ((event as PointerEvent).pointerType === 'mouse') {
        setHovered(true);
      }
    };
    const onLeave = () => setHovered(false);

    node.addEventListener('pointerenter', onEnter);
    node.addEventListener('pointerleave', onLeave);

    return () => {
      node.removeEventListener('pointerenter', onEnter);
      node.removeEventListener('pointerleave', onLeave);
    };
  }, [node, policy, state]);

  const onAdClick = useCallback(() => {
    if (policyRef.current) {
      stop(AdRefreshStopReason.Clicked);
    }
  }, [stop]);

  useEffect(() => {
    if (!policy) {
      return undefined;
    }

    trackActivity();

    const interval = setInterval(() => {
      const { current } = state;
      const now = Date.now();
      const sinceLastTick =
        now - (current.tickedAt ?? now - AD_REFRESH_TICK_MS);
      current.tickedAt = now;

      if (current.busy || current.stopped) {
        return;
      }

      if (!isInView.current) {
        current.pause = null;
        return;
      }

      if (current.count >= policy.maxPerSlot) {
        stop(AdRefreshStopReason.SlotCap);
        return;
      }

      if (getSessionCount() >= policy.maxPerSession) {
        stop(AdRefreshStopReason.SessionCap);
        return;
      }

      const shownAt = current.shownAt ?? now;
      current.shownAt = shownAt;

      let pause: AdRefreshPause | null = null;
      if (document.visibilityState !== 'visible') {
        pause = AdRefreshPause.Hidden;
      } else if (now - lastActivityAt > policy.idleAfterMs) {
        pause = AdRefreshPause.Idle;
      } else if (current.hovered) {
        pause = AdRefreshPause.Hover;
      }

      if (pause) {
        if (current.pause !== pause) {
          current.pauses[pause].count += 1;
        }
        current.pauses[pause].ms += sinceLastTick;
        current.pause = pause;
        return;
      }

      current.pause = null;
      current.elapsed += Math.min(sinceLastTick, MAX_VISIBLE_TICK_MS);

      if (current.elapsed < policy.intervalMs) {
        return;
      }

      current.busy = true;
      onRefreshRef
        .current({
          count: current.count + 1,
          sessionCount: getSessionCount() + 1,
          policy,
          stats: {
            visibleMs: current.elapsed,
            shownMs: now - shownAt,
            pauses: current.pauses,
          },
        })
        .catch(() => AdRefreshOutcome.Failed)
        .then((outcome) => {
          current.elapsed = 0;
          current.shownAt = null;
          current.pause = null;
          current.pauses = createPauses();

          if (outcome === AdRefreshOutcome.Refreshed) {
            current.count += 1;
            session.count += 1;
            return;
          }

          stop(
            outcome === AdRefreshOutcome.NoFill
              ? AdRefreshStopReason.NoFill
              : AdRefreshStopReason.Failed,
          );
        })
        .finally(() => {
          current.busy = false;
        });
    }, AD_REFRESH_TICK_MS);

    return () => clearInterval(interval);
  }, [policy, state, stop]);

  return { ref, policy, onAdClick };
};
