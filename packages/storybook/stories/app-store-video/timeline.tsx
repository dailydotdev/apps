import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PauseIcon, PlayIcon } from '@dailydotdev/shared/src/components/icons';

// Every video here is a pure function of time: `render(t)` draws the frame
// at t seconds. The player runs the clock for the animatic, the storyboard
// freezes it at each beat, and an exporter can step it frame by frame at
// 30 fps for the final render, so what is approved is what ships.

export const clamp = (value: number, min = 0, max = 1): number =>
  Math.min(max, Math.max(min, value));

/** Progress of t through [from, to], 0 before and 1 after. */
export const span = (t: number, from: number, to: number): number =>
  clamp((t - from) / (to - from));

/** Fast start, gentle stop: entrances and moves. */
export const easeOut = (p: number): number => 1 - (1 - p) ** 3;

/** Gentle both ends: camera moves and morphs. */
export const easeInOut = (p: number): number =>
  p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;

export const lerp = (from: number, to: number, p: number): number =>
  from + (to - from) * p;

/** Enter as blur plus a rise, leave as a plain fade. */
export const reveal = (
  t: number,
  enterAt: number,
  exitAt = Infinity,
  rise = 14,
): React.CSSProperties => {
  const enter = easeOut(span(t, enterAt, enterAt + 0.5));
  const exit = Number.isFinite(exitAt) ? span(t, exitAt, exitAt + 0.35) : 0;
  return {
    opacity: enter * (1 - exit),
    transform: `translateY(${(1 - enter) * rise}px)`,
    filter: `blur(${(1 - enter) * 6}px)`,
  };
};

export interface Beat {
  at: number;
  label: string;
  note: string;
  /** Where the storyboard freezes this beat, when a beat in isn't right. */
  frame?: number;
}

export interface Video {
  id: string;
  duration: number;
  /** The frame that stands in when autoplay is off. */
  poster: number;
  loops: boolean;
  beats: Beat[];
  render: (t: number) => ReactNode;
}

/** Seconds since play, looping over `duration`, at the display's rate. */
const useClock = (
  duration: number,
  playing: boolean,
): [number, (t: number) => void] => {
  const [time, setTime] = useState(0);
  const origin = useRef(0);
  useEffect(() => {
    if (!playing) {
      return undefined;
    }
    let frame = 0;
    origin.current = performance.now() - time * 1000;
    const tick = (now: number) => {
      setTime(((now - origin.current) / 1000) % duration);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // The clock restarts from the current time only when play toggles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, duration]);
  return [time, setTime];
};

const format = (t: number): string => `0:${t.toFixed(1).padStart(4, '0')}`;

/**
 * The animatic: the video playing in its canvas, with play and pause, a
 * scrubber, and the beats as chips that jump to their moment.
 */
export const Player = ({
  video,
  frame,
}: {
  video: Video;
  /** Wraps a rendered frame in its placement's canvas. */
  frame: (content: ReactNode) => ReactElement;
}): ReactElement => {
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useClock(video.duration, playing);
  const seek = (t: number) => {
    setPlaying(false);
    setTime(t);
  };
  const current = [...video.beats].reverse().find((beat) => time >= beat.at);
  return (
    <div className="flex min-w-0 flex-col gap-3">
      {frame(video.render(time))}
      <div className="flex max-w-full items-center gap-3">
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Float}
          icon={playing ? <PauseIcon /> : <PlayIcon />}
          aria-label={playing ? 'Pause' : 'Play'}
          onClick={() => setPlaying(!playing)}
        />
        <input
          type="range"
          aria-label="Scrub"
          min={0}
          max={video.duration}
          step={0.05}
          value={time}
          onChange={(event) => seek(Number(event.target.value))}
          className="min-w-0 flex-1 accent-accent-cabbage-default"
        />
        <span className="w-20 shrink-0 tabular-nums text-text-tertiary typo-footnote">
          {format(time)} / {format(video.duration)}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {video.beats.map((beat) => (
          <button
            key={beat.at}
            type="button"
            onClick={() => seek(beat.at + 0.6)}
            className={classNames(
              'rounded-10 border px-2.5 py-1 typo-footnote',
              current === beat
                ? 'border-accent-cabbage-default text-text-primary'
                : 'border-border-subtlest-tertiary text-text-tertiary',
            )}
          >
            {beat.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => seek(video.poster)}
          className="rounded-10 border border-dashed border-border-subtlest-secondary px-2.5 py-1 text-text-tertiary typo-footnote"
        >
          Poster frame
        </button>
      </div>
    </div>
  );
};

/** The storyboard: the video frozen a beat in, one frame per beat. */
export const Frames = ({
  video,
  frame,
  offset = 0.9,
}: {
  video: Video;
  frame: (content: ReactNode, id: string) => ReactElement;
  /** How far into each beat the frame is taken. */
  offset?: number;
}): ReactElement => (
  <ol className="flex flex-col gap-8">
    {video.beats.map((beat, index) => {
      const at =
        beat.frame ?? Math.min(beat.at + offset, video.duration - 0.05);
      return (
        <li key={beat.at} className="flex flex-col gap-2">
          <div className="flex max-w-[56rem] items-baseline gap-3">
            <span className="shrink-0 rounded-8 bg-surface-float px-2 py-0.5 font-bold tabular-nums text-text-primary typo-caption1">
              {format(beat.at)}
            </span>
            <span className="font-bold text-text-primary typo-callout">
              {beat.label}
            </span>
            <span className="text-text-secondary typo-callout">
              {beat.note}
            </span>
          </div>
          {frame(video.render(at), `${video.id}-${index}`)}
        </li>
      );
    })}
  </ol>
);
