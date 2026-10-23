import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { HistoryItem } from './data';
import { groupByDay } from './data';

// The reading list: days with a label that scrolls with them, every read
// under its day. The label lines up with the rows' titles.

export const Timeline = ({
  items,
  renderItem,
}: {
  items: HistoryItem[];
  renderItem: (item: HistoryItem) => ReactNode;
}): ReactElement => (
  <div className="flex flex-col">
    {groupByDay(items).map((day) => (
      <section key={day.id} className="flex flex-col gap-1">
        <h2 className="px-2 pb-2 pt-4 font-bold text-text-primary typo-callout">
          {day.label}
        </h2>
        {day.items.map(renderItem)}
      </section>
    ))}
  </div>
);
