import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { TextPlaceholder } from '../widgets/common';

interface ReadingHistoryListPlaceholderProps {
  amount?: number;
  withDateHeader?: boolean;
  // The laptop column hides the row menu, so rows run to the edge.
  isColumn?: boolean;
}

// Mirrors the day heading and ReadingHistoryRow line for line, so nothing
// moves when the reads arrive.
export function ReadingHistoryListPlaceholder({
  amount = 10,
  withDateHeader = false,
  isColumn = false,
}: ReadingHistoryListPlaceholderProps): ReactElement {
  return (
    <div className="flex flex-col gap-1" aria-hidden>
      {withDateHeader && (
        <div className="px-2 pb-2 pt-4">
          <div className="flex h-5 items-center">
            <TextPlaceholder className="w-24" />
          </div>
        </div>
      )}
      {Array.from({ length: amount }, (_, index) => (
        <div
          key={index}
          className={classNames(
            'flex h-16 items-start gap-2.5 py-1.5 pl-2',
            isColumn ? 'pr-2' : 'pr-10',
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-[1.125rem] items-center">
              <TextPlaceholder className="w-full" />
            </div>
            <div className="flex h-[1.125rem] items-center">
              <TextPlaceholder className="w-2/3" />
            </div>
            <div className="flex h-4 items-center">
              <TextPlaceholder className="w-1/3" />
            </div>
          </div>
          <ElementPlaceholder className="size-12 shrink-0 rounded-10" />
        </div>
      ))}
    </div>
  );
}
