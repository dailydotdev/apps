import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { LOGOS } from './SourceConfetti';

export interface MinutesOption {
  /** Minutes a day, as a string because the funnel stores answers so. */
  value: string;
  label: string;
  hint?: string;
}

const minutesOf = (option: MinutesOption): number => Number(option.value);

const readoutOf = (option: MinutesOption): string =>
  minutesOf(option) ? `${option.value} min` : 'None';

const css = `
@keyframes rc-deal {
  from { opacity: 0; translate: 0 -3rem; rotate: -6deg; }
}
@keyframes rc-readout {
  from { opacity: 0; transform: translateY(0.375rem); filter: blur(0.125rem); }
}
.rc-readout { animation: rc-readout 260ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.rc-deal { animation: rc-deal 420ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .rc-readout, .rc-deal { animation: none; }
}
`;

/** One post card's height, and how far each card behind it peeks out. */
const POST_HEIGHT_REM = 3.875;
const POST_FAN_REM = 1.5;

/** Minutes a post takes, for the stack: one card per this many. */
const MINUTES_PER_POST = 5;

/**
 * The goal as a stack of feed posts, one per five minutes, each from a real
 * source. Picking more deals new cards onto the stack.
 */
export const PostStack = ({
  label,
  options,
  value,
  onChange,
}: {
  /** Names the card for screen readers; the headline asks the question. */
  label: string;
  options: MinutesOption[];
  value: string;
  onChange: (value: string) => void;
}): ReactElement => {
  const selected =
    options.find((option) => option.value === value) ?? options[0];
  const posts = Math.round(minutesOf(selected) / MINUTES_PER_POST);

  return (
    <div
      role="group"
      aria-label={label}
      className="flex w-full flex-col gap-4 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-5"
    >
      <style>{css}</style>
      {/* A fixed area so the readout never jumps; the stack, sized to its
          cards, sits in its middle. */}
      <div className="flex h-44 items-center justify-center">
        <div
          className="relative w-full max-w-[15rem] transition-[height] duration-300"
          style={{
            height: `${
              POST_HEIGHT_REM +
              Math.min(Math.max(posts - 1, 0), 4) * POST_FAN_REM
            }rem`,
          }}
        >
          {Array.from({ length: posts }, (_, post) => {
            // The newest post sits on top, the rest fan back behind it.
            const depth = posts - 1 - post;
            return (
              <div
                key={post}
                className="rc-deal absolute inset-x-0 bottom-0 flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default p-3 shadow-2"
                style={{
                  transform: `translateY(${
                    -Math.min(depth, 5) * POST_FAN_REM
                  }rem) scale(${1 - Math.min(depth, 5) * 0.04})`,
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
        </div>
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
        aria-label={label}
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
    </div>
  );
};
