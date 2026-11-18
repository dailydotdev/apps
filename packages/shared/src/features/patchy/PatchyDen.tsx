import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useStreakRingState } from '../../hooks/streaks/useStreakRingState';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { LogEvent, TargetType } from '../../lib/log';
import type { PatchyDenFrame } from './patchyConfig';
import { getPatchyConfig } from './patchyConfig';
import { getPatchyQuip, recordPatchyActivity, usePatchyDay } from './patchyDay';
import { getPatchyMood } from './patchyTriggers';
import { usePatchyConfigSync } from './usePatchyConfigSync';

const BLINK_EVERY_MS = 4500;
const BLINK_MS = 160;
const PET_MS = 1600;
const TREAT_MS = 3200;
// Past this many pets in a day he gets a little side-eye about it.
const PETS_BEFORE_SIDEEYE = 5;

type Frame = 'idle' | 'blink' | PatchyDenFrame;

// A frame that failed to load shows the closest one that exists.
const frameFallback: Record<Frame, Frame> = {
  idle: 'idle',
  blink: 'idle',
  laugh: 'idle',
  bone: 'idle',
  sideeye: 'idle',
  asleep: 'blink',
};

// Patchy's den, the Game Center hero while the companion is on: his room
// with him at the desk, and nothing drawn over it. He blinks, naps when you
// are away, laughs when you pet him (and side-eyes you after too many pets),
// and eats today's bone once you've read. Under the room: one line from him
// and the bone. The Cores shop row lands under it in phase 2.
export const PatchyDen = ({
  className,
}: {
  className?: string;
}): ReactElement => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { state, count, hasReadToday, streak } = useStreakRingState();
  const prefersReducedMotion = usePrefersReducedMotion();
  const day = usePatchyDay(user?.id);
  const [isBlinking, setIsBlinking] = useState(false);
  const [petAt, setPetAt] = useState(0);
  const [treatAt, setTreatAt] = useState(0);
  const [failed, setFailed] = useState<Partial<Record<Frame, boolean>>>({});
  const config = getPatchyConfig();
  const { den, moods } = config;
  usePatchyConfigSync(true);
  const mood = getPatchyMood({
    state,
    hasReadToday,
    lastViewAt: streak?.lastViewAt,
    now: new Date(),
    config,
  });
  const isAsleep = mood === 'away' || mood === 'resting';
  const now = Date.now();
  const isPetting = petAt > 0 && now - petAt < PET_MS;
  const isEating = treatAt > 0 && now - treatAt < TREAT_MS;

  const frameSrc: Record<Frame, string> = useMemo(
    () => ({ idle: den.idleImage, blink: den.blinkImage, ...den.frames }),
    [den],
  );

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

  // Re-render when a pet or the bone runs out.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!isPetting && !isEating) {
      return undefined;
    }
    const timeout = setTimeout(
      () => setTick((tick) => tick + 1),
      isEating ? TREAT_MS : PET_MS,
    );
    return () => clearTimeout(timeout);
  }, [isPetting, isEating, petAt, treatAt]);

  let wanted: Frame = 'idle';
  if (isEating) {
    wanted = 'bone';
  } else if (isPetting) {
    wanted = day.pets > PETS_BEFORE_SIDEEYE ? 'sideeye' : 'laugh';
  } else if (isAsleep) {
    wanted = 'asleep';
  } else if (isBlinking) {
    wanted = 'blink';
  }
  let frame = wanted;
  while (failed[frame] && frame !== 'idle') {
    frame = frameFallback[frame];
  }

  const onPet = () => {
    if (!user) {
      return;
    }
    recordPatchyActivity(user.id, 'pet');
    setPetAt(Date.now());
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.PatchyDen,
      target_id: 'pet',
    });
  };

  const onTreat = () => {
    if (!user || day.treatGiven || !hasReadToday) {
      return;
    }
    recordPatchyActivity(user.id, 'treat');
    setTreatAt(Date.now());
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.PatchyDen,
      target_id: 'treat',
    });
  };

  // Asleep or sleepy he says so; awake he talks about your day.
  const line =
    mood === 'ready' || mood === 'happy'
      ? getPatchyQuip(day, count)
      : moods[mood].copy;
  let treatNote: string | null = null;
  if (day.treatGiven) {
    treatNote = 'Bone given. Back tomorrow.';
  } else if (!hasReadToday) {
    treatNote = 'Read a post to earn today’s bone.';
  }

  return (
    <section
      aria-label="Patchy's den"
      className={classNames('flex flex-col gap-3', className)}
    >
      <button
        type="button"
        aria-label="Pet Patchy"
        onClick={onPet}
        className="focus-outline relative aspect-video max-h-[26rem] w-full overflow-hidden rounded-16 bg-background-subtle"
      >
        {(Object.keys(frameSrc) as Frame[]).map((key) => (
          <img
            key={key}
            src={frameSrc[key]}
            alt={key === 'idle' ? 'Patchy at his desk' : ''}
            onError={() =>
              setFailed((current) => ({ ...current, [key]: true }))
            }
            className={classNames(
              'absolute inset-0 size-full object-cover',
              // Blinks cut; everything else crossfades.
              key === 'blink' || frame === 'blink'
                ? 'transition-none'
                : 'transition-opacity duration-300',
              key === frame ? 'opacity-100' : 'opacity-0',
            )}
            draggable={false}
          />
        ))}
      </button>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
            Patchy&apos;s den
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            “{line}”
          </Typography>
        </div>
        {treatNote ? (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {treatNote}
          </Typography>
        ) : (
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Primary}
            onClick={onTreat}
          >
            Give Patchy today’s bone
          </Button>
        )}
      </div>
    </section>
  );
};
