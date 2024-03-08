import React, { ReactElement, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { HideReadHistory } from '../../hooks/useReadingHistory';
import { isDateOnlyEqual, TimeFormatType } from '../../lib/dateFormat';
import PostItemCard from '../post/PostItemCard';
import { ReadHistoryInfiniteData } from '../../hooks/useInfiniteReadingHistory';
import { InfiniteScrollScreenOffset } from '../../hooks/feed/useFeedInfiniteScroll';
import PostOptionsReadingHistoryMenu from '../PostOptionsReadingHistoryMenu';
import useReadingHistoryContextMenu from '../../hooks/useReadingHistoryContextMenu';
import { useSharePost } from '../../hooks/useSharePost';
import { Origin } from '../../lib/analytics';
import { DateFormat } from '../utilities';

const getDateGroup = (date: Date) => {
  return (
    <DateFormat
      date={date}
      type={TimeFormatType.ReadHistory}
      className="my-3 px-6 text-theme-label-tertiary typo-body first:mt-0"
    />
  );
};

const SharePostModal = dynamic(
  () => import(/* webpackChunkName: "shareModal" */ '../modals/ShareModal'),
);

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
  const analyticsOrigin = Origin.ReadingHistoryContextMenu;
  const { sharePost, openSharePost, closeSharePost } =
    useSharePost(analyticsOrigin);

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
            showVoteActions
            analyticsOrigin={Origin.History}
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
        onShare={() => openSharePost(readingHistoryContextItem.post)}
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
      {sharePost && (
        <SharePostModal
          isOpen={!!sharePost}
          post={sharePost}
          origin={analyticsOrigin}
          onRequestClose={closeSharePost}
        />
      )}
    </section>
  );
}
