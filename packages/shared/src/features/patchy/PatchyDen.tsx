import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { isSameDay, subDays } from 'date-fns';
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
import { SparkleIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import Link from '../../components/utilities/Link';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useStreakRingState } from '../../hooks/streaks/useStreakRingState';
import { useReadingStreak30Days } from '../../hooks/streaks/useStreakDays';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { webappUrl } from '../../lib/constants';
import { LogEvent, TargetType } from '../../lib/log';
import type { PatchyDenFrame } from './patchyConfig';
import { getPatchyConfig } from './patchyConfig';
import type { PatchyDay } from './patchyDay';
import {
  getPatchyQuip,
  patchyLogLines,
  recordPatchyActivity,
  usePatchyDay,
} from './patchyDay';
import type { PatchyDenSpot } from './patchyDenLayout';
import {
  PATCHY_DEN_HEAD,
  patchyDenSpotPoint,
  patchyDenSpots,
  toPatchyDenBoxPoint,
} from './patchyDenLayout';
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

const spotLabel: Record<PatchyDenSpot, string> = {
  window: 'Your week',
  shelf: 'Read it later',
  robot: 'Patchy’s log',
  mic: 'Patchy says',
};

const formatTime = (at: number): string =>
  new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const WeekBars = (): ReactElement => {
  const history = useReadingStreak30Days();
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) =>
    subDays(today, 6 - index),
  );
  const reads = days.map(
    (day) =>
      history?.find((entry) => isSameDay(new Date(entry.date), day))?.reads ??
      0,
  );
  const max = Math.max(1, ...reads);
  return (
    <div className="flex h-16 items-end gap-1.5" aria-label="Reads per day">
      {days.map((day, index) => (
        <div
          key={day.toISOString()}
          className="flex flex-1 flex-col items-center gap-1"
        >
          <div
            className={classNames(
              'w-full rounded-4',
              reads[index] > 0 ? 'bg-accent-bacon-default' : 'bg-surface-float',
            )}
            style={{ height: `${Math.max(8, (reads[index] / max) * 44)}px` }}
            title={`${reads[index]} reads`}
          />
          <span className="text-text-tertiary typo-caption2">
            {day.toLocaleDateString([], { weekday: 'narrow' })}
          </span>
        </div>
      ))}
    </div>
  );
};

const SpotCard = ({
  spot,
  day,
  streak,
}: {
  spot: PatchyDenSpot;
  day: PatchyDay;
  streak: number;
}): ReactElement => {
  let body: ReactNode;
  if (spot === 'window') {
    body = (
      <>
        <WeekBars />
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {streak > 0
            ? `${streak}-day streak. The view gets better every day.`
            : 'Every day you read, the view gets a little better.'}
        </Typography>
      </>
    );
  } else if (spot === 'shelf') {
    body = (
      <>
        <Typography type={TypographyType.Callout}>
          {day.bookmarks > 0
            ? `${day.bookmarks} saved for later today. He’s keeping them dusted.`
            : 'Nothing saved today. The shelf is suspiciously tidy.'}
        </Typography>
        <Link href={`${webappUrl}bookmarks`} passHref>
          <Button
            tag="a"
            size={ButtonSize.Small}
            variant={ButtonVariant.Secondary}
          >
            Open bookmarks
          </Button>
        </Link>
      </>
    );
  } else if (spot === 'robot') {
    const entries = [...day.log].reverse().slice(0, 5);
    body = entries.length ? (
      <ul className="flex flex-col gap-1">
        {entries.map((entry) => (
          <li key={entry.at} className="flex gap-2 typo-footnote">
            <span className="shrink-0 text-text-tertiary">
              {formatTime(entry.at)}
            </span>
            <span>{patchyLogLines[entry.activity]}</span>
          </li>
        ))}
      </ul>
    ) : (
      <Typography type={TypographyType.Callout}>
        Nothing logged yet today. He’s watching the feed.
      </Typography>
    );
  } else {
    body = (
      <Typography type={TypographyType.Callout}>
        “{getPatchyQuip(day, streak)}”
      </Typography>
    );
  }
  return (
    <div className="flex w-64 flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-3 shadow-2">
      <Typography type={TypographyType.Callout} bold>
        {spotLabel[spot]}
      </Typography>
      {body}
    </div>
  );
};

const Stat = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col rounded-12 bg-surface-float px-3 py-2">
    <span className="font-bold typo-title3">{value}</span>
    <span className="text-text-tertiary typo-caption1">{label}</span>
  </div>
);

