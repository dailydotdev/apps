import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import type { StreakRingState } from '../../hooks/streaks/useStreakRingState';
import { LogEvent, TargetType } from '../../lib/log';
import { storageWrapper } from '../../lib/storageWrapper';
import type { PatchyFace, PatchyMood, PatchyTrigger } from './patchyConfig';
import { getPatchyConfig } from './patchyConfig';
import { subscribePatchyEvents } from './patchyEvents';
import type { PatchyEvent } from './patchyEvents';
import { patchyPeekScheduler } from './patchyPeekScheduler';
import {
  getNightKey,
  getPatchyMood,
  isAway,
  isFridayDeploy,
  isLateNight,
} from './patchyTriggers';
import { usePatchyConfigSync } from './usePatchyConfigSync';

// How long the icon keeps the trigger's face, peek included.
const FACE_HOLD_MS = 6000;
const POLL_MS = 500;
// Scrolling within this long counts as an active scroll.
const SCROLL_IDLE_MS = 800;
const MOOD_TICK_MS = 60 * 1000;

const lateNightKey = (userId: string) => `patchy_late_night:${userId}`;
const welcomeKey = (userId: string) => `patchy_welcome:${userId}`;

const isModalOpen = (): boolean =>
  !!document.querySelector(
    '.ReactModal__Overlay, [role="dialog"][aria-modal="true"]',
  );

export interface PatchyPeekState {
  trigger: PatchyTrigger;
  id: number;
}

interface UsePatchyCompanionProps {
  isEnabled: boolean;
  isReactionsEnabled: boolean;
  isStreakLoading: boolean;
  state: StreakRingState;
  hasReadToday: boolean;
  lastViewAt?: Date | string | null;
}

interface UsePatchyCompanion {
  face: PatchyFace;
  mood: PatchyMood;
  peek: PatchyPeekState | null;
  onPeekDone: () => void;
}

// The rail companion's brain: maps what the user does to a peek, runs it
// through the rate limiter, and keeps the icon's face in sync. Mounted once,
// in the laptop rail.
export const usePatchyCompanion = ({
  isEnabled,
  isReactionsEnabled,
  isStreakLoading,
  state,
  hasReadToday,
  lastViewAt,
}: UsePatchyCompanionProps): UsePatchyCompanion => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [peek, setPeek] = useState<PatchyPeekState | null>(null);
  const [faceOverride, setFaceOverride] = useState<PatchyFace | null>(null);
  const [isGreeted, setIsGreeted] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [pendingVersion, setPendingVersion] = useState(0);
  const lastScrollAtRef = useRef(0);
  const peekIdRef = useRef(0);
  const isActive = isEnabled && isReactionsEnabled && !!user;
  const config = getPatchyConfig();
  usePatchyConfigSync(isEnabled);

  useEffect(() => {
    if (!isEnabled) {
      return undefined;
    }
    // Warm the cache so a face swap never flashes an empty circle.
    Object.values(getPatchyConfig().faceImage).forEach((src) => {
      const image = new Image();
      image.src = src;
    });
    const id = setInterval(() => setNow(new Date()), MOOD_TICK_MS);
    return () => clearInterval(id);
  }, [isEnabled]);

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    const onScroll = () => {
      lastScrollAtRef.current = Date.now();
    };
    // Capture: the feed scrolls inside its own containers on some layouts.
    window.addEventListener('scroll', onScroll, {
      capture: true,
      passive: true,
    });
    return () =>
      window.removeEventListener('scroll', onScroll, { capture: true });
  }, [isActive]);

  const request = useCallback((trigger: PatchyTrigger) => {
    if (patchyPeekScheduler.request(trigger, Date.now())) {
      setPendingVersion((version) => version + 1);
    }
  }, []);

  const requestLateNight = useCallback(() => {
    const date = new Date();
    const { lateNight } = getPatchyConfig();
    if (!user || !isLateNight(date, lateNight)) {
      return;
    }
    const night = getNightKey(date, lateNight);
    if (storageWrapper.getItem(lateNightKey(user.id)) === night) {
      return;
    }
    if (patchyPeekScheduler.request('late_night', date.getTime())) {
      storageWrapper.setItem(lateNightKey(user.id), night);
      setPendingVersion((version) => version + 1);
    }
  }, [user]);

  const away =
    !isStreakLoading &&
    isAway(lastViewAt, hasReadToday, new Date(), config.awayMs);

  // Coming back after 2+ days: one wave per return, keyed on the last read so
  // a reload doesn't wave again.
  useEffect(() => {
    if (!isActive || !away || !lastViewAt || !user) {
      return;
    }
    const marker = new Date(lastViewAt).toISOString();
    if (storageWrapper.getItem(welcomeKey(user.id)) === marker) {
      setIsGreeted(true);
      return;
    }
    storageWrapper.setItem(welcomeKey(user.id), marker);
    request('welcome_back');
  }, [isActive, away, lastViewAt, user, request]);

  useEffect(() => {
    if (!isActive) {
      return undefined;
    }
    requestLateNight();
    return subscribePatchyEvents((event: PatchyEvent) => {
      requestLateNight();
      if (event.type === 'upvote' || event.type === 'bookmark') {
        request(event.type);
        return;
      }
      if (event.type === 'streak_day') {
        request('streak_day');
        return;
      }
      if (
        isFridayDeploy(new Date(), event.tags, getPatchyConfig().fridayDeploy)
      ) {
        request('friday_deploy');
      }
    });
  }, [isActive, request, requestLateNight]);

  // Wait for a calm moment (no scroll, no modal, tab visible) to show it.
  useEffect(() => {
    if (!isActive || peek || !patchyPeekScheduler.hasPending()) {
      return undefined;
    }
    const id = setInterval(() => {
      const isBlocked =
        document.hidden ||
        Date.now() - lastScrollAtRef.current < SCROLL_IDLE_MS ||
        isModalOpen();
      const trigger = patchyPeekScheduler.take(Date.now(), isBlocked);
      if (!trigger) {
        if (!patchyPeekScheduler.hasPending()) {
          clearInterval(id);
        }
        return;
      }
      clearInterval(id);
      logEvent({
        event_name: LogEvent.Impression,
        target_type: TargetType.PatchyPeek,
        target_id: trigger,
      });
      if (trigger === 'welcome_back') {
        setIsGreeted(true);
      }
      setFaceOverride(getPatchyConfig().reactions[trigger].face);
      if (!prefersReducedMotion) {
        peekIdRef.current += 1;
        setPeek({ trigger, id: peekIdRef.current });
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, [isActive, peek, pendingVersion, logEvent, prefersReducedMotion]);

  useEffect(() => {
    if (!faceOverride) {
      return undefined;
    }
    const timeout = setTimeout(() => setFaceOverride(null), FACE_HOLD_MS);
    return () => clearTimeout(timeout);
  }, [faceOverride]);

  const onPeekDone = useCallback(() => setPeek(null), []);

  const mood = getPatchyMood({ state, hasReadToday, lastViewAt, now, config });
  const restingFace =
    mood === 'away' && isGreeted ? 'happy' : config.moods[mood].face;

  return {
    face: faceOverride ?? restingFace,
    mood,
    peek: isActive ? peek : null,
    onPeekDone,
  };
};
