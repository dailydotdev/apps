import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import type { StreakRingState } from '../../hooks/streaks/useStreakRingState';
import { storageWrapper } from '../../lib/storageWrapper';
import type {
  PatchyEmote,
  PatchyFace,
  PatchyMood,
  PatchyTrigger,
} from './patchyConfig';
import {
  getPatchyConfig,
  isPatchyFaceAnimated,
  isPatchyOneShotFace,
} from './patchyConfig';
import { loadPatchyFace } from './patchyFacePlayback';
import { subscribePatchyEvents } from './patchyEvents';
import type { PatchyEvent } from './patchyEvents';
import { recordPatchyActivity } from './patchyDay';
import type { PatchyMotion } from './patchyIdle';
import { usePatchyIdle } from './patchyIdle';
import {
  getActionTrigger,
  getNightKey,
  getPatchyMood,
  isAway,
  isFridayDeploy,
  isLateNight,
} from './patchyTriggers';
import { usePatchyConfigSync } from './usePatchyConfigSync';

// How long a reaction keeps his face and its emote in the circle.
export const PATCHY_REACTION_MS = 2200;
const MOOD_TICK_MS = 60 * 1000;

// The motion each reaction plays when its face is a still image (a config
// can map a trigger to one). Animated faces bring their own.
export const patchyReactionMotion: Record<PatchyTrigger, PatchyMotion> = {
  upvote: 'hop',
  bookmark: 'wobble',
  downvote: 'wobble',
  bone: 'hop',
  streak_day: 'hop',
  late_night: 'yawn',
  friday_deploy: 'hide',
  welcome_back: 'hop',
  on_a_roll: 'hop',
  bookmark_pile: 'wobble',
};

// How many emotes float out: one, a few more for an escalation.
export const patchyReactionEmotes: Record<PatchyTrigger, number> = {
  upvote: 1,
  bookmark: 1,
  downvote: 1,
  bone: 3,
  streak_day: 1,
  late_night: 1,
  friday_deploy: 1,
  welcome_back: 2,
  on_a_roll: 3,
  bookmark_pile: 1,
};

const lateNightKey = (userId: string) => `patchy_late_night:${userId}`;
const welcomeKey = (userId: string) => `patchy_welcome:${userId}`;

interface UsePatchyCompanionProps {
  isEnabled: boolean;
  isReactionsEnabled: boolean;
  isStreakLoading: boolean;
  state: StreakRingState;
  hasReadToday: boolean;
  lastViewAt?: Date | string | null;
  // A post is open: he reads along.
  isReading?: boolean;
  // A suggestion is showing: his face while he offers it.
  offerFace?: PatchyFace | null;
}

export interface PatchyReactionState {
  trigger: PatchyTrigger;
  key: number;
}

interface UsePatchyCompanion {
  face: PatchyFace;
  mood: PatchyMood;
  // A small motion the icon plays with his face.
  motion: PatchyMotion | null;
  motionKey: string;
  // A tiny emote floating out of the circle, with how many.
  emote: PatchyEmote | null;
  emoteCount: number;
  emoteKey: number;
  // He is playing a reaction right now (an upvote, a bone...).
  isReacting: boolean;
}

