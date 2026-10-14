import type { ReactElement } from 'react';
import React from 'react';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { BodyTextPlaceholder, TextPlaceholder } from '../widgets/common';

interface ReadingHistoryPlaceholderProps {
  amount?: number;
  withDateHeader?: boolean;
}

function ReadingHistoryPlaceholder({
  amount = 7,
  withDateHeader = false,
}: ReadingHistoryPlaceholderProps): ReactElement {
  return (
    <div className="flex flex-col">
      {withDateHeader && (
        <div className="mb-3 px-4 tablet:px-6">
          <TextPlaceholder className="w-20" />
        </div>
      )}
      {Array(Math.max(0, amount))
        .fill(0)
        .map((_, i) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className="flex flex-row items-center px-4 py-3 tablet:pl-9 tablet:pr-5"
          >
            <ElementPlaceholder className="h-16 w-16 rounded-16 laptop:w-24" />
            <div className="ml-4 flex flex-1 flex-col">
              <BodyTextPlaceholder className="w-full laptop:w-1/2" />
              <TextPlaceholder className="mt-2 w-2/3 laptop:w-1/3" />
            </div>
          </div>
        ))}
    </div>
  );
}

export default ReadingHistoryPlaceholder;
