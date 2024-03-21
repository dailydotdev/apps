import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import dynamic from 'next/dynamic';
import useFeed, {
  FeedItem,
  PostItem,
  UseFeedOptionalParams,
} from '../hooks/useFeed';
import { PostType } from '../graphql/posts';
import FeedContext from '../contexts/FeedContext';
import SettingsContext from '../contexts/SettingsContext';
import useFeedInfiniteScroll, {
  InfiniteScrollScreenOffset,
} from '../hooks/feed/useFeedInfiniteScroll';
import { usePostModalNavigation } from '../hooks/usePostModalNavigation';
import { SharedFeedPage } from './utilities';
import { FeedContainer, FeedContainerProps } from './feeds';
import { ActiveFeedContextProvider } from '../contexts';
import { AllFeedPages, RequestKey } from '../lib/query';
import { useFeedLayout } from '../hooks';

export interface FeedProps<T>
  extends Pick<UseFeedOptionalParams<T>, 'options'>,
    Pick<FeedContainerProps, 'shortcuts'> {
  feedItemComponent: React.ComponentType<{ item: FeedItem; index?: number }>;
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
  feedItemComponent,
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
  showSearch = true,
  shortcuts,
  actionButtons,
  disableAds,
}: FeedProps<T>): ReactElement {
  const FeedTag = feedItemComponent;
  const currentSettings = useContext(FeedContext);
  const { spaciness, loadedSettings } = useContext(SettingsContext);
  const numCards = currentSettings.numCards[spaciness ?? 'eco'];
  const isSquadFeed = feedName === 'squad';
  const { shouldUseMobileFeedLayout } = useFeedLayout();
  const showAcquisitionForm =
    feedName === SharedFeedPage.MyFeed &&
    (router.query?.[acquisitionKey] as string)?.toLocaleLowerCase() ===
      'true' &&
    !user?.acquisitionChannel;
  const adSpot = useFeature(feature.feedAdSpot);

  const {
    items,
    updatePost,
    removePost,
    fetchPage,
    canFetchMore,
    emptyFeed,
    isFetching,
    isInitialLoading,
  } = useFeed(
    feedQueryKey,
    currentSettings.pageSize,
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
      },
    },
  );

  const {
    onOpenModal,
    onCloseModal,
    onPrevious,
    onNext,
    postPosition,
    selectedPost,
    selectedPostIndex,
  } = usePostModalNavigation(items, fetchPage, updatePost, canFetchMore);

  const feedContextValue = useMemo(() => {
    return {
      feedName,
      queryKey: feedQueryKey,
      items,
      onOpenModal,
    };
  }, [feedQueryKey, items, onOpenModal, feedName]);

  useEffect(() => {
    if (emptyFeed) {
      onEmptyFeed?.();
    }
  }, [emptyFeed, onEmptyFeed]);

  const infiniteScrollRef = useFeedInfiniteScroll({
    fetchPage,
    canFetchMore: canFetchMore && feedQueryKey?.[0] !== RequestKey.FeedPreview,
  });

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

  const onRemovePost = async (removePostIndex: number) => {
    const item = items[removePostIndex] as PostItem;
    removePost(item.page, item.index);
  };

  const ArticleModal = PostModalMap[selectedPost?.type];

  if (emptyScreen && emptyFeed) {
    return <>{emptyScreen}</>;
  }

  const isValidFeed = Object.values(SharedFeedPage).includes(
    feedName as SharedFeedPage,
  );

  return (
    <ActiveFeedContextProvider {...feedContextValue}>
      <FeedContainer
        forceCardMode={forceCardMode}
        header={header}
        inlineHeader={inlineHeader}
        className={className}
        showSearch={showSearch && isValidFeed}
        shortcuts={shortcuts}
        actionButtons={actionButtons}
      >
        {items.map((item, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <FeedTag item={item} key={index} index={index} />
        ))}
        <InfiniteScrollScreenOffset ref={infiniteScrollRef} />

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
      </FeedContainer>
    </ActiveFeedContextProvider>
  );
}
