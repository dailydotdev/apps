import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { UseInfiniteQueryResult } from 'react-query';
import { ReadHistory } from '@dailydotdev/shared/src/graphql/users';
import { RequestDataConnection } from '@dailydotdev/shared/src/graphql/common';
import useFeedInfiniteScroll from '@dailydotdev/shared/src/hooks/feed/useFeedInfiniteScroll';
import classed from '@dailydotdev/shared/src/lib/classed';
import {
  isDateOnlyEqual,
  getReadHistoryDateFormat,
} from '@dailydotdev/shared/src/lib/dateFormat';
import ReadingHistoryItem, {
  ReadingHistoryItemProps,
} from './ReadingHistoryItem';

export interface ReadHistoryListProps
  extends Pick<ReadingHistoryItemProps, 'onHide'> {
  queryResult: UseInfiniteQueryResult<
    RequestDataConnection<ReadHistory, 'readHistory'>
  >;
  itemClassName?: string;
}

const DateTitle = classed('h2', 'typo-body text-theme-label-tertiary');

function ReadHistoryList({
  queryResult,
  itemClassName,
  onHide,
}: ReadHistoryListProps): ReactElement {
  const canFetchMore =
    !queryResult.isLoading &&
    !queryResult.isFetchingNextPage &&
    queryResult.hasNextPage &&
    queryResult.data.pages.length > 0;

  const infiniteScrollRef = useFeedInfiniteScroll({
    fetchPage: queryResult.fetchNextPage,
    canFetchMore,
  });

  let currentDate: Date;

  return (
    <div className="flex relative flex-col">
      {queryResult.data.pages.map((page) =>
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
