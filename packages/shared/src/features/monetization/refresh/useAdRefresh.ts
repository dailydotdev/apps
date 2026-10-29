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
import { useAdRefreshContext } from './AdRefreshContext';

export const AD_REFRESH_TICK_MS = 1_000;

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
  count: number;
  hovered: boolean;
  busy: boolean;
  stopped: boolean;
  pause: AdRefreshPause | null;
  pauses: Record<AdRefreshPause, AdRefreshPauseStats>;
}

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
  refresh?: AdRefreshConfig | null;
  disabled?: boolean;
  onRefresh: (attempt: AdRefreshAttempt) => Promise<AdRefreshOutcome>;
  onStop: (stop: AdRefreshStop) => void;
}

export const useAdRefresh = ({
  refresh,
  disabled = false,
  onRefresh,
  onStop,
}: UseAdRefreshProps): {
  ref: (node?: Element | null) => void;
  policy: AdRefreshPolicy | null;
} => {
  const { getSessionCount, countSessionRefresh } = useAdRefreshContext();
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
  const state = useRef<SlotState>({
    elapsed: 0,
    shownAt: null,
    count: 0,
    hovered: false,
    busy: false,
    stopped: false,
    pause: null,
    pauses: createPauses(),
  });

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
    [getSessionCount],
  );

  const ref = useCallback(
    (element?: Element | null) => {
      inViewRef(element);
      setNode(element ?? null);
    },
    [inViewRef],
  );

  useEffect(() => {
    if (!disabled && !policy && state.current.count > 0) {
      stop(AdRefreshStopReason.NoConfig);
    }
  }, [disabled, policy, stop]);

  useEffect(() => {
    if (!node || !policy) {
      return undefined;
    }

    const onEnter = () => {
      state.current.hovered = true;
    };
    const onLeave = () => {
      state.current.hovered = false;
    };
    const onClick = () => stop(AdRefreshStopReason.Clicked);

    node.addEventListener('mouseenter', onEnter);
    node.addEventListener('mouseleave', onLeave);
    node.addEventListener('click', onClick, true);
    node.addEventListener('auxclick', onClick, true);

    return () => {
      node.removeEventListener('mouseenter', onEnter);
      node.removeEventListener('mouseleave', onLeave);
      node.removeEventListener('click', onClick, true);
      node.removeEventListener('auxclick', onClick, true);
    };
  }, [node, policy, stop]);

  useEffect(() => {
    if (!policy) {
      return undefined;
    }

    trackActivity();

    const interval = setInterval(() => {
      const { current } = state;

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

      const now = Date.now();
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
        current.pauses[pause].ms += AD_REFRESH_TICK_MS;
        current.pause = pause;
        return;
      }

      current.pause = null;
      current.elapsed += AD_REFRESH_TICK_MS;

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
            countSessionRefresh();
          }
        })
        .finally(() => {
          current.busy = false;
        });
    }, AD_REFRESH_TICK_MS);

    return () => clearInterval(interval);
  }, [policy, getSessionCount, countSessionRefresh, stop]);

  return { ref, policy };
};
