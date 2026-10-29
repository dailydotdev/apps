import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import styles from './ReadingCommitment.module.css';

/** Minutes a post takes, for the stack: one card per this many. */
export const MINUTES_PER_POST = 5;

/** How far each card behind the top one peeks out, and how many show. */
const POST_HEIGHT_REM = 3.875;
const POST_FAN_REM = 1.5;
const MAX_FANNED = 4;

/**
 * The daily goal as a stack of feed posts, one per five minutes. A bigger
 * goal deals more cards onto it. The picture only: the list under it picks.
 */
export const PostStack = ({
  minutes,
  logos,
}: {
  minutes: number;
  /** Source logos from the reader's own feed, one per card. */
  logos: string[];
}): ReactElement => {
  const posts = Math.round(minutes / MINUTES_PER_POST);
  // Before a pick, one post, so the card is never empty.
  const cards = Math.max(posts, 1);

  return (
    <div
      aria-hidden
      className="flex w-full flex-col gap-3 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-5"
    >
      <div className="flex h-36 items-center justify-center">
        <div
          className="relative w-full max-w-60 transition-[height] duration-300"
          style={{
            height: `${
              POST_HEIGHT_REM + Math.min(cards - 1, MAX_FANNED) * POST_FAN_REM
            }rem`,
          }}
        >
          {Array.from({ length: cards }, (_, post) => {
            // The newest post sits on top, the rest fan back behind it.
            const depth = Math.min(cards - 1 - post, MAX_FANNED + 1);
            const logo = logos.length ? logos[post % logos.length] : undefined;

            return (
              <div
                key={post}
                className={classNames(
                  styles.deal,
                  'absolute inset-x-0 bottom-0 flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default p-3 shadow-2',
                )}
                style={{
                  transform: `translateY(${-depth * POST_FAN_REM}rem) scale(${
                    1 - depth * 0.04
                  })`,
                  opacity: depth > MAX_FANNED ? 0 : 1,
                  zIndex: post,
                  transition:
                    'transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms',
                }}
              >
                {logo ? (
                  <img
                    src={logo}
                    alt=""
                    className="size-9 max-w-none shrink-0 rounded-full"
                  />
                ) : (
                  <span className="size-9 shrink-0 rounded-full bg-surface-float" />
                )}
                <span className="flex flex-1 flex-col gap-1.5">
                  <span className="h-2.5 w-11/12 rounded-max bg-surface-float" />
                  <span className="h-2.5 w-2/3 rounded-max bg-surface-float" />
                </span>
                <span className="shrink-0 text-text-tertiary typo-caption2">
                  {MINUTES_PER_POST}m
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {/* Kept as a blank line before a pick, so the card never resizes. */}
      <span
        key={minutes}
        className={classNames(
          styles.rise,
          'text-center font-bold text-text-primary typo-title3',
          !posts && 'invisible',
        )}
      >
        {`${cards} ${cards === 1 ? 'post' : 'posts'} a day`}
      </span>
    </div>
  );
};
