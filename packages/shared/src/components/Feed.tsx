import React, {
  CSSProperties,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
} from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
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
import useFeedOnPostClick, {
  FeedPostClick,
} from '../hooks/feed/useFeedOnPostClick';
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
import FeaturesContext from '../contexts/FeaturesContext';
import { usePostModalNavigation } from '../hooks/usePostModalNavigation';
import {
  ToastSubject,
  useToastNotification,
} from '../hooks/useToastNotification';
import { useSharePost } from '../hooks/useSharePost';
import { Origin } from '../lib/analytics';

export type FeedProps<T> = {
  feedName: string;
  feedQueryKey: unknown[];
  query?: string;
  variables?: T;
  className?: string;
  onEmptyFeed?: () => unknown;
  emptyScreen?: ReactNode;
  header?: ReactNode;
};

interface RankVariables {
  ranking?: string;
}

const SharePostModal = dynamic(() => import('./modals/ShareModal'));
const PostModal = dynamic(() => import('./modals/PostModal'));

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
}: FeedProps<T>): ReactElement {
  const {
    postCardVersion,
    postModalByDefault,
    postEngagementNonClickable,
    showCommentPopover,
  } = useContext(FeaturesContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const currentSettings = useContext(FeedContext);
  const { user } = useContext(AuthContext);
  const { subject } = useToastNotification();
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
  const { additionalInteractionButtonFeature } = useContext(FeaturesContext);

  useEffect(() => {
    if (emptyFeed) {
      onEmptyFeed?.();
    }
  }, [emptyFeed]);

  const infiniteScrollRef = useFeedInfiniteScroll({ fetchPage, canFetchMore });

  const useList = insaneMode && numCards > 1;
  const virtualizedNumCards = useList ? 1 : numCards;
  const feedGapPx = getFeedGapPx[gapClass(useList, spaciness)];

  if (!loadedSettings) {
    return <></>;
  }

  const {
    showCommentPopupId,
    setShowCommentPopupId,
    comment,
    isSendingComment,
  } = useCommentPopup(feedName);

  const onUpvote = useFeedUpvotePost(
    items,
    updatePost,
    showCommentPopover && setShowCommentPopupId,
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

  const onReadArticleClick = useFeedOnPostClick(
    items,
    updatePost,
    virtualizedNumCards,
    feedName,
    ranking,
    'go to link',
  );

  const onPostModalOpen = (index: number, callback?: () => unknown) => {
    document.body.classList.add('hidden-scrollbar');
    callback?.();
    onOpenModal(index);
  };

  const onPostCardClick: FeedPostClick = async (post, index, row, column) => {
    await onPostClick(post, index, row, column, {
      skipPostUpdate: postModalByDefault,
    });

    if (!postModalByDefault) {
      return;
    }

    onPostModalOpen(index);
  };

  const { onMenuClick, postMenuIndex, postMenuLocation, setPostMenuIndex } =
    useFeedContextMenu();

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
    onPostModalOpen(index, () =>
      trackEvent(
        postAnalyticsEvent('comments click', post, {
          columns: virtualizedNumCards,
          column,
          row,
          ...feedAnalyticsExtra(feedName, ranking),
        }),
      ),
    );
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
  } as React.CSSProperties;
  const cardContainerStye = { ...getStyle(useList, spaciness) };

  if (emptyScreen && emptyFeed) {
    return <>{emptyScreen}</>;
  }

  const { sharePost, sharePostFeedLocation, openSharePost, closeSharePost } =
    useSharePost(Origin.Feed);
  const onShareClick = (post: Post, row?: number, column?: number) =>
    openSharePost(post, virtualizedNumCards, column, row);

  useEffect(() => {
    return () => {
      document.body.classList.remove('hidden-scrollbar');
    };
  }, []);

  useEffect(() => {
    if (!selectedPost) {
      document.body.classList.remove('hidden-scrollbar');
    }
  }, [selectedPost]);

  return (
    <div
      className={classNames(
        'flex flex-col laptopL:mx-auto w-full',
        styles.container,
      )}
      style={style}
    >
      {header}
      <div
        className={classNames(
          'relative mx-auto w-full',
          className,
          styles.feed,
          !useList && styles.cards,
        )}
        style={cardContainerStye}
        aria-live={subject === ToastSubject.Feed ? 'assertive' : 'off'}
        data-testid="posts-feed"
      >
        {selectedPost && (
          <PostModal
            isOpen
            id={selectedPost.id}
            onRequestClose={() => onCloseModal(false)}
            onPreviousPost={onPrevious}
            onNextPost={onNext}
            isFetchingNextPage={isFetchingNextPage}
          />
        )}
        <ScrollToTopButton />
        <div
          className={classNames(
            'grid',
            gapClass(useList, spaciness),
            cardClass(useList, numCards),
          )}
        >
          {items.map((item, index) => (
            <FeedItemComponent
              additionalInteractionButtonFeature={
                additionalInteractionButtonFeature
              }
              items={items}
              index={index}
              row={calculateRow(index, numCards)}
              column={calculateColumn(index, numCards)}
              columns={virtualizedNumCards}
              key={getFeedItemKey(items, index)}
              useList={useList}
              openNewTab={openNewTab}
              insaneMode={insaneMode}
              postMenuIndex={postMenuIndex}
              showCommentPopupId={showCommentPopupId}
              setShowCommentPopupId={setShowCommentPopupId}
              isSendingComment={isSendingComment}
              comment={comment}
              user={user}
              feedName={feedName}
              ranking={ranking}
              onUpvote={onUpvote}
              onBookmark={onBookmark}
              onPostClick={onPostCardClick}
              onShare={onShareClick}
              onMenuClick={onMenuClick}
              onCommentClick={onCommentClick}
              onAdClick={onAdClick}
              onReadArticleClick={onReadArticleClick}
              postCardVersion={postCardVersion}
              postModalByDefault={postModalByDefault}
              postEngagementNonClickable={postEngagementNonClickable}
            />
          ))}
        </div>
        <InfiniteScrollScreenOffset ref={infiniteScrollRef} />
        <PostOptionsMenu
          additionalInteractionButtonFeature={
            additionalInteractionButtonFeature
          }
          onShare={() =>
            openSharePost(
              (items[postMenuIndex] as PostItem)?.post,
              virtualizedNumCards,
              postMenuLocation.row,
              postMenuLocation.column,
            )
          }
          onBookmark={() =>
            onBookmark(
              (items[postMenuIndex] as PostItem)?.post,
              postMenuIndex,
              postMenuLocation.row,
              postMenuLocation.column,
              !(items[postMenuIndex] as PostItem)?.post?.bookmarked,
            )
          }
          feedName={feedName}
          postIndex={postMenuIndex}
          post={(items[postMenuIndex] as PostItem)?.post}
          onHidden={() => setPostMenuIndex(null)}
          onRemovePost={onRemovePost}
        />
        {sharePost && (
          <SharePostModal
            isOpen={!!sharePost}
            post={sharePost}
            origin={Origin.Feed}
            {...sharePostFeedLocation}
            onRequestClose={closeSharePost}
          />
        )}
      </div>
    </div>
  );
}
