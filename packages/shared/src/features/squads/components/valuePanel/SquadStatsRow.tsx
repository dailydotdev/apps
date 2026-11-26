import type { ReactElement } from 'react';
import React from 'react';
import { largeNumberFormat } from '../../../../lib/numberFormat';

export interface SquadStat {
  label: string;
  value: number;
  /** Shown in place of the formatted value, as "38K" for a rounded audience */
  text?: string;
}

const FULL_NUMBER_BELOW = 100_000;

const format = (value: number): string | null =>
  value < FULL_NUMBER_BELOW
    ? value.toLocaleString('en-US')
    : largeNumberFormat(value);

/**
 * A page's numbers as one strip of equal cells with a line between them, the
 * way the boost manager lays out its totals. The first one always shows; a 0
 * says nothing good, so of the rest only the ones above 0 do.
 */
export const SquadStatsRow = ({
  lead,
  stats,
}: {
  lead: SquadStat;
  stats: SquadStat[];
}): ReactElement => (
  <div className="overflow-hidden">
    <dl className="-ml-[1.0625rem] grid grid-cols-3 gap-y-4 tablet:auto-cols-fr tablet:grid-flow-col tablet:grid-cols-none">
      {[lead, ...stats.filter(({ value }) => value > 0)].map(
        ({ label, value, text }) => (
          <div
            key={label}
            className="flex min-w-0 flex-col-reverse gap-1 border-l border-border-subtlest-tertiary pl-4 pr-2"
          >
            <dd className="truncate font-bold tabular-nums typo-title3">
              {text ?? format(value)}
            </dd>
            <dt className="truncate text-text-tertiary typo-footnote">
              {label}
            </dt>
          </div>
        ),
      )}
    </dl>
  </div>
);
