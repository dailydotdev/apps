import React, { ReactElement } from 'react';
import { ElementPlaceholder } from '../ElementPlaceholder';
import classed from '../../lib/classed';

interface ReadingHistoryPlaceholderProps {
  amount?: number;
}

const Text = classed(ElementPlaceholder, 'h-3 rounded-12');

function ReadingHistoryPlaceholder({
  amount = 7,
}: ReadingHistoryPlaceholderProps): ReactElement {
  return (
    <div className="flex flex-col">
      {Array(amount)
        .fill(0)
        .map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i} className="flex flex-row items-center py-3 px-8">
            <ElementPlaceholder className="w-16 laptop:w-24 h-16 rounded-16" />
            <div className="flex flex-col flex-1 ml-4">
              <Text className="w-full laptop:w-1/2" />
              <Text className="mt-2 w-2/3 laptop:w-1/3" />
            </div>
          </div>
        ))}
    </div>
  );
}

export default ReadingHistoryPlaceholder;
