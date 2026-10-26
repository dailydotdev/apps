import type { CSSProperties, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { LOGOS } from './SourceConfetti';

export interface MinutesOption {
  /** Minutes a day, as a string because the funnel stores answers so. */
  value: string;
  label: string;
  hint?: string;
  emoji: string;
}

export interface AnswerPickerProps {
  /** The uppercase caption over the card, as the reminder ruler has. */
  caption: string;
  options: MinutesOption[];
  value: string;
  onChange: (value: string) => void;
}

const minutesOf = (option: MinutesOption): number => Number(option.value);

const readoutOf = (option: MinutesOption): string =>
  minutesOf(option) ? `${option.value} min` : 'None';

const css = `
@keyframes rc-bounce {
  0% { transform: scale(1); }
  35% { transform: scale(1.25) rotate(-8deg); }
  65% { transform: scale(0.95) rotate(4deg); }
  100% { transform: scale(1); }
}
@keyframes rc-wave {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes rc-deal {
  from { opacity: 0; translate: 0 -3rem; rotate: -6deg; }
}
@keyframes rc-readout {
  from { opacity: 0; transform: translateY(0.375rem); filter: blur(0.125rem); }
}
.rc-bounce { animation: rc-bounce 520ms cubic-bezier(0.34, 1.56, 0.64, 1); }
.rc-wave { animation: rc-wave 2.4s linear infinite; }
.rc-readout { animation: rc-readout 260ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.rc-deal { animation: rc-deal 420ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .rc-bounce, .rc-wave, .rc-readout, .rc-deal { animation: none; }
}
`;

const Card = ({
  caption,
  children,
}: {
  caption: string;
  children: React.ReactNode;
}): ReactElement => (
  <div className="flex w-full flex-col gap-4 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-5">
    <style>{css}</style>
    <span className="font-bold uppercase tracking-widest text-text-tertiary typo-caption1">
      {caption}
    </span>
    {children}
  </div>
);

const Readout = ({ option }: { option: MinutesOption }): ReactElement => (
  // Keyed, so each new answer rises in rather than swapping in place.
  <span key={option.value} className="rc-readout flex flex-col items-center">
    <span
      className="font-bold leading-none tabular-nums text-text-primary"
      style={{ fontSize: '3.25rem' }}
    >
      {readoutOf(option)}
    </span>
    <span className="mt-2 text-text-secondary typo-callout">
      {option.emoji} {option.label}
    </span>
  </span>
);

/**
 * A minutes ruler in the reminder card's style: drag the yellow marker or
 * use the arrow keys, and it snaps to the nearest answer.
 */
export const MinutesRuler = ({
  caption,
  options,
  value,
  onChange,
}: AnswerPickerProps): ReactElement => {
  const max = Math.max(...options.map(minutesOf));
  const selected =
    options.find((option) => option.value === value) ?? options[0];
  const position = (minutes: number) => `${(minutes / max) * 100}%`;
  const snap = (minutes: number) =>
    options.reduce((best, option) =>
      Math.abs(minutesOf(option) - minutes) <
      Math.abs(minutesOf(best) - minutes)
        ? option
        : best,
    );

  return (
    <Card caption={caption}>
      <Readout option={selected} />
      <div className="relative mx-2 mt-2 h-16">
        {/* One tick a minute, taller where an answer sits. */}
        {Array.from({ length: max + 1 }, (_, minute) => {
          const isStop = options.some((option) => minutesOf(option) === minute);
          return (
            <span
              key={minute}
              aria-hidden
              className={classNames(
                'absolute top-3 w-0.5 -translate-x-1/2 rounded-max',
                isStop ? 'h-5 bg-text-tertiary' : 'h-2.5 bg-text-quaternary',
              )}
              style={{
                left: position(minute),
                top: isStop ? '0.5rem' : '1.25rem',
              }}
            />
          );
        })}
        {options.map((option) => (
          <span
            key={option.value}
            aria-hidden
            className={classNames(
              'absolute top-10 -translate-x-1/2 typo-caption1',
              option.value === selected.value
                ? 'font-bold text-text-primary'
                : 'text-text-tertiary',
            )}
            style={{ left: position(minutesOf(option)) }}
          >
            {option.value}
          </span>
        ))}
        <span
          aria-hidden
          className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1 transition-[left] duration-300"
          style={{
            left: position(minutesOf(selected)),
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <span className="size-2 rounded-full bg-accent-cheese-default" />
          <span className="h-6 w-0.5 rounded-max bg-accent-cheese-default" />
        </span>
        <input
          type="range"
          aria-label={caption}
          aria-valuetext={`${readoutOf(selected)}, ${selected.label}`}
          min={0}
          max={max}
          step={1}
          value={minutesOf(selected)}
          onChange={(event) => onChange(snap(Number(event.target.value)).value)}
          className="absolute inset-0 size-full cursor-grab opacity-0 active:cursor-grabbing"
        />
      </div>
    </Card>
  );
};

/**
 * A cup that fills to the answer, with a wave rolling across the top.
 * Tap a level beside it.
 */
export const MinutesCup = ({
  caption,
  options,
  value,
  onChange,
}: AnswerPickerProps): ReactElement => {
  const selected =
    options.find((option) => option.value === value) ?? options[0];
  const index = options.indexOf(selected);
  // Never quite empty or brim-full, so the wave always shows.
  const level = 12 + (index / (options.length - 1)) * 76;
  const isFull = level > 60;

  return (
    <Card caption={caption}>
      <div className="flex items-center justify-center gap-5">
        <div
          className="relative h-56 w-36 overflow-hidden border-4 border-border-subtlest-secondary bg-background-default"
          style={{
            borderRadius: '0.75rem 0.75rem 2.5rem 2.5rem',
          }}
        >
          <div
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-accent-bacon-default to-accent-cabbage-default transition-[height] duration-700"
            style={{
              height: `${level}%`,
              transitionTimingFunction: 'cubic-bezier(0.34, 1.3, 0.64, 1)',
            }}
          >
            <svg
              aria-hidden
              viewBox="0 0 200 20"
              preserveAspectRatio="none"
              className="rc-wave absolute -top-3 left-0 h-4"
              style={{ width: '200%' }}
            >
              <path
                d="M0 10 Q 25 0 50 10 T 100 10 T 150 10 T 200 10 V 20 H 0 Z"
                style={{ fill: 'var(--theme-accent-cabbage-default)' }}
              />
            </svg>
          </div>
          {/* Rides just above the surface; once the cup is mostly full it
              sits inside the liquid, in white. */}
          <span
            className="absolute inset-x-0 flex justify-center transition-[bottom] duration-700"
            style={{
              bottom: isFull
                ? `calc(${level}% - 3.25rem)`
                : `calc(${level}% + 0.75rem)`,
              transitionTimingFunction: 'cubic-bezier(0.34, 1.3, 0.64, 1)',
            }}
          >
            <span
              key={selected.value}
              className={classNames(
                'rc-readout font-bold leading-none tabular-nums',
                isFull ? 'text-white' : 'text-text-primary',
              )}
              style={{ fontSize: '2rem' }}
            >
              {readoutOf(selected)}
            </span>
          </span>
        </div>
        <div
          role="radiogroup"
          aria-label={caption}
          className="flex flex-col-reverse gap-2"
        >
          {options.map((option) => {
            const isSelected = option.value === selected.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onChange(option.value)}
                className={classNames(
                  'flex items-center gap-2 rounded-12 px-3 py-2 text-left transition-colors',
                  isSelected
                    ? 'bg-background-default text-text-primary shadow-2'
                    : 'text-text-tertiary hover:text-text-primary',
                )}
              >
                <span
                  aria-hidden
                  className={classNames(
                    'typo-title3',
                    isSelected && 'rc-bounce',
                  )}
                >
                  {option.emoji}
                </span>
                <span className="flex flex-col">
                  <span className="font-bold typo-footnote">
                    {readoutOf(option)}
                  </span>
                  <span className="typo-caption2">{option.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

/** Big emoji cards in a 2 × 2 grid; the picked one lifts and bounces. */
export const MinutesCards = ({
  caption,
  options,
  value,
  onChange,
}: AnswerPickerProps): ReactElement => (
  <div
    role="radiogroup"
    aria-label={caption}
    className="grid w-full grid-cols-2 gap-3"
  >
    <style>{css}</style>
    {options.map((option) => {
      const isSelected = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={isSelected}
          onClick={() => onChange(option.value)}
          className={classNames(
            'flex flex-col items-start gap-3 rounded-24 border-2 p-4 text-left transition-[transform,opacity,background-color,border-color] duration-300',
            isSelected
              ? 'border-accent-cabbage-default bg-accent-cabbage-flat'
              : 'border-transparent bg-surface-float',
            value && !isSelected && 'opacity-64',
          )}
          style={
            {
              transform: isSelected
                ? 'translateY(-0.25rem) scale(1.03)'
                : 'none',
              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            } as CSSProperties
          }
        >
          <span
            aria-hidden
            // Keyed on selection, so the bounce replays on every pick.
            key={`${option.value}-${isSelected}`}
            className={classNames('leading-none', isSelected && 'rc-bounce')}
            style={{ fontSize: '2.5rem' }}
          >
            {option.emoji}
          </span>
          <span className="flex flex-col">
            <span className="font-bold text-text-primary typo-callout">
              {option.label}
            </span>
            <span className="text-text-tertiary typo-footnote">
              {readoutOf(option)}
            </span>
          </span>
        </button>
      );
    })}
  </div>
);

// The gauge's four zones, from easy-going to all-in.
const GAUGE_ZONES = ['Chill', 'Steady', 'Focused', 'Beast mode'];

/** Polar to SVG coordinates on the gauge's arc, angle 0 = pointing left. */
const arcPoint = (radius: number, turn: number) => {
  const angle = Math.PI * (1 - turn);
  return {
    x: 100 + radius * Math.cos(angle),
    y: 100 - radius * Math.sin(angle),
  };
};

const arcPath = (radius: number, from: number, to: number): string => {
  const start = arcPoint(radius, from);
  const end = arcPoint(radius, to);
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`;
};

/**
 * A speedometer: one zone per answer, lit up to the pick, with a needle that
 * swings over on a spring. Tap a zone's chip below it.
 */
export const MinutesGauge = ({
  caption,
  options,
  value,
  onChange,
}: AnswerPickerProps): ReactElement => {
  const selected =
    options.find((option) => option.value === value) ?? options[0];
  const index = options.indexOf(selected);
  const zone = 1 / options.length;
  // The needle points at the middle of the picked zone, -90° to 90°.
  const needle = -90 + (index + 0.5) * zone * 180;

  return (
    <Card caption={caption}>
      <div className="relative mx-auto w-full max-w-[16rem]">
        <svg viewBox="0 0 200 112" className="w-full" aria-hidden>
          {options.map((option, zoneIndex) => (
            <path
              key={option.value}
              d={arcPath(
                80,
                zoneIndex * zone + 0.008,
                (zoneIndex + 1) * zone - 0.008,
              )}
              fill="none"
              strokeWidth="18"
              style={{
                stroke:
                  zoneIndex <= index
                    ? `var(--theme-accent-${
                        ['cheese', 'bacon', 'onion', 'cabbage'][zoneIndex % 4]
                      }-default)`
                    : 'var(--theme-surface-disabled)',
                transition: `stroke 300ms ease ${zoneIndex * 60}ms`,
              }}
            />
          ))}
          <g
            style={{
              transform: `rotate(${needle}deg)`,
              transformOrigin: '100px 100px',
              transition: 'transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <path
              d="M 97 100 L 100 38 L 103 100 Z"
              style={{ fill: 'var(--theme-text-primary)' }}
            />
          </g>
          <circle
            cx="100"
            cy="100"
            r="8"
            style={{ fill: 'var(--theme-text-primary)' }}
          />
        </svg>
      </div>
      <span
        key={selected.value}
        className="rc-readout -mt-2 flex flex-col items-center"
      >
        <span
          className="font-bold leading-none tabular-nums text-text-primary"
          style={{ fontSize: '2.5rem' }}
        >
          {readoutOf(selected)}
        </span>
        <span className="mt-1 font-bold text-text-secondary typo-callout">
          {GAUGE_ZONES[index] ?? selected.label}
        </span>
      </span>
      <div
        role="radiogroup"
        aria-label={caption}
        className="grid grid-cols-4 gap-1.5 rounded-16 bg-background-default p-1"
      >
        {options.map((option) => {
          const isSelected = option.value === selected.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              className={classNames(
                'flex flex-col items-center gap-0.5 rounded-12 py-2 transition-colors',
                isSelected
                  ? 'bg-surface-float text-text-primary shadow-2'
                  : 'text-text-tertiary',
              )}
            >
              <span
                aria-hidden
                key={`${option.value}-${isSelected}`}
                className={classNames('typo-title3', isSelected && 'rc-bounce')}
              >
                {option.emoji}
              </span>
              <span className="font-bold typo-caption1">
                {readoutOf(option)}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

/** Minutes a post takes, for the stack: one card per this many. */
const MINUTES_PER_POST = 5;

/**
 * The goal as a stack of feed posts, one per five minutes, each from a real
 * source. Picking more deals new cards onto the stack.
 */
export const MinutesStack = ({
  caption,
  options,
  value,
  onChange,
}: AnswerPickerProps): ReactElement => {
  const selected =
    options.find((option) => option.value === value) ?? options[0];
  const posts = Math.round(minutesOf(selected) / MINUTES_PER_POST);

  return (
    <Card caption={caption}>
      <div className="relative mx-auto h-44 w-full max-w-[15rem]">
        {Array.from({ length: posts }, (_, post) => {
          // The newest post sits on top, the rest fan back behind it.
          const depth = posts - 1 - post;
          return (
            <div
              key={post}
              className="rc-deal absolute inset-x-0 bottom-0 flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default p-3 shadow-2"
              style={{
                transform: `translateY(${-Math.min(depth, 5) * 1.5}rem) scale(${
                  1 - Math.min(depth, 5) * 0.04
                })`,
                opacity: depth > 4 ? 0 : 1,
                zIndex: post,
                transition:
                  'transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms',
              }}
            >
              <img
                src={LOGOS[post % LOGOS.length]}
                alt=""
                className="size-9 max-w-none shrink-0 rounded-full"
              />
              <span className="flex flex-1 flex-col gap-1.5">
                <span className="h-2.5 w-11/12 rounded-max bg-surface-float" />
                <span className="h-2.5 w-2/3 rounded-max bg-surface-float" />
              </span>
              <span className="shrink-0 text-text-tertiary typo-caption2">
                5m
              </span>
            </div>
          );
        })}
        {posts === 0 && (
          <span className="absolute inset-0 flex items-center justify-center rounded-16 border-2 border-dashed border-border-subtlest-secondary text-text-tertiary typo-callout">
            No posts yet
          </span>
        )}
      </div>
      <span
        key={selected.value}
        className="rc-readout flex flex-col items-center"
      >
        <span className="font-bold text-text-primary typo-title2">
          {posts} {posts === 1 ? 'post' : 'posts'} a day
        </span>
        <span className="text-text-tertiary typo-footnote">
          {readoutOf(selected)} · {selected.label}
        </span>
      </span>
      <div
        role="radiogroup"
        aria-label={caption}
        className="grid grid-cols-4 gap-1.5 rounded-16 bg-background-default p-1"
      >
        {options.map((option) => {
          const isSelected = option.value === selected.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              className={classNames(
                'rounded-12 py-2 font-bold typo-footnote transition-colors',
                isSelected
                  ? 'bg-surface-float text-text-primary shadow-2'
                  : 'text-text-tertiary',
              )}
            >
              {readoutOf(option)}
            </button>
          );
        })}
      </div>
    </Card>
  );
};
