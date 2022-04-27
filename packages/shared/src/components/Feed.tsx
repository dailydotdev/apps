import React, {
  CSSProperties,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
} from 'react';
import classNames from 'classnames';
import useFeed, { PostItem } from '../hooks/useFeed';
import { Ad, Post } from '../graphql/posts';
import AuthContext from '../contexts/AuthContext';
import FeedContext from '../contexts/FeedContext';
import styles from './Feed.module.css';
import SettingsContext from '../contexts/SettingsContext';
import { Spaciness } from '../graphql/settings';
import ScrollToTopButton from './ScrollToTopButton';
import useFeedUpvotePost from '../hooks/feed/useFeedUpvotePost';
import useFeedBookmarkPost from '../hooks/feed/useFeedBookmarkPost';
import useCommentPopup from '../hooks/feed/useCommentPopup';
import useFeedOnPostClick from '../hooks/feed/useFeedOnPostClick';
import useFeedContextMenu from '../hooks/feed/useFeedContextMenu';
import useFeedInfiniteScroll, {
  InfiniteScrollScreenOffset,
} from '../hooks/feed/useFeedInfiniteScroll';
import FeedItemComponent, { getFeedItemKey } from './FeedItemComponent';
import AnalyticsContext from '../contexts/AnalyticsContext';
import {
  adAnalyticsEvent,
  feedAnalyticsExtra,
  postAnalyticsEvent,
} from '../lib/feed';
import PostOptionsMenu from './PostOptionsMenu';
import useNotification from '../hooks/useNotification';
import FeaturesContext from '../contexts/FeaturesContext';
import { Features, getFeatureValue } from '../lib/featureManagement';
import { getThemeFont } from './utilities';
import { PostModal } from './modals/PostModal';
import { usePostModalNavigation } from '../hooks/usePostModalNavigation';

export type FeedProps<T> = {
  feedName: string;
  feedQueryKey: unknown[];
  query?: string;
  variables?: T;
  className?: string;
  onEmptyFeed?: () => unknown;
  emptyScreen?: ReactNode;
  createMyFeedCard?: ReactNode;
  header?: ReactNode;
};

interface RankVariables {
  ranking?: string;
}

const nativeShareSupport = false;

const listGaps = {
  cozy: 'gap-5',
  roomy: 'gap-3',
};
const gridGaps = {
  cozy: 'gap-14',
  roomy: 'gap-12',
};
const getFeedGapPx = {
  'gap-2': 8,
  'gap-3': 12,
  'gap-5': 20,
  'gap-8': 32,
  'gap-12': 48,
  'gap-14': 56,
};
const gapClass = (useList: boolean, spaciness: Spaciness) =>
  useList ? listGaps[spaciness] ?? 'gap-2' : gridGaps[spaciness] ?? 'gap-8';

const cardListClass = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
};
const cardClass = (useList: boolean, numCards: number): string =>
  useList ? 'grid-cols-1' : cardListClass[numCards];

const calculateRow = (index: number, numCards: number): number =>
  Math.floor(index / numCards);
const calculateColumn = (index: number, numCards: number): number =>
  index % numCards;

const getStyle = (useList: boolean, spaciness: Spaciness): CSSProperties => {
  if (useList && spaciness !== 'eco') {
    return spaciness === 'cozy'
      ? { maxWidth: '48.75rem' }
      : { maxWidth: '63.75rem' };
  }
  return {};
};

