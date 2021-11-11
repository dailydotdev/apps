import React, { ReactElement } from 'react';
import classNames from 'classnames';
import {
  HideReadHistory,
  ReadHistoryInfiniteData,
} from '@dailydotdev/shared/src/hooks/useReadingHistory';
import classed from '@dailydotdev/shared/src/lib/classed';
import {
  isDateOnlyEqual,
  getReadHistoryDateFormat,
} from '@dailydotdev/shared/src/lib/dateFormat';
import ReadingHistoryItem from './ReadingHistoryItem';

export interface ReadHistoryListProps {
  data: ReadHistoryInfiniteData;
  itemClassName?: string;
  onHide: HideReadHistory;
  infiniteScrollRef: (node?: Element | null) => void;
}

const DateTitle = classed('h2', 'typo-body text-theme-label-tertiary');

function ReadHistoryList({
  data,
  itemClassName,
  onHide,
  infiniteScrollRef,
}: ReadHistoryListProps): ReactElement {
  let currentDate: Date;

  return (
    <div className="flex relative flex-col">
      {data?.pages.map((page) =>
        page.readHistory.edges.reduce((dom, { node: history }, i) => {
          const { timestamp } = history;
          const date = new Date(timestamp);

          if (!currentDate || !isDateOnlyEqual(currentDate, date)) {
            currentDate = date;
            dom.push(
              <DateTitle className={classNames('my-3', i === 0 && 'mt-0')}>
                {getReadHistoryDateFormat(date)}
              </DateTitle>,
            );
          }

          dom.push(
            <ReadingHistoryItem
              history={history}
              onHide={onHide}
              className={itemClassName}
            />,
          );

          return dom;
        }, []),
      )}
      <div
        className="absolute bottom-0 left-0 w-px h-px opacity-0 pointer-events-none"
        ref={infiniteScrollRef}
      />
    </div>
  );
}

export default ReadHistoryList;
