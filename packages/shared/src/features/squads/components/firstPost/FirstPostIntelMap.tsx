import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type {
  IntelCompetition,
  SquadIntelHighlights,
} from '../../../../graphql/squadIntel';
import {
  startupsLavender,
  startupsLavenderTint,
} from '../../../../styles/custom';

type Topic = SquadIntelHighlights['topics'][number];

// Where a topic sits across the map, in percent: fewer competing posts is left
const competitionAt: Record<IntelCompetition, number> = {
  open: 17,
  moderate: 50,
  crowded: 83,
};

const formatChange = (change: number | null): string =>
  change === null ? 'new' : `${change > 0 ? '+' : ''}${change}%`;

/**
 * Where to post: every topic by how fast its reads grow and how many posts
 * compete for them. The corner to be in is growing and open.
 */
export const FirstPostIntelMap = ({
  topics,
  openingTag,
}: {
  topics: Topic[];
  openingTag?: string;
}): ReactElement => {
  // Only topics with enough posts to place, one row each, new and fastest
  // growing on top, so two labels never share a line
  const placed = topics.filter(({ competition }) => !!competition);
  const ranked = [...placed]
    .sort((a, b) => (b.change ?? Infinity) - (a.change ?? Infinity))
    .map(({ tag }) => tag);
  const step = 68 / Math.max(ranked.length - 1, 1);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative h-48 overflow-hidden rounded-12 bg-surface-float">
        <span
          aria-hidden
          className="absolute left-0 top-0 h-1/2 w-1/3"
          style={{ background: startupsLavenderTint }}
        />
        <span
          aria-hidden
          className="absolute inset-y-0 left-1/3 border-l border-dashed border-border-subtlest-tertiary"
        />
        <span
          aria-hidden
          className="absolute inset-y-0 left-2/3 border-l border-dashed border-border-subtlest-tertiary"
        />
        <span
          aria-hidden
          className="absolute inset-x-0 top-1/2 border-t border-dashed border-border-subtlest-tertiary"
        />
        <span className="absolute right-2 top-1.5 text-text-quaternary typo-caption2">
          Growing
        </span>
        <span className="absolute bottom-1.5 right-2 text-text-quaternary typo-caption2">
          Falling
        </span>
        {placed.map(({ tag, change, competition, share }) => {
          const isOpening = tag === openingTag;
          const x = competitionAt[competition as IntelCompetition];
          const y = 14 + ranked.indexOf(tag) * step;
          const size = 14 + share * 0.5;
          const isLabelLeft = x > 45;
          const offset = `${size / 2 + 6}px`;

          return (
            <React.Fragment key={tag}>
              <span
                aria-hidden
                className={classNames(
                  'absolute rounded-full',
                  !isOpening &&
                    'border border-border-subtlest-secondary bg-surface-hover',
                )}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: size,
                  height: size,
                  marginLeft: -size / 2,
                  marginTop: -size / 2,
                  background: isOpening ? startupsLavender : undefined,
                }}
              />
              <span
                className="absolute flex -translate-y-1/2 items-baseline gap-1.5 whitespace-nowrap typo-caption1"
                style={{
                  top: `${y}%`,
                  ...(isLabelLeft
                    ? { right: `calc(${100 - x}% + ${offset})` }
                    : { left: `calc(${x}% + ${offset})` }),
                }}
              >
                <span
                  className={classNames(
                    'font-bold',
                    !isOpening && 'text-text-secondary',
                  )}
                >
                  #{tag}
                </span>
                <span
                  className={classNames(
                    'tabular-nums',
                    change === null || change > 0
                      ? 'text-accent-avocado-default'
                      : 'text-text-tertiary',
                  )}
                >
                  {formatChange(change)}
                </span>
              </span>
            </React.Fragment>
          );
        })}
      </div>
      <div className="flex justify-between gap-2 text-text-quaternary typo-caption2">
        <span>Few posts compete</span>
        <span className="hidden tablet:inline">Size is share of reads</span>
        <span>Crowded</span>
      </div>
    </div>
  );
};