// The rail companion's brain: everything happens inside the streak circle.
// What you do changes his face, plays a small motion and floats a tiny emote
// out of the circle; in between he idles (blinks, glances, yawns).
export const usePatchyCompanion = ({
  isEnabled,
  isReactionsEnabled,
  isStreakLoading,
  state,
  hasReadToday,
  lastViewAt,
  isReading = false,
  offerFace = null,
}: UsePatchyCompanionProps): UsePatchyCompanion => {
  const { user } = useAuthContext();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [reaction, setReaction] = useState<PatchyReactionState | null>(null);
  const [isGreeted, setIsGreeted] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const reactionKeyRef = useRef(0);
  const isActive = isEnabled && isReactionsEnabled && !!user;
  const config = getPatchyConfig();
  usePatchyConfigSync(isEnabled);

  useEffect(() => {
    if (!isEnabled) {
      return undefined;
    }
    // Warm the cache so a face swap never flashes an empty circle. The
    // play-once faces load once and play from that copy (patchyFacePlayback).
    Object.entries(getPatchyConfig().faceImage).forEach(([face, src]) => {
      if (isPatchyOneShotFace(face as PatchyFace)) {
        loadPatchyFace(src);
        return;
      }
      const image = new Image();
      image.src = src;
    });
    const id = setInterval(() => setNow(new Date()), MOOD_TICK_MS);
    return () => clearInterval(id);
  }, [isEnabled]);

  const react = useCallback((trigger: PatchyTrigger) => {
    if (!getPatchyConfig().reactions[trigger].enabled) {
      return;
    }
    reactionKeyRef.current += 1;
    setReaction({ trigger, key: reactionKeyRef.current });
  }, []);

  // Once a night, reading late gets a yawn.
  const reactLateNight = useCallback(() => {
    const date = new Date();
    const { lateNight } = getPatchyConfig();
    if (!user || !isLateNight(date, lateNight)) {
      return;
    }
    const night = getNightKey(date, lateNight);
    if (storageWrapper.getItem(lateNightKey(user.id)) === night) {
      return;
    }
    storageWrapper.setItem(lateNightKey(user.id), night);
    react('late_night');
  }, [user, react]);

  const away =
    !isStreakLoading &&
    isAway(lastViewAt, hasReadToday, new Date(), config.awayMs);

  // Coming back after a while: one happy hop per return, keyed on the last
  // read so a reload doesn't repeat it.
  useEffect(() => {
    if (!isActive || !away || !lastViewAt || !user) {
      return;
    }
    const marker = new Date(lastViewAt).toISOString();
    setIsGreeted(true);
    if (storageWrapper.getItem(welcomeKey(user.id)) === marker) {
      return;
    }
    storageWrapper.setItem(welcomeKey(user.id), marker);
    react('welcome_back');
  }, [isActive, away, lastViewAt, user, react]);

  // He remembers your day while he's on (escalations count on it), and
  // reacts to it when reactions are on.
  useEffect(() => {
    if (!isEnabled || !user) {
      return undefined;
    }
    if (isActive) {
      reactLateNight();
    }
    return subscribePatchyEvents((event: PatchyEvent) => {
      if (event.type === 'upvote' || event.type === 'bookmark') {
        const day = recordPatchyActivity(user.id, event.type);
        if (isActive) {
          react(
            getActionTrigger(
              event.type,
              event.type === 'upvote' ? day.upvotes : day.bookmarks,
            ),
          );
        }
        return;
      }
      // A bone is something you gave him on purpose, so he enjoys it even
      // with reactions off.
      if (event.type === 'bone') {
        react('bone');
        return;
      }
      if (event.type === 'downvote') {
        if (isActive) {
          react('downvote');
        }
        return;
      }
      if (event.type === 'streak_day') {
        recordPatchyActivity(user.id, 'streak_day');
        if (isActive) {
          react('streak_day');
        }
        return;
      }
      recordPatchyActivity(user.id, 'read');
      if (!isActive) {
        return;
      }
      if (
        isFridayDeploy(new Date(), event.tags, getPatchyConfig().fridayDeploy)
      ) {
        react('friday_deploy');
        return;
      }
      reactLateNight();
    });
  }, [isEnabled, isActive, user, react, reactLateNight]);

  useEffect(() => {
    if (!reaction) {
      return undefined;
    }
    const timeout = setTimeout(() => setReaction(null), PATCHY_REACTION_MS);
    return () => clearTimeout(timeout);
  }, [reaction]);

  const mood = getPatchyMood({ state, hasReadToday, lastViewAt, now, config });
  const restingFace =
    mood === 'away' && isGreeted ? 'happy' : config.moods[mood].face;
  const idle = usePatchyIdle({
    isEnabled,
    isResting: mood === 'away' || mood === 'resting',
    isReading,
    prefersReducedMotion,
    canBlink: !isPatchyFaceAnimated(restingFace),
  });
  // Reading along: his newspaper face, which animates on its own, so the idle
  // faces stay out of it. It drops while he reacts.
  const isReadingFace = isReading && mood !== 'away';
  const shown =
    isActive || (isEnabled && reaction?.trigger === 'bone') ? reaction : null;

  if (shown) {
    const { emote, face } = config.reactions[shown.trigger];
    return {
      face,
      mood,
      // Animated faces bring their own motion.
      motion:
        prefersReducedMotion || isPatchyFaceAnimated(face)
          ? null
          : patchyReactionMotion[shown.trigger],
      motionKey: `reaction-${shown.key}`,
      emote: emote === 'none' ? null : emote,
      emoteCount: patchyReactionEmotes[shown.trigger],
      emoteKey: shown.key,
      isReacting: true,
    };
  }

  if (offerFace || isReadingFace) {
    return {
      face: offerFace ?? 'reading',
      mood,
      motion: null,
      motionKey: 'still',
      emote: null,
      emoteCount: 0,
      emoteKey: 0,
      isReacting: false,
    };
  }

  return {
    face: idle.face ?? restingFace,
    mood,
    motion: idle.face ? idle.motion : null,
    motionKey: `idle-${idle.key}`,
    emote: null,
    emoteCount: 0,
    emoteKey: 0,
    isReacting: false,
  };
};
