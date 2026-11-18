import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { useStreakRingState } from '../../hooks/streaks/useStreakRingState';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { patchyDenImage } from './patchyAssets';
import {
  getPatchyMood,
  patchyMoodCopy,
  patchyMoodLabel,
} from './patchyTriggers';

const BLINK_EVERY_MS = 4500;
const BLINK_MS = 160;
const PET_MS = 1600;

// Patchy's den, the Game Center hero while the companion is on: his room
// with him in the armchair, breathing and blinking, and his mood. The Cores
// shop row lands under it in phase 2.
export const PatchyDen = ({
  className,
}: {
  className?: string;
}): ReactElement => {
  const { state, count, hasReadToday, streak } = useStreakRingState();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isBlinking, setIsBlinking] = useState(false);
  const [isPetted, setIsPetted] = useState(false);
  const mood = getPatchyMood({
    state,
    hasReadToday,
    lastViewAt: streak?.lastViewAt,
    now: new Date(),
  });
  const isAsleep = mood === 'away' || mood === 'resting';

  useEffect(() => {
    // Warm the poses so the first blink doesn't flash.
    [patchyDenImage.blink, patchyDenImage.happy].forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  useEffect(() => {
    if (isAsleep || prefersReducedMotion) {
      return undefined;
    }
    let timeout: ReturnType<typeof setTimeout>;
    const id = setInterval(() => {
      setIsBlinking(true);
      timeout = setTimeout(() => setIsBlinking(false), BLINK_MS);
    }, BLINK_EVERY_MS);
    return () => {
      clearInterval(id);
      clearTimeout(timeout);
    };
  }, [isAsleep, prefersReducedMotion]);

  useEffect(() => {
    if (!isPetted) {
      return undefined;
    }
    const timeout = setTimeout(() => setIsPetted(false), PET_MS);
    return () => clearTimeout(timeout);
  }, [isPetted]);

  let pose = patchyDenImage.idle;
  if (isPetted) {
    pose = patchyDenImage.happy;
  } else if (isAsleep || isBlinking) {
    pose = patchyDenImage.blink;
  }

  return (
    <section
      aria-label="Patchy's den"
      className={classNames(
        'relative aspect-[3/2] max-h-[24rem] w-full overflow-hidden rounded-16 bg-background-subtle',
        className,
      )}
    >
      <img
        src={patchyDenImage.plate}
        alt=""
        className="absolute inset-0 size-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-x-0 top-0 flex flex-col gap-1 bg-gradient-to-b from-overlay-secondary-pepper to-transparent p-4 pb-10">
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title2}
          bold
          className="text-white"
        >
          Patchy&apos;s den
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
          className="!text-white"
        >
          {count}-day streak · mood: {patchyMoodLabel[mood]} ·{' '}
          {patchyMoodCopy[mood]}
        </Typography>
      </div>
      <button
        type="button"
        aria-label="Pet Patchy"
        onClick={() => setIsPetted(true)}
        className="focus-outline absolute bottom-0 left-1/2 h-[85%] -translate-x-1/2"
      >
        <img
          src={pose}
          alt="Patchy"
          className="h-full w-auto origin-bottom motion-safe:animate-patchy-breathe"
          draggable={false}
        />
      </button>
    </section>
  );
};
