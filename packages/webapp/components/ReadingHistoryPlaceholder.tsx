import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import classed from '@dailydotdev/shared/src/lib/classed';

interface ReadingHistoryPlaceholderProps {
  amount?: number;
  className?: string;
}

const Text = classed(ElementPlaceholder, 'h-3 rounded-12');

function ReadingHistoryPlaceholder({
  amount = 7,
  className,
}: ReadingHistoryPlaceholderProps): ReactElement {
  return (
    <div className={classNames('flex flex-col', className)}>
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
