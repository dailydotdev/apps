import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { HistoryItem } from './data';
import { groupByDay } from './data';

// The reading list: days with a sticky label, every read under its day.
// The label sticks under the phone's page block, and to the top of the
// column from tablet up.

export const Timeline = ({
  items,
  compact = false,
  renderItem,
}: {
  items: HistoryItem[];
  /** The narrow laptop column. */
  compact?: boolean;
  renderItem: (item: HistoryItem) => ReactNode;
}): ReactElement => (
  <div className={classNames('flex flex-col', compact ? 'gap-4' : 'gap-8')}>
    {groupByDay(items).map((day) => (
      <section
        key={day.id}
        className={classNames('flex flex-col', !compact && 'gap-3')}
      >
        <h2
          className={classNames(
            'sticky top-[calc(3.25rem-0.0625rem)] z-2 -mx-2 -mt-px bg-background-default px-2 pt-[calc(0.5rem+0.0625rem)] font-bold tablet:-top-px',
            // Compact: the label's 6px and the row's 6px make the same
            // 12px as between two rows.
            compact ? 'pb-1.5 typo-callout' : 'pb-2 typo-title3',
          )}
        >
          {day.label}
        </h2>
        <div className={classNames('flex flex-col', !compact && '-mx-3')}>
          {day.items.map(renderItem)}
        </div>
      </section>
    ))}
  </div>
);
