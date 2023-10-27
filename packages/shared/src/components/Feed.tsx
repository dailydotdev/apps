import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import dynamic from 'next/dynamic';
import useFeed, { PostItem, UseFeedOptionalParams } from '../hooks/useFeed';
import { Ad, Post, PostType } from '../graphql/posts';
import AuthContext from '../contexts/AuthContext';
import FeedContext from '../contexts/FeedContext';
import SettingsContext from '../contexts/SettingsContext';
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
import { usePostModalNavigation } from '../hooks/usePostModalNavigation';
import { useSharePost } from '../hooks/useSharePost';
import { AnalyticsEvent, Origin } from '../lib/analytics';
import ShareOptionsMenu from './ShareOptionsMenu';
import { ExperimentWinner, OnboardingV2 } from '../lib/featureValues';
import useSidebarRendered from '../hooks/useSidebarRendered';
import OnboardingContext from '../contexts/OnboardingContext';
import AlertContext from '../contexts/AlertContext';
import { SharedFeedPage } from './utilities';
import { FeedContainer } from './feeds';
import { ActiveFeedContext } from '../contexts';
import { useFeedVotePost } from '../hooks';
import { useFeature } from './GrowthBookProvider';
import { feature } from '../lib/featureManagement';
import { AllFeedPages } from '../lib/query';

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

const ScrollFeedFiltersOnboarding = dynamic(
  () =>
    import(
      /* webpackChunkName: "scrollFeedFiltersOnboarding" */ './ScrollFeedFiltersOnboarding'
    ),
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
  forceCardMode,
  options,
  allowPin,
  showSearch = true,
  besideSearch,
  actionButtons,
}: FeedProps<T>): ReactElement {
  const { alerts } = useContext(AlertContext);
  const { onInitializeOnboarding } = useContext(OnboardingContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const currentSettings = useContext(FeedContext);
  const { user } = useContext(AuthContext);
  const { sidebarRendered } = useSidebarRendered();
  const onboardingV2 = useFeature(feature.onboardingV2);
  const {
    openNewTab,
    spaciness,
    insaneMode: listMode,
    loadedSettings,
  } = useContext(SettingsContext);
  const insaneMode = !forceCardMode && listMode;
  const numCards = currentSettings.numCards[spaciness ?? 'eco'];
  const isSquadFeed = feedName === 'squad';
  const {
    items,
    updatePost,
    removePost,
    fetchPage,
    canFetchMore,
    emptyFeed,
    isLoading,
  } = useFeed(
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

  const showScrollOnboardingVersion =
    sidebarRendered &&
    feedName === SharedFeedPage.Popular &&
    !isLoading &&
    alerts?.filter &&
    !user?.id &&
    onboardingV2 === OnboardingV2.Control;

  const infiniteScrollRef = useFeedInfiniteScroll({
    fetchPage,
    canFetchMore: canFetchMore && !showScrollOnboardingVersion,
  });

  const onInitializeOnboardingClick = () => {
    trackEvent({
      event_name: AnalyticsEvent.ClickScrollBlock,
      target_id: ExperimentWinner.ScrollOnboardingVersion,
    });
    onInitializeOnboarding(undefined, true);
  };

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

  const {
    onMenuClick,
    onShareMenuClick,
    postMenuIndex,
    postMenuLocation,
    setPostMenuIndex,
  } = useFeedContextMenu();

  const { sharePost, sharePostFeedLocation, openSharePost, closeSharePost } =
    useSharePost(Origin.Feed);

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
      const targetBookmarkState = !post?.bookmarked;
      onBookmark(
        post,
        postMenuIndex,
        postMenuLocation.row,
        postMenuLocation.column,
        targetBookmarkState,
      );
    },
    post,
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
        className={className}
        showSearch={showSearch && isValidFeed}
        besideSearch={besideSearch}
        actionButtons={actionButtons}
        afterFeed={
          showScrollOnboardingVersion ? (
            <ScrollFeedFiltersOnboarding
              onInitializeOnboarding={onInitializeOnboardingClick}
            />
          ) : null
        }
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
            onBookmark={onBookmark}
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
          feedQueryKey={feedQueryKey}
          postIndex={postMenuIndex}
          onHidden={() => setPostMenuIndex(null)}
          onRemovePost={onRemovePost}
          origin={Origin.Feed}
          allowPin={allowPin}
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
            origin={Origin.Feed}
            {...sharePostFeedLocation}
            onRequestClose={closeSharePost}
          />
        )}
      </FeedContainer>
    </ActiveFeedContext.Provider>
  );
}
