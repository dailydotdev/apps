import React, {
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
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
import type { PostLocation } from '../hooks/feed/useFeedContextMenu';
import useFeedInfiniteScroll, {
  InfiniteScrollScreenOffset,
} from '../hooks/feed/useFeedInfiniteScroll';
import FeedItemComponent, { getFeedItemKey } from './FeedItemComponent';
import LogContext from '../contexts/LogContext';
import { adLogEvent, feedLogExtra, postLogEvent } from '../lib/feed';
import PostOptionsMenu from './PostOptionsMenu';
import { usePostModalNavigation } from '../hooks/usePostModalNavigation';
import { useSharePost } from '../hooks/useSharePost';
import { Origin } from '../lib/log';
import ShareOptionsMenu from './ShareOptionsMenu';
import { SharedFeedPage } from './utilities';
import { FeedContainer, FeedContainerProps } from './feeds/FeedContainer';
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
import { MarketingCtaVariant } from './marketingCta/common';
import { isNullOrUndefined } from '../lib/func';

export interface FeedProps<T>
  extends Pick<
      UseFeedOptionalParams<T>,
      'options' | 'showPublicSquadsEligibility'
    >,
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
  allowPin?: boolean;
  showSearch?: boolean;
  actionButtons?: ReactNode;
  disableAds?: boolean;
  allowFetchMore?: boolean;
  pageSize?: number;
  isHorizontal?: boolean;
  feedContainerRef?: React.Ref<HTMLDivElement>;
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
  showPublicSquadsEligibility,
}: FeedProps<T>): ReactElement {
  const origin = Origin.Feed;
  const { logEvent } = useContext(LogContext);
  const currentSettings = useContext(FeedContext);
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { openNewTab, spaciness, loadedSettings } = useContext(SettingsContext);
  const { isListMode } = useFeedLayout();
  const numCards = currentSettings.numCards[spaciness ?? 'eco'];
  const isSquadFeed = feedName === OtherFeedPage.Squad;
  const { shouldUseListFeedLayout } = useFeedLayout();
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
    isSquadFeed || shouldUseListFeedLayout ? 2 : adSpot,
    numCards,
    {
      onEmptyFeed,
      query,
      variables,
      options,
      showPublicSquadsEligibility,
      settings: {
        disableAds,
        adPostLength: isSquadFeed ? 2 : undefined,
        showAcquisitionForm,
        ...(showMarketingCta && { marketingCta }),
      },
    },
  );
  const canFetchMore = allowFetchMore ?? queryCanFetchMore;
  const contextId = `post-context-${feedName}`;

  const [postModalIndex, setPostModalIndex] = useState<PostLocation>(null);
  const { onMenuClick, postMenuIndex, postMenuLocation, setPostMenuIndex } =
    useFeedContextMenu({ contextId });
  const useList = isListMode && numCards > 1;
  const virtualizedNumCards = useList ? 1 : numCards;
  const logOpts = useMemo(() => {
    return {
      columns: virtualizedNumCards,
      row: !isNullOrUndefined(postModalIndex?.row)
        ? postModalIndex.row
        : postMenuLocation?.row,
      column: !isNullOrUndefined(postModalIndex?.column)
        ? postModalIndex.column
        : postMenuLocation?.column,
    };
  }, [postMenuLocation, virtualizedNumCards, postModalIndex]);

  const feedContextValue = useMemo(() => {
    return {
      queryKey: feedQueryKey,
      items,
      logOpts,
    };
  }, [feedQueryKey, items, logOpts]);

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

  const infiniteScrollRef = useFeedInfiniteScroll({
    fetchPage,
    canFetchMore: canFetchMore && feedQueryKey?.[0] !== RequestKey.FeedPreview,
  });

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

  const onShareClick = useCallback(
    (post: Post, row?: number, column?: number) =>
      openSharePost({ post, columns: virtualizedNumCards, column, row }),
    [openSharePost, virtualizedNumCards],
  );

  if (!loadedSettings) {
    return <></>;
  }

  const onPostModalOpen = ({
    index,
    callback,
    row,
    column,
  }: {
    index: number;
    callback?: () => unknown;
    row?: number;
    column?: number;
  }) => {
    document.body.classList.add('hidden-scrollbar');
    callback?.();
    setPostModalIndex({ index, row, column });
    onOpenModal(index);
  };

  const onPostModalClose = () => {
    setPostModalIndex(null);
    onCloseModal(false);
  };

  const onPostCardClick: FeedPostClick = async (post, index, row, column) => {
    await onPostClick(post, index, row, column, {
      skipPostUpdate: true,
    });
    if (!shouldUseListFeedLayout) {
      onPostModalOpen({ index, row, column });
    }
  };

  const onCopyLinkClickLogged = (
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
    logEvent(
      postLogEvent('comments click', post, {
        columns: virtualizedNumCards,
        column,
        row,
        ...feedLogExtra(feedName, ranking),
      }),
    );
    if (!shouldUseListFeedLayout) {
      onPostModalOpen({ index, row, column });
    }
  };

  const onAdClick = (ad: Ad, row: number, column: number) => {
    logEvent(
      adLogEvent('click', ad, {
        columns: virtualizedNumCards,
        column,
        row,
        ...feedLogExtra(feedName, ranking),
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
        ...feedLogExtra(feedName, ranking),
      },
    });

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
        header={header}
        inlineHeader={inlineHeader}
        className={className}
        showSearch={showSearch && isValidFeed}
        shortcuts={shortcuts}
        actionButtons={actionButtons}
        isHorizontal={isHorizontal}
        feedContainerRef={feedContainerRef}
      >
        {items.map((item, index) => (
          <FeedItemComponent
            item={item}
            index={index}
            row={calculateRow(index, virtualizedNumCards)}
            column={calculateColumn(index, virtualizedNumCards)}
            columns={virtualizedNumCards}
            key={getFeedItemKey(item, index)}
            openNewTab={openNewTab}
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
            onCopyLinkClick={onCopyLinkClickLogged}
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
          contextId={contextId}
        />
        <ShareOptionsMenu
          {...commonMenuItems}
          shouldUseListFeedLayout={shouldUseListFeedLayout}
          onHidden={onShareOptionsHidden}
        />
        {!shouldUseListFeedLayout && selectedPost && PostModal && (
          <PostModal
            isOpen={!!selectedPost}
            id={selectedPost.id}
            onRequestClose={onPostModalClose}
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
