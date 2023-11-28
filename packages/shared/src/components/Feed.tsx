import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import dynamic from 'next/dynamic';
import { useQueryClient } from '@tanstack/react-query';
import useFeed, { PostItem, UseFeedOptionalParams } from '../hooks/useFeed';
import { Ad, Post, PostType } from '../graphql/posts';
import AuthContext from '../contexts/AuthContext';
import FeedContext from '../contexts/FeedContext';
import SettingsContext from '../contexts/SettingsContext';
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
import { usePostModalNavigation } from '../hooks/usePostModalNavigation';
import { useSharePost } from '../hooks/useSharePost';
import { Origin } from '../lib/analytics';
import ShareOptionsMenu from './ShareOptionsMenu';
import { ExperimentWinner } from '../lib/featureValues';
import { SharedFeedPage } from './utilities';
import { FeedContainer } from './feeds';
import { ActiveFeedContext } from '../contexts';
import { useFeedVotePost } from '../hooks';
import { AllFeedPages, RequestKey, updateCachedPagePost } from '../lib/query';
import {
  mutateBookmarkFeedPost,
  useBookmarkPost,
} from '../hooks/useBookmarkPost';
import { isNullOrUndefined } from '../lib/func';

export interface FeedProps<T>
  extends Pick<UseFeedOptionalParams<T>, 'options'> {
  feedName: AllFeedPages;
  feedQueryKey: unknown[];
  query?: string;
  variables?: T;
  className?: string;
  onEmptyFeed?: () => unknown;
  emptyScreen?: ReactNode;
  header?: ReactNode;
  inlineHeader?: boolean;
  forceCardMode?: boolean;
  allowPin?: boolean;
  showSearch?: boolean;
  besideSearch?: ReactNode;
  actionButtons?: ReactNode;
}

interface RankVariables {
  ranking?: string;
}

const ShareModal = dynamic(
  () => import(/* webpackChunkName: "shareModal" */ './modals/ShareModal'),
);
const ArticlePostModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "articlePostModal" */ './modals/ArticlePostModal'
    ),
);
const SharePostModal = dynamic(
  () =>
    import(/* webpackChunkName: "sharePostModal" */ './modals/SharePostModal'),
);

const calculateRow = (index: number, numCards: number): number =>
  Math.floor(index / numCards);
const calculateColumn = (index: number, numCards: number): number =>
  index % numCards;

const PostModalMap: Record<PostType, typeof ArticlePostModal> = {
  [PostType.Article]: ArticlePostModal,
  [PostType.Share]: SharePostModal,
  [PostType.Welcome]: SharePostModal,
  [PostType.Freeform]: SharePostModal,

  // TODO WT-1939-collections
  [PostType.Collection]: () => <div>TBD</div>,
};

