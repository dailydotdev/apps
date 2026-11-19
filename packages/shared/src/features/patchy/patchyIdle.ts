import { useEffect, useRef, useState } from 'react';
import type { PatchyFace } from './patchyConfig';

// The small things Patchy does inside the streak circle while nothing is
// happening: blinking, glancing at the feed, flopping an ear, yawning. Each
// is a face plus an optional motion the icon plays.
export const patchyMotions = [
  'wobble',
  'yawn',
  'pant',
  'spin',
  'hop',
  'hide',
] as const;
export type PatchyMotion = (typeof patchyMotions)[number];

export interface PatchyIdleAction {
  face: PatchyFace;
  motion?: PatchyMotion;
  ms: number;
}

export const patchyIdleActions = {
  blink: { face: 'asleep', ms: 140 },
  glance: { face: 'lookright', ms: 1400 },
  read: { face: 'lookdown', ms: 1800 },
  earflop: { face: 'earflop', motion: 'wobble', ms: 1400 },
  yawn: { face: 'yawn', motion: 'yawn', ms: 1500 },
  tongue: { face: 'tongue', motion: 'pant', ms: 1400 },
  wink: { face: 'wink', ms: 800 },
  spin: { face: 'happy', motion: 'spin', ms: 1200 },
} satisfies Record<string, PatchyIdleAction>;
export type PatchyIdleActionName = keyof typeof patchyIdleActions;

interface PickContext {
  isReading: boolean;
  isEvening: boolean;
}

// Pure, so tests can pin the dice: picks the next micro-action. Reading
// makes him read along; evenings make him yawn more; chasing his tail is
// rare on purpose.
export const pickPatchyIdleAction = (
  roll: number,
  { isReading, isEvening }: PickContext,
): PatchyIdleActionName => {
  const weights: [PatchyIdleActionName, number][] = [
    ['glance', isReading ? 1 : 4],
    ['read', isReading ? 6 : 0],
    ['earflop', 2],
    ['tongue', 2],
    ['wink', 1],
    ['yawn', isEvening ? 3 : 1],
    ['spin', 0.4],
  ];
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0);
  let left = Math.min(Math.max(roll, 0), 0.9999) * total;
  for (let index = 0; index < weights.length; index += 1) {
    const [name, weight] = weights[index];
    if (left < weight) {
      return name;
    }
    left -= weight;
  }
  return 'glance';
};

// Seconds between micro-actions, and between blinks.
const ACTION_EVERY_MS: [number, number] = [9000, 20000];
const BLINK_EVERY_MS: [number, number] = [3500, 6500];
const GLANCE_THROTTLE_MS = 3000;

const between = ([min, max]: [number, number]) =>
  min + Math.random() * (max - min);

interface UsePatchyIdleProps {
  isEnabled: boolean;
  // Asleep or away: he stays still.
  isResting: boolean;
  isReading: boolean;
  prefersReducedMotion: boolean;
}

export interface PatchyIdleState {
  face: PatchyFace | null;
  motion: PatchyMotion | null;
  // Changes per action, so the icon can replay the motion.
  key: number;
}

const still: PatchyIdleState = { face: null, motion: null, key: 0 };

export const usePatchyIdle = ({
  isEnabled,
  isResting,
  isReading,
  prefersReducedMotion,
}: UsePatchyIdleProps): PatchyIdleState => {
  const [state, setState] = useState<PatchyIdleState>(still);
  const keyRef = useRef(0);
  const readingRef = useRef(isReading);
  readingRef.current = isReading;

  useEffect(() => {
    if (!isEnabled || isResting) {
      setState(still);
      return undefined;
    }
    const timers = new Set<ReturnType<typeof setTimeout>>();
    let isBusy = false;
    const later = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };
    const play = (name: PatchyIdleActionName) => {
      if (document.hidden) {
        return;
      }
      const action: PatchyIdleAction = patchyIdleActions[name];
      isBusy = true;
      keyRef.current += 1;
      setState({
        face: action.face,
        motion: prefersReducedMotion ? null : (action.motion ?? null),
        key: keyRef.current,
      });
      later(() => {
        isBusy = false;
        setState((current) => ({ ...current, face: null, motion: null }));
      }, action.ms);
    };
    const blinkLoop = () => {
      later(() => {
        if (!isBusy) {
          play('blink');
        }
        blinkLoop();
      }, between(BLINK_EVERY_MS));
    };
    const actionLoop = () => {
      later(() => {
        if (!isBusy && !prefersReducedMotion) {
          play(
            pickPatchyIdleAction(Math.random(), {
              isReading: readingRef.current,
              isEvening: new Date().getHours() >= 21,
            }),
          );
        }
        actionLoop();
      }, between(ACTION_EVERY_MS));
    };
    blinkLoop();
    actionLoop();

    // He glances at the post you hover.
    let lastGlanceAt = 0;
    const onPointerOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (
        prefersReducedMotion ||
        isBusy ||
        Date.now() - lastGlanceAt < GLANCE_THROTTLE_MS ||
        !target?.closest?.('article')
      ) {
        return;
      }
      lastGlanceAt = Date.now();
      play('glance');
    };
    document.addEventListener('pointerover', onPointerOver, { passive: true });

    return () => {
      timers.forEach((id) => clearTimeout(id));
      document.removeEventListener('pointerover', onPointerOver);
    };
  }, [isEnabled, isResting, prefersReducedMotion]);

  return isEnabled && !isResting ? state : still;
};