// Patchy's den, the Game Center hero while the companion is on: his room
// with him at the desk. He blinks, naps when you are away, laughs when you
// pet him, eats today's bone once you've read, and the room's window, shelf,
// robot and mic open what he knows about your day. The Cores shop row lands
// under it in phase 2.
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
  const [openSpot, setOpenSpot] = useState<PatchyDenSpot | null>(null);
  const [failed, setFailed] = useState<Partial<Record<Frame, boolean>>>({});
  const [box, setBox] = useState({ width: 0, height: 0 });
  const boxRef = useRef<HTMLElement>(null);
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
    const element = boxRef.current;
    if (!element || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(([entry]) =>
      setBox({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(element);
    return () => observer.disconnect();
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
    setOpenSpot(null);
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

  const onSpot = (spot: PatchyDenSpot) => {
    const isOpening = openSpot !== spot;
    setOpenSpot(isOpening ? spot : null);
    if (isOpening) {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.PatchyDen,
        target_id: spot,
      });
    }
  };

  const head = toPatchyDenBoxPoint(box, PATCHY_DEN_HEAD);
  let treatLabel = 'Give Patchy today’s bone';
  if (day.treatGiven) {
    treatLabel = 'Bone given · back tomorrow';
  } else if (!hasReadToday) {
    treatLabel = 'Read a post to earn today’s bone';
  }

  return (
    <div className={classNames('flex flex-col gap-3', className)}>
      <section
        ref={boxRef}
        aria-label="Patchy's den"
        className="relative aspect-video max-h-[26rem] w-full overflow-hidden rounded-16 bg-background-subtle"
      >
        <button
          type="button"
          aria-label="Pet Patchy"
          onClick={onPet}
          className="focus-outline absolute inset-0"
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

        {head && (isPetting || isEating) && !prefersReducedMotion && (
          <span
            aria-hidden
            key={isEating ? treatAt : petAt}
            className="pointer-events-none absolute flex -translate-x-1/2 gap-1 typo-title2 motion-safe:animate-patchy-emote"
            style={{ left: head.x, top: head.y - 40 }}
          >
            {isEating ? (
              <SparkleIcon
                secondary
                size={IconSize.Large}
                className="text-accent-cheese-default"
              />
            ) : (
              <>
                <span>💗</span>
                <span className="-translate-y-3 typo-title3">💗</span>
              </>
            )}
          </span>
        )}

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
            {count}-day streak · mood: {moods[mood].label} · {moods[mood].copy}
          </Typography>
        </div>

        {patchyDenSpots.map((spot) => {
          const point = toPatchyDenBoxPoint(box, patchyDenSpotPoint[spot]);
          if (!point) {
            return null;
          }
          const isOpen = openSpot === spot;
          const opensLeft = point.x > box.width / 2;
          const opensUp = point.y > box.height / 2;
          return (
            <div
              key={spot}
              className="absolute"
              style={{ left: point.x, top: point.y }}
            >
              <button
                type="button"
                aria-label={spotLabel[spot]}
                aria-expanded={isOpen}
                onClick={() => onSpot(spot)}
                className="focus-outline relative -ml-3 -mt-3 flex size-6 items-center justify-center rounded-full"
              >
                <span className="absolute inset-0 rounded-full bg-white/40 motion-safe:animate-ping" />
                <span className="size-3 rounded-full border-2 border-white bg-accent-cabbage-default" />
              </button>
              {isOpen && (
                <div
                  className={classNames(
                    'absolute z-1',
                    opensLeft ? 'right-0' : 'left-0',
                    opensUp ? 'bottom-4' : 'top-4',
                  )}
                >
                  <SpotCard spot={spot} day={day} streak={count} />
                </div>
              )}
            </div>
          );
        })}

        <div className="absolute bottom-3 right-3">
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={
              day.treatGiven || !hasReadToday
                ? ButtonVariant.Float
                : ButtonVariant.Primary
            }
            disabled={day.treatGiven || !hasReadToday}
            onClick={onTreat}
          >
            {treatLabel}
          </Button>
        </div>
      </section>

      <div
        aria-label="Patchy's day"
        className="flex flex-wrap items-center gap-2"
      >
        <Stat value={day.reads} label="opened today" />
        <Stat value={day.upvotes} label="upvotes" />
        <Stat value={day.bookmarks} label="saved for later" />
        <Stat value={day.pets} label="pets" />
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="min-w-0 flex-1 pl-2"
        >
          Patchy: “{getPatchyQuip(day, count)}”
        </Typography>
      </div>
    </div>
  );
};