export default function Feed<T>({
  feedName,
  feedQueryKey,
  query,
  variables,
  className,
  header,
  inlineHeader,
  onEmptyFeed,
  emptyScreen,
  forceCardMode,
  options,
  allowPin,
  showSearch = true,
  besideSearch,
  actionButtons,
}: FeedProps<T>): ReactElement {
  const origin = Origin.Feed;
  const { trackEvent } = useContext(AnalyticsContext);
  const currentSettings = useContext(FeedContext);
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const {
    openNewTab,
    spaciness,
    insaneMode: listMode,
    loadedSettings,
  } = useContext(SettingsContext);
  const insaneMode = !forceCardMode && listMode;
  const numCards = currentSettings.numCards[spaciness ?? 'eco'];
  const isSquadFeed = feedName === 'squad';
  const { items, updatePost, removePost, fetchPage, canFetchMore, emptyFeed } =
    useFeed(
      feedQueryKey,
      currentSettings.pageSize,
      isSquadFeed ? 3 : currentSettings.adSpot,
      numCards,
      {
        query,
        variables,
        options,
        ...(isSquadFeed && { settings: { adPostLength: 2 } }),
      },
    );
  const feedContextValue = useMemo(() => {
    return {
      queryKey: feedQueryKey,
      items,
    };
  }, [feedQueryKey, items]);

  const { ranking } = (variables as RankVariables) || {};
  const {
    onOpenModal,
    onCloseModal,
    onPrevious,
    onNext,
    postPosition,
    selectedPost,
    selectedPostIndex,
  } = usePostModalNavigation(items, fetchPage, updatePost, canFetchMore);

  useEffect(() => {
    if (emptyFeed) {
      onEmptyFeed?.();
    }
  }, [emptyFeed, onEmptyFeed]);

  const infiniteScrollRef = useFeedInfiniteScroll({
    fetchPage,
    canFetchMore: canFetchMore && feedQueryKey?.[0] !== RequestKey.FeedPreview,
  });

  const useList = insaneMode && numCards > 1;
  const virtualizedNumCards = useList ? 1 : numCards;

  const {
    showCommentPopupId,
    setShowCommentPopupId,
    comment,
    isSendingComment,
  } = useCommentPopup(feedName);

  const { toggleUpvote, toggleDownvote } = useFeedVotePost({
    feedName,
    ranking,
    items,
    updatePost,
  });

  const { toggleBookmark: onBookmark } = useBookmarkPost({
    mutationKey: feedQueryKey,
    onMutate: ({ id }) => {
      return mutateBookmarkFeedPost({
        id,
        items,
        updatePost: updateCachedPagePost(feedQueryKey, queryClient),
      });
    },
  });

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

  const {
    onMenuClick,
    onShareMenuClick,
    postMenuIndex,
    postMenuLocation,
    setPostMenuIndex,
  } = useFeedContextMenu();

  const { sharePost, sharePostFeedLocation, openSharePost, closeSharePost } =
    useSharePost(origin);

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

  if (!loadedSettings) {
    return <></>;
  }

  const onPostModalOpen = (index: number, callback?: () => unknown) => {
    document.body.classList.add('hidden-scrollbar');
    callback?.();
    onOpenModal(index);
  };

  const onPostCardClick: FeedPostClick = async (post, index, row, column) => {
    await onPostClick(post, index, row, column, {
      skipPostUpdate: true,
    });
    onPostModalOpen(index);
  };

  let lastShareMenuCloseTrackEvent = () => {};
  const onShareMenuClickTracked = (
    e: React.MouseEvent,
    post: Post,
    index: number,
    row: number,
    column: number,
  ) => {
    onShareMenuClick(e, post, index, row, column);
    const trackEventOptions = {
      columns: virtualizedNumCards,
      column,
      row,
      ...feedAnalyticsExtra(
        feedName,
        ranking,
        undefined,
        undefined,
        ExperimentWinner.PostCardShareVersion,
      ),
    };
    trackEvent(postAnalyticsEvent('open share', post, trackEventOptions));
    lastShareMenuCloseTrackEvent = () => {
      trackEvent(postAnalyticsEvent('close share', post, trackEventOptions));
    };
  };

  const onShareOptionsHidden = () => {
    setPostMenuIndex(null);
    lastShareMenuCloseTrackEvent();
  };

  const onRemovePost = async (removePostIndex: number) => {
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

  const onShareClick = (post: Post, row?: number, column?: number) =>
    openSharePost(post, virtualizedNumCards, column, row);

  const post = (items[postMenuIndex] as PostItem)?.post;
  const commonMenuItems = {
    onShare: () =>
      openSharePost(
        post,
        virtualizedNumCards,
        postMenuLocation.row,
        postMenuLocation.column,
      ),
    onBookmark: () => {
      onBookmark({ post, origin, opts: feedAnalyticsExtra(feedName, ranking) });
    },
    post,
    prevPost: (items[postMenuIndex - 1] as PostItem)?.post,
    nextPost: (items[postMenuIndex + 1] as PostItem)?.post,
  };

  const ArticleModal = PostModalMap[selectedPost?.type];

  if (emptyScreen && emptyFeed) {
    return <>{emptyScreen}</>;
  }

  const isValidFeed = Object.values(SharedFeedPage).includes(
    feedName as SharedFeedPage,
  );

  return (
    <ActiveFeedContext.Provider value={feedContextValue}>
      <FeedContainer
        forceCardMode={forceCardMode}
        header={header}
        inlineHeader={inlineHeader}
        className={className}
        showSearch={showSearch && isValidFeed}
        besideSearch={besideSearch}
        actionButtons={actionButtons}
      >
        {items.map((item, index) => (
          <FeedItemComponent
            items={items}
            index={index}
            row={calculateRow(index, virtualizedNumCards)}
            column={calculateColumn(index, virtualizedNumCards)}
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
            toggleUpvote={toggleUpvote}
            toggleDownvote={toggleDownvote}
            onPostClick={onPostCardClick}
            onShare={onShareClick}
            onMenuClick={onMenuClick}
            onShareClick={onShareMenuClickTracked}
            onCommentClick={onCommentClick}
            onAdClick={onAdClick}
            onReadArticleClick={onReadArticleClick}
          />
        ))}
        <InfiniteScrollScreenOffset ref={infiniteScrollRef} />
        <PostOptionsMenu
          {...commonMenuItems}
          feedName={feedName}
          postIndex={postMenuIndex}
          onHidden={() => setPostMenuIndex(null)}
          onRemovePost={onRemovePost}
          origin={origin}
          allowPin={allowPin}
          isOpen={!isNullOrUndefined(postMenuIndex)}
        />
        <ShareOptionsMenu
          {...commonMenuItems}
          onHidden={onShareOptionsHidden}
        />
        {selectedPost && ArticleModal && (
          <ArticleModal
            isOpen={!!selectedPost}
            id={selectedPost.id}
            onRequestClose={() => onCloseModal(false)}
            onPreviousPost={onPrevious}
            onNextPost={onNext}
            postPosition={postPosition}
            post={selectedPost}
            onRemovePost={() => onRemovePost(selectedPostIndex)}
          />
        )}
        {sharePost && (
          <ShareModal
            isOpen={!!sharePost}
            post={sharePost}
            origin={origin}
            {...sharePostFeedLocation}
            onRequestClose={closeSharePost}
          />
        )}
      </FeedContainer>
    </ActiveFeedContext.Provider>
  );
}