export default function Feed<T>({
  feedName,
  feedQueryKey,
  query,
  variables,
  className,
  header,
  onEmptyFeed,
  emptyScreen,
  createMyFeedCard,
}: FeedProps<T>): ReactElement {
  const { flags } = useContext(FeaturesContext);
  const postHeadingFont = getThemeFont(
    getFeatureValue(Features.PostCardHeadingFont, flags),
    Features.PostCardHeadingFont.defaultValue,
  );
  const displayPublicationDate = !parseInt(
    getFeatureValue(Features.HidePublicationDate, flags),
    10,
  );
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
  const { ranking } = (variables as RankVariables) || {};
  const {
    onOpenModal,
    onCloseModal,
    onPrevious,
    onNext,
    selectedPost,
    isFetchingNextPage,
  } = usePostModalNavigation(items, fetchPage);

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
  } = useCommentPopup(feedName);
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
  const virtualizedNumCards = useList ? 1 : numCards;
  const feedGapPx = getFeedGapPx[gapClass(useList, spaciness)];

  if (!loadedSettings) {
    return <></>;
  }

  const onUpvote = useFeedUpvotePost(
    items,
    updatePost,
    setShowCommentPopupId,
    virtualizedNumCards,
    feedName,
    ranking,
  );
  const onBookmark = useFeedBookmarkPost(
    items,
    updatePost,
    virtualizedNumCards,
    feedName,
    ranking,
  );
  const onPostClick = useFeedOnPostClick(
    items,
    updatePost,
    virtualizedNumCards,
    feedName,
    ranking,
  );

  const { onMenuClick, postMenuIndex, setPostMenuIndex } = useFeedContextMenu();
  const { notification, notificationIndex, onMessage } = useNotification();

  const onRemovePost = async (removePostIndex) => {
    const item = items[removePostIndex] as PostItem;
    removePost(item.page, item.index);
  };

  const onCommentClick = (
    post: Post,
    index: number,
    row: number,
    column: number,
  ): void => {
    document.body.classList.add('hidden-scrollbar');
    trackEvent(
      postAnalyticsEvent('comments click', post, {
        columns: virtualizedNumCards,
        column,
        row,
        ...feedAnalyticsExtra(feedName, ranking),
      }),
    );
    onOpenModal(index);
  };

  const onAdClick = (ad: Ad, index: number, row: number, column: number) => {
    trackEvent(
      adAnalyticsEvent('click', ad, {
        columns: virtualizedNumCards,
        column,
        row,
        ...feedAnalyticsExtra(feedName, ranking),
      }),
    );
  };

  const style = {
    '--num-cards': numCards,
    '--feed-gap': `${feedGapPx / 16}rem`,
    ...getStyle(useList, spaciness),
  };

  if (emptyScreen && emptyFeed) {
    return <>{emptyScreen}</>;
  }

  useEffect(() => {
    if (!selectedPost) {
      document.body.classList.remove('hidden-scrollbar');
    }
  }, [selectedPost]);

  return (
    <div
      className={classNames(
        'relative mx-auto w-full',
        className,
        styles.feed,
        !useList && styles.cards,
      )}
      style={style}
    >
      {selectedPost && (
        <PostModal
          isOpen
          id={selectedPost.id}
          onRequestClose={onCloseModal}
          onPreviousPost={onPrevious}
          onNextPost={onNext}
          isFetchingNextPage={isFetchingNextPage}
        />
      )}
      {header}
      <ScrollToTopButton />
      <div
        className={classNames(
          'grid',
          gapClass(useList, spaciness),
          cardClass(useList, numCards),
        )}
      >
        {createMyFeedCard}
        {items.map((item, index) => (
          <FeedItemComponent
            items={items}
            index={index}
            row={calculateRow(index, numCards)}
            column={calculateColumn(index, numCards)}
            displayPublicationDate={displayPublicationDate}
            columns={virtualizedNumCards}
            key={getFeedItemKey(items, index)}
            useList={useList}
            openNewTab={openNewTab}
            insaneMode={insaneMode}
            nativeShareSupport={nativeShareSupport}
            postMenuIndex={postMenuIndex}
            postNotificationIndex={notificationIndex}
            notification={notification}
            showCommentPopupId={showCommentPopupId}
            setShowCommentPopupId={setShowCommentPopupId}
            isSendingComment={isSendingComment}
            comment={comment}
            user={user}
            feedName={feedName}
            ranking={ranking}
            onUpvote={onUpvote}
            onBookmark={onBookmark}
            onPostClick={onPostClick}
            onShare={onShare}
            onMenuClick={onMenuClick}
            onCommentClick={onCommentClick}
            onAdClick={onAdClick}
            postHeadingFont={postHeadingFont}
          />
        ))}
      </div>
      <InfiniteScrollScreenOffset ref={infiniteScrollRef} />
      <PostOptionsMenu
        postIndex={postMenuIndex}
        post={(items[postMenuIndex] as PostItem)?.post}
        onHidden={() => setPostMenuIndex(null)}
        onMessage={onMessage}
        onRemovePost={onRemovePost}
      />
    </div>
  );
}
