import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

export interface MinutesOption {
  /** Minutes a day, as a string because the funnel stores answers so. */
  value: string;
  label: string;
  hint?: string;
}

// Real source logos from daily.dev, so the stack reads as "your feed".
export const LOGOS = [
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/devto',
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/hn',
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/react_js',
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1628412854/logos/freecodecamp',
  'https://media.daily.dev/image/upload/s--75ndqrkr--/f_auto,t_logo/v1702882094/logos/fireship.jpg',
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/aws',
  'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/react_native',
  'https://media.daily.dev/image/upload/s--3luD3Wei--/f_auto/v1714800008/logos/duckdb',
  'https://media.daily.dev/image/upload/s--65EDghou--/f_auto/v1724339118/logos/neontech',
  'https://media.daily.dev/image/upload/s---oEn9czC--/f_auto/v1716187892/logos/socketdev',
  'https://media.daily.dev/image/upload/s--2Z0xk_Ia--/f_auto,q_auto/v1780213485/logos/jetbrains-dotnet?_a=BAMAMiWQ0',
  'https://media.daily.dev/image/upload/s--8Aro536C--/f_auto,q_auto/v1773839403/logos/golang_digest?_a=BAMAMiiu0',
];

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
 * source. A bigger goal deals new cards onto the stack. The picture only: the
 * list under it picks the goal.
 */
export const PostStack = ({ minutes }: { minutes: number }): ReactElement => {
  const posts = Math.round(minutes / MINUTES_PER_POST);
  // Before a pick, one post, so the card is never empty.
  const cards = Math.max(posts, 1);

  return (
    <div
      aria-hidden
      className="flex w-full flex-col gap-3 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-5"
    >
      <style>{css}</style>
      {/* A fixed area so the readout never jumps; the stack, sized to its
          cards, sits in its middle. */}
      <div className="flex h-36 items-center justify-center">
        <div
          className="relative w-full max-w-[15rem] transition-[height] duration-300"
          style={{
            height: `${
              POST_HEIGHT_REM + Math.min(cards - 1, 4) * POST_FAN_REM
            }rem`,
          }}
        >
          {Array.from({ length: cards }, (_, post) => {
            // The newest post sits on top, the rest fan back behind it.
            const depth = cards - 1 - post;
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
      {/* No line before a pick; kept as a blank line so the card never
          resizes. */}
      <span
        key={minutes}
        className={classNames(
          'rc-readout text-center font-bold text-text-primary typo-title3',
          !posts && 'invisible',
        )}
      >
        {`${cards} ${cards === 1 ? 'post' : 'posts'} a day`}
      </span>
    </div>
  );
};
