import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import dynamic from 'next/dynamic';
import useFeed, { PostItem, UseFeedOptionalParams } from '../hooks/useFeed';
import { PostType } from '../graphql/posts';
import FeedContext from '../contexts/FeedContext';
import SettingsContext from '../contexts/SettingsContext';
import useFeedInfiniteScroll, {
  InfiniteScrollScreenOffset,
} from '../hooks/feed/useFeedInfiniteScroll';
import { usePostModalNavigation } from '../hooks/usePostModalNavigation';
import { SharedFeedPage } from './utilities';
import { FeedContainer } from './feeds';
import { ActiveFeedContextProvider } from '../contexts';
import { AllFeedPages, RequestKey } from '../lib/query';

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

const PostModalMap: Record<PostType, typeof ArticlePostModal> = {
  [PostType.Article]: ArticlePostModal,
  [PostType.Share]: SharePostModal,
  [PostType.Welcome]: SharePostModal,
  [PostType.Freeform]: SharePostModal,
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
  besideSearch,
  actionButtons,
}: FeedProps<T>): ReactElement {
  const FeedTag = feedItemComponent;
  const currentSettings = useContext(FeedContext);
  const { spaciness, loadedSettings } = useContext(SettingsContext);
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

  const {
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
        besideSearch={besideSearch}
        actionButtons={actionButtons}
      >
        {items.map((item, index) => (
          <FeedTag item={item} key={index} />
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
