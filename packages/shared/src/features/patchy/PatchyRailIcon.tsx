import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { HotIcon, MoonIcon, SparkleIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import type { StreakRingState } from '../../hooks/streaks/useStreakRingState';
import type { PatchyEmote, PatchyFace } from './patchyConfig';
import type { PatchyMotion } from './patchyIdle';
import { getPatchyConfig } from './patchyConfig';

// The ring keeps the streak tab's state language: pink once read (or
// selected), amber/red when the day is at risk, blue on a rest day.
const ringByState: Record<StreakRingState, string> = {
  none: 'border-border-subtlest-secondary',
  pending: 'border-border-subtlest-secondary',
  safe: 'border-accent-bacon-default',
  celebration: 'border-accent-bacon-default',
  at_risk: 'border-status-warning',
  critical: 'border-status-error',
  freeze: 'border-accent-blueCheese-default',
};

const flameByState: Record<StreakRingState, string> = {
  none: 'text-text-quaternary',
  pending: 'text-text-tertiary',
  safe: 'text-accent-bacon-default',
  celebration: 'text-accent-bacon-default',
  at_risk: 'text-status-warning',
  critical: 'text-status-error',
  freeze: 'text-accent-blueCheese-default',
};

const motionClass: Record<PatchyMotion, string> = {
  wobble: 'motion-safe:animate-patchy-wobble',
  yawn: 'motion-safe:animate-patchy-yawn',
  pant: 'motion-safe:animate-patchy-pant',
  spin: 'motion-safe:animate-patchy-spin',
  hop: 'motion-safe:animate-patchy-bump',
  hide: 'motion-safe:animate-patchy-hide',
};

const Heart = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 16 16" className={className} aria-hidden>
    <path
      d="M8 14s-5.5-3.4-5.5-7.2A3 3 0 0 1 8 4.6a3 3 0 0 1 5.5 2.2C13.5 10.6 8 14 8 14z"
      fill="currentColor"
    />
  </svg>
);

const Drop = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 16 16" className={className} aria-hidden>
    <path
      d="M8 2s4 4.6 4 7.4a4 4 0 0 1-8 0C4 6.6 8 2 8 2z"
      fill="currentColor"
    />
  </svg>
);

const emoteIcon = (emote: PatchyEmote): ReactElement | null => {
  switch (emote) {
    case 'hearts':
      return <Heart className="size-3 text-accent-bacon-default" />;
    case 'sparkle':
      return (
        <SparkleIcon
          secondary
          size={IconSize.Size16}
          className="size-3 text-accent-cheese-default"
        />
      );
    case 'moon':
      return (
        <MoonIcon
          secondary
          size={IconSize.Size16}
          className="size-3 text-accent-blueCheese-default"
        />
      );
    case 'sweat':
      return <Drop className="size-2.5 text-accent-blueCheese-default" />;
    case 'dots':
      return (
        <span className="rounded-6 bg-surface-invert px-1 text-[0.5rem] font-bold leading-3 text-surface-primary">
          …
        </span>
      );
    default:
      return null;
  }
};

// Tiny emotes floating out of the circle's top-right edge, a few in a row
// for the bigger reactions. Pointer-free and gone in about a second.
const Emotes = ({
  emote,
  count,
}: {
  emote: PatchyEmote;
  count: number;
}): ReactElement => (
  <span
    aria-hidden
    className="pointer-events-none absolute -right-3 -top-3 flex"
  >
    {Array.from({ length: count }, (_, index) => (
      <span
        key={index}
        className="absolute opacity-0 motion-safe:animate-patchy-float motion-reduce:opacity-100"
        style={{
          left: index * 5 - 2,
          top: index % 2 ? 3 : 0,
          animationDelay: `${index * 140}ms`,
        }}
      >
        {emoteIcon(emote)}
      </span>
    ))}
  </span>
);

interface PatchyRailIconProps {
  face: PatchyFace;
  state: StreakRingState;
  hasReadToday: boolean;
  selected?: boolean;
  // A micro-animation the face plays inside the circle; a new key replays it.
  motion?: PatchyMotion | null;
  motionKey?: string;
  // A reaction's tiny emotes; a new key floats a fresh set.
  emote?: PatchyEmote | null;
  emoteCount?: number;
  emoteKey?: number;
}

// A face that is not uploaded yet falls back to his neutral one instead of
// an empty circle. The image can fail before hydration attaches onError, so
// it is also checked once it mounts.
const FaceImage = ({
  face,
  motion,
  motionKey,
}: {
  face: PatchyFace;
  motion?: PatchyMotion | null;
  motionKey?: string;
}): ReactElement => {
  const { faceImage } = getPatchyConfig();
  const [failed, setFailed] = useState<Partial<Record<PatchyFace, boolean>>>(
    {},
  );
  const shown = failed[face] ? 'neutral' : face;
  const onFail = useCallback(() => {
    if (shown !== 'neutral') {
      setFailed((current) => ({ ...current, [shown]: true }));
    }
  }, [shown]);
  const ref = useCallback(
    (image: HTMLImageElement | null) => {
      if (image?.complete && image.naturalWidth === 0) {
        onFail();
      }
    },
    [onFail],
  );
  return (
    <img
      key={motion ? `${motionKey}-${motion}` : 'still'}
      ref={ref}
      src={faceImage[shown]}
      alt=""
      className={classNames(
        'size-full object-cover',
        motion && motionClass[motion],
      )}
      draggable={false}
      onError={onFail}
    />
  );
};

// Patchy's face in the Streak tab, in place of the flame badge. The glyph box
// stays the shared 24px so the tab keeps its height; the face overflows it a
// little, like an avatar would. Inside the circle he's never quite still:
// blinks, glances, yawns (see patchyIdle).
export const PatchyRailIcon = ({
  face,
  state,
  hasReadToday,
  selected = false,
  motion = null,
  motionKey = '',
  emote = null,
  emoteCount = 1,
  emoteKey = 0,
}: PatchyRailIconProps): ReactElement => (
  <span className="relative flex size-6 items-center justify-center">
    <span
      aria-hidden
      className={classNames(
        'absolute -inset-1 overflow-hidden rounded-full border-2 bg-surface-float transition-colors',
        selected && (state === 'none' || state === 'pending')
          ? 'border-accent-bacon-default'
          : ringByState[state],
        state === 'celebration' && 'animate-streak-earn-border',
      )}
    >
      <FaceImage face={face} motion={motion} motionKey={motionKey} />
    </span>
    {emote && <Emotes key={emoteKey} emote={emote} count={emoteCount} />}
    <span
      aria-hidden
      className="absolute -bottom-2 -right-2 flex size-4 items-center justify-center rounded-full bg-background-default"
    >
      <HotIcon
        secondary={hasReadToday || state === 'freeze'}
        size={IconSize.Size16}
        className={classNames('size-3', flameByState[state])}
      />
    </span>
  </span>
);
