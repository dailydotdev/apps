import React, {
  CSSProperties,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
} from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import useFeed, { PostItem, UseFeedOptionalParams } from '../hooks/useFeed';
import { Ad, Post, PostType } from '../graphql/posts';
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
  cardClass,
  feedAnalyticsExtra,
  gapClass,
  getFeedGapPx,
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
import { AnalyticsEvent, Origin } from '../lib/analytics';
import ShareOptionsMenu from './ShareOptionsMenu';
import {
  ExperimentWinner,
  ScrollOnboardingVersion,
} from '../lib/featureValues';
import useSidebarRendered from '../hooks/useSidebarRendered';
import AlertContext from '../contexts/AlertContext';
import OnboardingContext from '../contexts/OnboardingContext';
import { MainFeedPage } from './utilities';
import Slider from './containers/Slider';
import { ArticlePostCard } from './cards/ArticlePostCard';
import useMedia from '../hooks/useMedia';
import { Button } from './buttons/Button';

export interface FeedProps<T>
  extends Pick<UseFeedOptionalParams<T>, 'options'> {
  feedName: string;
  feedQueryKey: unknown[];
  query?: string;
  variables?: T;
  className?: string;
  onEmptyFeed?: () => unknown;
  emptyScreen?: ReactNode;
  header?: ReactNode;
  forceCardMode?: boolean;
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

const getStyle = (useList: boolean, spaciness: Spaciness): CSSProperties => {
  if (useList && spaciness !== 'eco') {
    return spaciness === 'cozy'
      ? { maxWidth: '48.75rem' }
      : { maxWidth: '63.75rem' };
  }
  return {};
};

const PostModalMap: Record<PostType, typeof ArticlePostModal> = {
  [PostType.Article]: ArticlePostModal,
  [PostType.Share]: SharePostModal,
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
}: FeedProps<T>): ReactElement {
  const { showCommentPopover } = useContext(FeaturesContext);
  const { scrollOnboardingVersion } = useContext(FeaturesContext);
  const { alerts } = useContext(AlertContext);
  const { onInitializeOnboarding } = useContext(OnboardingContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const currentSettings = useContext(FeedContext);
  const { user } = useContext(AuthContext);
  const { sidebarRendered } = useSidebarRendered();
  const { subject } = useToastNotification();
  const {
    openNewTab,
    spaciness,
    insaneMode: listMode,
    loadedSettings,
  } = useContext(SettingsContext);
  const insaneMode = !forceCardMode && listMode;
  const numCards = currentSettings.numCards[spaciness ?? 'eco'];
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
    currentSettings.adSpot,
    numCards,
    { query, variables, options },
  );

  const { ranking } = (variables as RankVariables) || {};
  const {
    onOpenModal,
    onCloseModal,
    onPrevious,
    onNext,
    postPosition,
    selectedPost,
    isFetchingNextPage,
  } = usePostModalNavigation(items, fetchPage, updatePost, canFetchMore);

  useEffect(() => {
    if (emptyFeed) {
      onEmptyFeed?.();
    }
  }, [emptyFeed]);

  const showScrollOnboardingVersion =
    sidebarRendered &&
    feedName === MainFeedPage.Popular &&
    !isLoading &&
    alerts?.filter &&
    !user?.id &&
    Object.values(ScrollOnboardingVersion).includes(scrollOnboardingVersion);
  const shouldScrollBlock =
    showScrollOnboardingVersion &&
    [ScrollOnboardingVersion.V1, ScrollOnboardingVersion.V2].includes(
      scrollOnboardingVersion,
    );

  const infiniteScrollRef = useFeedInfiniteScroll({
    fetchPage,
    canFetchMore: canFetchMore && !shouldScrollBlock,
  });

  const onInitializeOnboardingClick = () => {
    trackEvent({
      event_name: AnalyticsEvent.ClickScrollBlock,
      target_id: scrollOnboardingVersion,
    });
    onInitializeOnboarding(undefined, true);
  };

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
      skipPostUpdate: true,
    });
    onPostModalOpen(index);
  };

  const {
    onMenuClick,
    onShareMenuClick,
    postMenuIndex,
    postMenuLocation,
    setPostMenuIndex,
  } = useFeedContextMenu();
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

  // TODO WT-1109-personal-digest proper condition, from API
  const showPersonalDigest = feedName === MainFeedPage.Popular;

  // TODO WT-1109-personal-digest move to proper component
  const DigestPostItem = ({ item }: { item: Post; index: number }) => {
    if (item.id === 'intro') {
      return (
        <article className="flex flex-col justify-center items-center p-5 w-full h-full text-center">
          <p className="mb-4 typo-headline">
            Your {'{timeframe}'} digest is ready!
          </p>
          <p className="mb-10 typo-body">
            Here are {'{x}'} recommended articles we think you&apos;ll
            appreciate!
          </p>
          <div className="flex flex-col w-full">
            <Button className="mb-4 w-full btn-primary">Start Reading</Button>
            <Button className="font-normal !underline !typo-body">
              Hide for now
            </Button>
          </div>
        </article>
      );
    }

    return <ArticlePostCard post={item} />;
  };

  const isScrollableBreakpoint = useMedia(
    ['(min-width: 600px) and (max-width: 1024px)'],
    [true],
    false,
  );

  return (
    <div
      className={classNames(
        'flex flex-col laptopL:mx-auto w-full',
        styles.container,
        className,
      )}
      style={style}
    >
      {header}
      <div
        className={classNames(
          'relative mx-auto w-full',
          styles.feed,
          !useList && styles.cards,
        )}
        style={cardContainerStye}
        aria-live={subject === ToastSubject.Feed ? 'assertive' : 'off'}
        data-testid="posts-feed"
      >
        {showPersonalDigest && (
          <Slider
            className="mb-12"
            // TODO WT-1109-personal-digest items from API
            items={[
              {
                id: 'intro',
              },
              ...items
                .slice(2, 8)
                .map((item) => item.type === 'post' && item.post)
                .filter(Boolean),
            ]}
            Item={DigestPostItem}
            canSlideLeft={(index, sliderItems) => {
              const visibleItems = numCards;
              const swipeableItems =
                visibleItems > sliderItems.length
                  ? 0
                  : sliderItems.length - visibleItems;

              return index < swipeableItems;
            }}
            swipeEnabled={isScrollableBreakpoint}
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
              onUpvote={onUpvote}
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
        </div>
        {showScrollOnboardingVersion && (
          <ScrollFeedFiltersOnboarding
            version={scrollOnboardingVersion}
            onInitializeOnboarding={onInitializeOnboardingClick}
          />
        )}
        <InfiniteScrollScreenOffset ref={infiniteScrollRef} />
        <PostOptionsMenu
          {...commonMenuItems}
          feedName={feedName}
          postIndex={postMenuIndex}
          onHidden={() => setPostMenuIndex(null)}
          onRemovePost={onRemovePost}
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
            isFetchingNextPage={isFetchingNextPage}
            postPosition={postPosition}
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
      </div>
    </div>
  );
}
