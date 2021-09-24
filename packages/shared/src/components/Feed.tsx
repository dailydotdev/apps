import React, {
  CSSProperties,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import useFeed, { PostItem } from '../hooks/useFeed';
import { Ad, Post } from '../graphql/posts';
import AuthContext from '../contexts/AuthContext';
import FeedContext from '../contexts/FeedContext';
import { trackEvent as gaTrackEvent } from '../lib/analytics';
import styles from './Feed.module.css';
import SettingsContext from '../contexts/SettingsContext';
import { Spaciness } from '../graphql/settings';
import ScrollToTopButton from './ScrollToTopButton';
import useAdImpressions from '../hooks/useAdImpressions';
import useFeedUpvotePost from '../hooks/feed/useFeedUpvotePost';
import useFeedBookmarkPost from '../hooks/feed/useFeedBookmarkPost';
import useCommentPopup from '../hooks/feed/useCommentPopup';
import useFeedOnPostClick from '../hooks/feed/useFeedOnPostClick';
import useFeedReportMenu from '../hooks/feed/useFeedReportMenu';
import useFeedInfiniteScroll from '../hooks/feed/useFeedInfiniteScroll';
import FeedItemComponent, { getFeedItemKey } from './FeedItemComponent';
import useVirtualFeedGrid, {
  cardHeightPx,
} from '../hooks/feed/useVirtualFeedGrid';
import VirtualizedFeedGrid from './VirtualizedFeedGrid';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { adAnalyticsEvent, postAnalyticsEvent } from '../lib/feed';

const ReportPostMenu = dynamic(
  () => import(/* webpackChunkName: "reportPostMenu" */ './ReportPostMenu'),
);

export type FeedProps<T> = {
  feedQueryKey: unknown[];
  query?: string;
  variables?: T;
  className?: string;
  onEmptyFeed?: () => unknown;
  emptyScreen?: ReactNode;
};

const nativeShareSupport = false;

const getStyle = (useList: boolean, spaciness: Spaciness): CSSProperties => {
  if (useList && spaciness !== 'eco') {
    return spaciness === 'cozy'
      ? { maxWidth: '48.75rem' }
      : { maxWidth: '63.75rem' };
  }
  return {};
};

export default function Feed<T>({
  feedQueryKey,
  query,
  variables,
  className,
  onEmptyFeed,
  emptyScreen,
}: FeedProps<T>): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const currentSettings = useContext(FeedContext);
  const { user } = useContext(AuthContext);
  const {
    openNewTab,
    showOnlyUnreadPosts,
    spaciness,
    insaneMode,
    loadedSettings,
  } = useContext(SettingsContext);
  const numCards = currentSettings.numCards[spaciness ?? 'eco'];
  const { items, updatePost, removePost, fetchPage, canFetchMore, emptyFeed } =
    useFeed(
      feedQueryKey,
      currentSettings.pageSize,
      currentSettings.adSpot,
      numCards,
      showOnlyUnreadPosts,
      query,
      variables,
    );
  // const { nativeShareSupport } = useContext(ProgressiveEnhancementContext);
  const { onAdImpression } = useAdImpressions();

  useEffect(() => {
    if (emptyFeed) {
      onEmptyFeed?.();
    }
  }, [emptyFeed]);

  const {
    showCommentPopupId,
    setShowCommentPopupId,
    comment,
    isSendingComment,
  } = useCommentPopup();
  const infiniteScrollRef = useFeedInfiniteScroll({ fetchPage, canFetchMore });

  const onShare = async (post: Post): Promise<void> => {
    trackEvent({
      category: 'Post',
      action: 'Share',
    });
    await navigator.share({
      text: post.title,
      url: post.commentsPermalink,
    });
  };

  const useList = insaneMode && numCards > 1;

  if (!loadedSettings) {
    return <></>;
  }

  const parentRef = useRef<HTMLDivElement>();
  const { virtualizer, feedGapPx, virtualizedNumCards } = useVirtualFeedGrid(
    items,
    useList,
    numCards,
    parentRef,
    spaciness,
  );

  const onUpvote = useFeedUpvotePost(
    items,
    updatePost,
    setShowCommentPopupId,
    virtualizedNumCards,
  );
  const onBookmark = useFeedBookmarkPost(
    items,
    updatePost,
    virtualizedNumCards,
  );
  const onPostClick = useFeedOnPostClick(
    items,
    updatePost,
    virtualizedNumCards,
  );
  const {
    onHidePost,
    onReportPost,
    postNotificationIndex,
    onMenuClick,
    postMenuIndex,
    setPostMenuIndex,
  } = useFeedReportMenu(items, removePost, virtualizedNumCards);

  const onCommentClick = (
    post: Post,
    index: number,
    row: number,
    column: number,
  ): void => {
    trackEvent(
      postAnalyticsEvent('comments click', post, {
        columns: virtualizedNumCards,
        column,
        row,
        extra: { origin: 'feed' },
      }),
    );
  };

  const onAdClick = (ad: Ad, index: number, row: number, column: number) => {
    gaTrackEvent({
      category: 'Ad',
      action: 'Click',
      label: ad.source,
    });
    trackEvent(
      adAnalyticsEvent('click', ad, {
        columns: virtualizedNumCards,
        column,
        row,
        extra: { origin: 'feed' },
      }),
    );
  };

  const style = {
    height: `${virtualizer.totalSize}px`,
    '--num-cards': numCards,
    '--feed-gap': `${feedGapPx / 16}rem`,
    '--card-height': `${cardHeightPx / 16}rem`,
    ...getStyle(useList, spaciness),
  };
  return emptyScreen && emptyFeed ? (
    <>{emptyScreen}</>
  ) : (
    <div
      className={classNames(
        className,
        'relative mx-auto w-full',
        styles.feed,
        !useList && styles.cards,
      )}
      style={style}
      ref={parentRef}
    >
      <ScrollToTopButton />
      <VirtualizedFeedGrid
        items={items}
        virtualizer={virtualizer}
        virtualizedNumCards={virtualizedNumCards}
        getNthChild={(index, column, row) => (
          <FeedItemComponent
            items={items}
            index={index}
            row={row}
            column={column}
            columns={virtualizedNumCards}
            key={getFeedItemKey(items, index)}
            useList={useList}
            openNewTab={openNewTab}
            insaneMode={insaneMode}
            nativeShareSupport={nativeShareSupport}
            postMenuIndex={postMenuIndex}
            postNotificationIndex={postNotificationIndex}
            showCommentPopupId={showCommentPopupId}
            setShowCommentPopupId={setShowCommentPopupId}
            isSendingComment={isSendingComment}
            comment={comment}
            user={user}
            onUpvote={onUpvote}
            onBookmark={onBookmark}
            onPostClick={onPostClick}
            onShare={onShare}
            onMenuClick={onMenuClick}
            onCommentClick={onCommentClick}
            onAdRender={onAdImpression}
            onAdClick={onAdClick}
          />
        )}
      />
      <div
        ref={infiniteScrollRef}
        className={`absolute left-0 h-px w-px opacity-0 pointer-events-none ${styles.trigger}`}
      />
      <ReportPostMenu
        postId={(items[postMenuIndex] as PostItem)?.post?.id}
        onHidden={() => setPostMenuIndex(null)}
        onReportPost={onReportPost}
        onHidePost={onHidePost}
      />
    </div>
  );
}
