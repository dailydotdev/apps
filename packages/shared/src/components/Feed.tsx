import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import dynamic from 'next/dynamic';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
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
import { SharedFeedPage } from './utilities';
import { FeedContainer, FeedContainerProps } from './feeds';
import { ActiveFeedContext } from '../contexts';
import { useBoot, useFeedLayout, useFeedVotePost } from '../hooks';
import {
  AllFeedPages,
  OtherFeedPage,
  RequestKey,
  updateCachedPagePost,
} from '../lib/query';
import {
  mutateBookmarkFeedPost,
  useBookmarkPost,
} from '../hooks/useBookmarkPost';
import { useFeature } from './GrowthBookProvider';
import { feature } from '../lib/featureManagement';
import { acquisitionKey } from './cards/AcquisitionFormCard';
import { MarketingCtaVariant } from './cards/MarketingCta/common';

export interface FeedProps<T>
  extends Pick<UseFeedOptionalParams<T>, 'options'>,
    Pick<FeedContainerProps, 'shortcuts'> {
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
  actionButtons?: ReactNode;
  disableAds?: boolean;
  allowFetchMore?: boolean;
  pageSize?: number;
  isHorizontal?: boolean;
  feedContainerRef?: React.RefObject<HTMLDivElement>;
}

interface RankVariables {
  ranking?: string;
}

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
const CollectionPostModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "collectionPostModal" */ './modals/CollectionPostModal'
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
  [PostType.VideoYouTube]: ArticlePostModal,
  [PostType.Collection]: CollectionPostModal,
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
  shortcuts,
  actionButtons,
  disableAds,
  allowFetchMore,
  pageSize,
  isHorizontal = false,
  feedContainerRef,
}: FeedProps<T>): ReactElement {
  const origin = Origin.Feed;
  const { trackEvent } = useContext(AnalyticsContext);
  const currentSettings = useContext(FeedContext);
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    openNewTab,
    spaciness,
    insaneMode: listMode,
    loadedSettings,
  } = useContext(SettingsContext);
  const insaneMode = !forceCardMode && listMode;
  const numCards = currentSettings.numCards[spaciness ?? 'eco'];
  const isSquadFeed = feedName === OtherFeedPage.Squad;
  const { shouldUseMobileFeedLayout } = useFeedLayout();
  const showAcquisitionForm =
    feedName === SharedFeedPage.MyFeed &&
    (router.query?.[acquisitionKey] as string)?.toLocaleLowerCase() ===
      'true' &&
    !user?.acquisitionChannel;
  const adSpot = useFeature(feature.feedAdSpot);
  const { getMarketingCta } = useBoot();
  const marketingCta = getMarketingCta(MarketingCtaVariant.Card);
  const showMarketingCta = !!marketingCta;

  const {
    items,
    updatePost,
    removePost,
    fetchPage,
    canFetchMore: queryCanFetchMore,
    emptyFeed,
    isFetching,
    isInitialLoading,
  } = useFeed(
    feedQueryKey,
    pageSize ?? currentSettings.pageSize,
    isSquadFeed || shouldUseMobileFeedLayout ? 2 : adSpot,
    numCards,
    {
      query,
      variables,
      options,
      settings: {
        disableAds,
        adPostLength: isSquadFeed ? 2 : undefined,
        showAcquisitionForm,
        ...(showMarketingCta && { marketingCta }),
      },
    },
  );
  const canFetchMore = allowFetchMore ?? queryCanFetchMore;
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

  const { onMenuClick, postMenuIndex, postMenuLocation, setPostMenuIndex } =
    useFeedContextMenu();

  const { openSharePost, copyLink } = useSharePost(origin);

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
    if (!shouldUseMobileFeedLayout) {
      onPostModalOpen(index);
    }
  };

  const onCopyLinkClickTracked = (
    e: React.MouseEvent,
    post: Post,
    index: number,
    row: number,
    column: number,
  ) => {
    copyLink({ post, columns: virtualizedNumCards, row, column });
  };

  const onShareOptionsHidden = () => {
    setPostMenuIndex(null);
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
    trackEvent(
      postAnalyticsEvent('comments click', post, {
        columns: virtualizedNumCards,
        column,
        row,
        ...feedAnalyticsExtra(feedName, ranking),
      }),
    );
    if (!shouldUseMobileFeedLayout) {
      onPostModalOpen(index);
    }
  };

  const onAdClick = (ad: Ad, row: number, column: number) => {
    trackEvent(
      adAnalyticsEvent('click', ad, {
        columns: virtualizedNumCards,
        column,
        row,
        ...feedAnalyticsExtra(feedName, ranking),
      }),
    );
  };

  const onCardBookmark = (post: Post, row: number, column: number) =>
    onBookmark({
      post,
      origin,
      opts: {
        row,
        column,
        columns: virtualizedNumCards,
        ...feedAnalyticsExtra(feedName, ranking),
      },
    });

  const onShareClick = (post: Post, row?: number, column?: number) =>
    openSharePost({ post, columns: virtualizedNumCards, column, row });

  const post = (items[postMenuIndex] as PostItem)?.post;
  const commonMenuItems = {
    onShare: () =>
      openSharePost({
        post,
        columns: virtualizedNumCards,
        row: postMenuLocation.row,
        column: postMenuLocation.column,
      }),
    post,
    prevPost: (items[postMenuIndex - 1] as PostItem)?.post,
    nextPost: (items[postMenuIndex + 1] as PostItem)?.post,
  };

  const PostModal = PostModalMap[selectedPost?.type];

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
        shortcuts={shortcuts}
        actionButtons={actionButtons}
        isHorizontal={isHorizontal}
        feedContainerRef={feedContainerRef}
      >
        {items.map((_, index) => (
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
            onBookmark={onCardBookmark}
            toggleUpvote={toggleUpvote}
            toggleDownvote={toggleDownvote}
            onPostClick={onPostCardClick}
            onShare={onShareClick}
            onMenuClick={onMenuClick}
            onCopyLinkClick={onCopyLinkClickTracked}
            onCommentClick={onCommentClick}
            onAdClick={onAdClick}
            onReadArticleClick={onReadArticleClick}
          />
        ))}
        {!isFetching && !isInitialLoading && !isHorizontal && (
          <InfiniteScrollScreenOffset ref={infiniteScrollRef} />
        )}
        <PostOptionsMenu
          {...commonMenuItems}
          feedName={feedName}
          postIndex={postMenuIndex}
          onHidden={() => setPostMenuIndex(null)}
          onRemovePost={onRemovePost}
          origin={origin}
          allowPin={allowPin}
        />
        <ShareOptionsMenu
          {...commonMenuItems}
          shouldUseMobileFeedLayout={shouldUseMobileFeedLayout}
          onHidden={onShareOptionsHidden}
        />
        {!shouldUseMobileFeedLayout && selectedPost && PostModal && (
          <PostModal
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
      </FeedContainer>
    </ActiveFeedContext.Provider>
  );
}
