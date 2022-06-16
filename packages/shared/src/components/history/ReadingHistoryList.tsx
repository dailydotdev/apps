import React, { ReactElement, useCallback } from 'react';
import classNames from 'classnames';
import { HideReadHistory } from '../../hooks/useReadingHistory';
import classed from '../../lib/classed';
import {
  isDateOnlyEqual,
  getReadHistoryDateFormat,
} from '../../lib/dateFormat';
import PostItemCard from '../post/PostItemCard';
import { ReadHistoryInfiniteData } from '../../hooks/useInfiniteReadingHistory';
import { InfiniteScrollScreenOffset } from '../../hooks/feed/useFeedInfiniteScroll';
import PostOptionsReadingHistoryMenu from '../PostOptionsReadingHistoryMenu';
import useReadingHistoryContextMenu from '../../hooks/useReadingHistoryContextMenu';

const DateTitle = classed('h2', 'typo-body text-theme-label-tertiary');

const getDateGroup = (date: Date) => {
  const label = getReadHistoryDateFormat(date);

  return (
    <DateTitle key={label} className={classNames('px-6 my-3 first:mt-0')}>
      {label}
    </DateTitle>
  );
};

export interface ReadHistoryListProps {
  data: ReadHistoryInfiniteData;
  onHide: HideReadHistory;
  infiniteScrollRef: (node?: Element | null) => void;
}

export default function ReadHistoryList({
  data,
  onHide,
  infiniteScrollRef,
}: ReadHistoryListProps): ReactElement {
  const {
    readingHistoryContextItem,
    setReadingHistoryContextItem,
    onReadingHistoryContextOptions,
    queryIndexes,
  } = useReadingHistoryContextMenu();

  const renderList = useCallback(() => {
    let currentDate: Date;

    return data?.pages.map((page, pageIndex) =>
      page.readHistory.edges.reduce((dom, { node: history }, edgeIndex) => {
        const { timestamp } = history;
        const date = new Date(timestamp);

        if (!currentDate || !isDateOnlyEqual(currentDate, date)) {
          currentDate = date;
          dom.push(getDateGroup(date));
        }

        const indexes = { page: pageIndex, edge: edgeIndex };

        dom.push(
          <PostItemCard
            key={`${history.post.id}-${timestamp}`}
            postItem={history}
            onContextMenu={(event, readingHistory) =>
              onReadingHistoryContextOptions(event, readingHistory, indexes)
            }
            onHide={(params) => onHide({ ...params, ...indexes })}
          />,
        );

        return dom;
      }, []),
    );
  }, [data, onHide]);

  return (
    <section className="flex relative flex-col">
      {renderList()}
      <InfiniteScrollScreenOffset ref={infiniteScrollRef} />
      <PostOptionsReadingHistoryMenu
        post={readingHistoryContextItem?.post}
        onHiddenMenu={() => setReadingHistoryContextItem(null)}
        onHideHistoryPost={(postId) =>
          onHide({
            postId,
            timestamp: readingHistoryContextItem.timestampDb,
            ...queryIndexes,
          })
        }
        indexes={queryIndexes}
      />
    </section>
  );
}
