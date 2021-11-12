import React, { ReactElement } from 'react';
import classNames from 'classnames';
import {
  HideReadHistory,
  ReadHistoryInfiniteData,
} from '../../hooks/useReadingHistory';
import classed from '../../lib/classed';
import {
  isDateOnlyEqual,
  getReadHistoryDateFormat,
} from '../../lib/dateFormat';
import ReadingHistoryItem from './ReadingHistoryItem';

const DateTitle = classed('h2', 'typo-body text-theme-label-tertiary');

const getDateGroup = (date: Date, isFirstLabel: boolean) => {
  const label = getReadHistoryDateFormat(date);

  return (
    <DateTitle
      key={label}
      className={classNames('px-6 my-3', isFirstLabel && 'mt-0')}
    >
      {label}
    </DateTitle>
  );
};

export interface ReadHistoryListProps {
  data: ReadHistoryInfiniteData;
  onHide: HideReadHistory;
  infiniteScrollRef: (node?: Element | null) => void;
}

function ReadHistoryList({
  data,
  onHide,
  infiniteScrollRef,
}: ReadHistoryListProps): ReactElement {
  let currentDate: Date;

  return (
    <div className="flex relative flex-col">
      {data?.pages.map((page, pageIndex) =>
        page.readHistory.edges.reduce((dom, { node: history }, edgeIndex) => {
          const { timestamp } = history;
          const date = new Date(timestamp);

          if (!currentDate || !isDateOnlyEqual(currentDate, date)) {
            currentDate = date;
            dom.push(getDateGroup(date, pageIndex === 0 && edgeIndex === 0));
          }

          const indexes = { page: pageIndex, edge: edgeIndex };

          dom.push(
            <ReadingHistoryItem
              key={`${history.post.id}-${timestamp}`}
              history={history}
              onHide={(params) => onHide({ ...params, ...indexes })}
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
