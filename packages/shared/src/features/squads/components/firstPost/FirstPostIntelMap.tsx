import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { SquadIntelHighlights } from '../../../../graphql/squadIntel';
import {
  startupsLavender,
  startupsLavenderTint,
} from '../../../../styles/custom';
import {
  competitionFillClassName,
  competitionHint,
  competitionLabel,
  intelCompetitions,
} from './intelCompetition';

type Topic = SquadIntelHighlights['topics'][number];

const formatChange = (change: number | null): string =>
  change === null ? 'new' : `${change > 0 ? '+' : ''}${change}%`;

/**
 * Where to post, in three lanes: every topic under how many new posts compete
 * for its readers. The lane to be in is the open one.
 */
export const FirstPostIntelMap = ({
  topics,
  openingTag,
}: {
  topics: Topic[];
  openingTag?: string;
}): ReactElement => (
  <div className="grid grid-cols-1 gap-2 tablet:grid-cols-3">
    {intelCompetitions.map((competition) => {
      const isOpen = competition === 'open';
      // New and fastest growing on top
      const inLane = topics
        .filter((topic) => topic.competition === competition)
        .sort((a, b) => (b.change ?? Infinity) - (a.change ?? Infinity));

      return (
        <div
          key={competition}
          className={classNames(
            'flex flex-col gap-3 rounded-12 p-3',
            isOpen ? 'bg-overlay-float-avocado' : 'bg-surface-float',
          )}
        >
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 typo-footnote">
              <span
                aria-hidden
                className={classNames(
                  'size-2 shrink-0 rounded-full',
                  competitionFillClassName[competition],
                )}
              />
              <strong className="min-w-0 flex-1">
                {competitionLabel[competition]}
              </strong>
              {isOpen && (
                <span className="shrink-0 font-bold text-accent-avocado-default">
                  Your sweet spot
                </span>
              )}
            </div>
            <span className="text-text-tertiary typo-caption1">
              {competitionHint[competition]}
            </span>
          </div>
          <ul className="flex flex-col gap-1.5">
            {inLane.map(({ tag, change }) => (
              <li key={tag} className="flex items-center gap-2 typo-footnote">
                <span className="flex min-w-0 flex-1 items-center gap-1.5">
                  <span className="truncate font-bold">#{tag}</span>
                  {tag === openingTag && (
                    <span
                      className="shrink-0 rounded-6 px-1.5 py-0.5 font-bold typo-caption2"
                      style={{
                        background: startupsLavenderTint,
                        color: startupsLavender,
                      }}
                    >
                      Our pick
                    </span>
                  )}
                </span>
                <span
                  className={classNames(
                    'shrink-0 tabular-nums',
                    (change === null || change > 0) &&
                      'text-accent-avocado-default',
                    change !== null &&
                      change < 0 &&
                      'text-accent-ketchup-default',
                    change === 0 && 'text-text-tertiary',
                  )}
                >
                  {formatChange(change)}
                </span>
              </li>
            ))}
            {!inLane.length && (
              <li className="text-text-quaternary typo-footnote">
                None of your topics
              </li>
            )}
          </ul>
        </div>
      );
    })}
  </div>
);
