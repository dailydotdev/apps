import React, { ReactElement, useCallback } from 'react';
import { HideReadHistory } from '../../hooks/useReadingHistory';
import { isDateOnlyEqual, TimeFormatType } from '../../lib/dateFormat';
import PostItemCard from '../post/PostItemCard';
import { ReadHistoryInfiniteData } from '../../hooks/useInfiniteReadingHistory';
import { InfiniteScrollScreenOffset } from '../../hooks/feed/useFeedInfiniteScroll';
import PostOptionsReadingHistoryMenu from '../PostOptionsReadingHistoryMenu';
import useReadingHistoryContextMenu from '../../hooks/useReadingHistoryContextMenu';
import { useSharePost } from '../../hooks/useSharePost';
import { Origin } from '../../lib/log';
import { DateFormat } from '../utilities';

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
  const logOrigin = Origin.ReadingHistoryContextMenu;
  const { openSharePost } = useSharePost(logOrigin);

  const renderList = useCallback(() => {
    let currentDate: Date;

    return data?.pages.map((page, pageIndex) =>
      page.readHistory.edges.reduce((dom, { node: history }, edgeIndex) => {
        const { timestamp } = history;
        const date = new Date(timestamp);

        if (!currentDate || !isDateOnlyEqual(currentDate, date)) {
          currentDate = date;
          dom.push(
            <DateFormat
              key={date.toISOString()}
              date={date}
              type={TimeFormatType.ReadHistory}
              className="my-3 px-6 text-text-tertiary typo-body first:mt-0"
            />,
          );
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
            showVoteActions
            logOrigin={Origin.History}
          />,
        );

        return dom;
      }, []),
    );
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, onHide]);

  return (
    <section className="relative flex flex-col">
      {renderList()}
      <InfiniteScrollScreenOffset ref={infiniteScrollRef} />
      <PostOptionsReadingHistoryMenu
        post={readingHistoryContextItem?.post}
        onShare={() => openSharePost({ post: readingHistoryContextItem.post })}
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
