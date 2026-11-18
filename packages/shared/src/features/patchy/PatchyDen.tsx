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
// with him at the desk, blinking, and his mood. The Cores
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
    const image = new Image();
    image.src = patchyDenImage.blink;
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

  // Petting him gets a long, content eyes-closed moment.
  const isEyesClosed = isAsleep || isBlinking || isPetted;

  return (
    <section
      aria-label="Patchy's den"
      className={classNames(
        'relative aspect-video max-h-[26rem] w-full overflow-hidden rounded-16 bg-background-subtle',
        className,
      )}
    >
      <button
        type="button"
        aria-label="Pet Patchy"
        onClick={() => setIsPetted(true)}
        className="focus-outline absolute inset-0"
      >
        <img
          src={isEyesClosed ? patchyDenImage.blink : patchyDenImage.idle}
          alt="Patchy at his desk"
          className="size-full object-cover"
          draggable={false}
        />
      </button>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-1 bg-gradient-to-b from-overlay-secondary-pepper to-transparent p-4 pb-10">
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
    </section>
  );
};
