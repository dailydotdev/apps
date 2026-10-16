import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { HistoryItem } from './data';
import { groupByDay } from './data';

// The reading list: days with a sticky label, every read under its day.
// The label sticks under the phone's page block, and to the top of the
// column from tablet up.

export const Timeline = ({
  items,
  renderItem,
}: {
  items: HistoryItem[];
  renderItem: (item: HistoryItem) => ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-8">
    {groupByDay(items).map((day) => (
      <section key={day.id} className="flex flex-col gap-3">
        <h2 className="sticky top-[calc(3.25rem-0.0625rem)] z-2 -mx-2 -mt-px bg-background-default px-2 pb-2 pt-[calc(0.5rem+0.0625rem)] font-bold typo-title3 tablet:-top-px">
          {day.label}
        </h2>
        <div className="-mx-3 flex flex-col">{day.items.map(renderItem)}</div>
      </section>
    ))}
  </div>
);
