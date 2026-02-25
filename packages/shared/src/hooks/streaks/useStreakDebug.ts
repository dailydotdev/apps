import { useCallback, useRef, useState, useSyncExternalStore } from 'react';
import { UrgencyLevel } from './useStreakUrgency';
import type { StreakAnimationState } from './useStreakIncrement';

export interface StreakFeatureToggles {
  animatedCounter: boolean;
  milestoneTimeline: boolean;
  urgencyNudges: boolean;
}

interface UseStreakDebugReturn {
  isDebugMode: boolean;
  features: StreakFeatureToggles;
  toggleFeature: (feature: keyof StreakFeatureToggles) => void;
  debugUrgency: UrgencyLevel | null;
  debugAnimationOverride: StreakAnimationState | null;
  debugStreakOverride: number | null;
  triggerIncrementAnimation: () => void;
  cycleUrgency: () => void;
  setDebugStreak: (value: number) => void;
  resetDebug: () => void;
}

const URGENCY_CYCLE: UrgencyLevel[] = [
  UrgencyLevel.None,
  UrgencyLevel.Low,
  UrgencyLevel.Medium,
  UrgencyLevel.High,
];

let globalDebugStreak: number | null = null;
const debugStreakListeners = new Set<() => void>();

const subscribeDebugStreak = (listener: () => void): (() => void) => {
  debugStreakListeners.add(listener);
  return () => debugStreakListeners.delete(listener);
};

const getDebugStreakSnapshot = (): number | null => globalDebugStreak;
const getDebugStreakServerSnapshot = (): number | null => null;

const setGlobalDebugStreak = (value: number | null): void => {
  globalDebugStreak = value;
  debugStreakListeners.forEach((listener) => listener());
};

export const useStreakDebug = (): UseStreakDebugReturn => {
  const [isDebugMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return new URLSearchParams(window.location.search).has('debugStreak');
  });

  const [features, setFeatures] = useState<StreakFeatureToggles>({
    animatedCounter: true,
    milestoneTimeline: true,
    urgencyNudges: true,
  });

  const [debugUrgency, setDebugUrgency] = useState<UrgencyLevel | null>(null);
  const [debugAnimationOverride, setDebugAnimationOverride] =
    useState<StreakAnimationState | null>(null);

  const debugStreakOverride = useSyncExternalStore(
    subscribeDebugStreak,
    getDebugStreakSnapshot,
    getDebugStreakServerSnapshot,
  );

  const animationTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const triggerIncrementAnimation = useCallback(() => {
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }
    setDebugAnimationOverride('incrementing');
    animationTimerRef.current = setTimeout(
      () => setDebugAnimationOverride('done'),
      3200,
    );
  }, []);

  const toggleFeature = useCallback(
    (feature: keyof StreakFeatureToggles) => {
      setFeatures((prev) => {
        const newValue = !prev[feature];

        if (feature === 'animatedCounter' && newValue) {
          triggerIncrementAnimation();
        }

        if (feature === 'urgencyNudges' && newValue) {
          setDebugUrgency(UrgencyLevel.Medium);
        }

        if (feature === 'urgencyNudges' && !newValue) {
          setDebugUrgency(null);
        }

        return { ...prev, [feature]: newValue };
      });
    },
    [triggerIncrementAnimation],
  );

  const cycleUrgency = useCallback(() => {
    setDebugUrgency((prev) => {
      const currentIndex = prev ? URGENCY_CYCLE.indexOf(prev) : -1;
      const nextIndex = (currentIndex + 1) % URGENCY_CYCLE.length;
      return URGENCY_CYCLE[nextIndex];
    });
  }, []);

  const setDebugStreak = useCallback((value: number) => {
    setGlobalDebugStreak(value);
  }, []);

  const resetDebug = useCallback(() => {
    setDebugUrgency(null);
    setDebugAnimationOverride(null);
    setGlobalDebugStreak(null);
    setFeatures({
      animatedCounter: true,
      milestoneTimeline: true,
      urgencyNudges: true,
    });
  }, []);

  return {
    isDebugMode,
    features,
    toggleFeature,
    debugUrgency,
    debugAnimationOverride,
    debugStreakOverride,
    triggerIncrementAnimation,
    cycleUrgency,
    setDebugStreak,
    resetDebug,
  };
};
