import React, {
  CSSProperties,
  DependencyList,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useMutation } from 'react-query';
import request from 'graphql-request';
import { useInView } from 'react-intersection-observer';
import dynamic from 'next/dynamic';
import { requestIdleCallback } from 'next/dist/client/request-idle-callback';
import classNames from 'classnames';
import useFeed, { FeedItem, PostItem } from '../hooks/useFeed';
import { Ad, Post } from '../graphql/posts';
import AuthContext from '../contexts/AuthContext';
import { apiUrl } from '../lib/config';
import { LoginModalMode } from '../types/LoginModalMode';
import FeedContext from '../contexts/FeedContext';
import useIncrementReadingRank from '../hooks/useIncrementReadingRank';
import { logReadArticle, trackEvent } from '../lib/analytics';
import { COMMENT_ON_POST_MUTATION, CommentOnData } from '../graphql/comments';
import styles from './Feed.module.css';
import SettingsContext from '../contexts/SettingsContext';
import useUpvotePost from '../hooks/useUpvotePost';
import useBookmarkPost from '../hooks/useBookmarkPost';
import OnboardingContext, {
  EngagementAction,
} from '../contexts/OnboardingContext';
import { Spaciness } from '../graphql/settings';
import useReportPostMenu from '../hooks/useReportPostMenu';
import { PostCard } from './cards/PostCard';
import { AdCard } from './cards/AdCard';
import { PlaceholderCard } from './cards/PlaceholderCard';
import { PostList } from './cards/PostList';
import { AdList } from './cards/AdList';
import { PlaceholderList } from './cards/PlaceholderList';
import ScrollToTopButton from './ScrollToTopButton';
import useAdImpressions from '../hooks/useAdImpressions';
import { useVirtualWindow } from '../hooks/useVirtualWindow';
import rem from '../../macros/rem.macro';

const CommentPopup = dynamic(() => import('./cards/CommentPopup'));
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

const onAdClick = (ad: Ad) =>
  trackEvent({
    category: 'Ad',
    action: 'Click',
    label: ad.source,
  });

const getFeedGap = (useList: boolean, spaciness: Spaciness): number => {
  if (useList) {
    if (spaciness === 'cozy') {
      return 20;
    }
    if (spaciness === 'roomy') {
      return 12;
    }
    return 8;
  }
  if (spaciness === 'cozy') {
    return 56;
  }
  if (spaciness === 'roomy') {
    return 48;
  }
  return 32;
};

const getStyle = (useList: boolean, spaciness: Spaciness): CSSProperties => {
  if (useList && spaciness !== 'eco') {
    return spaciness === 'cozy'
      ? { maxWidth: '48.75rem' }
      : { maxWidth: '63.75rem' };
  }
  return {};
};

const cardHeightPx = 364;
const listHeightPx = 78;

export default function Feed<T>({
                                  feedQueryKey,
                                  query,
                                  variables,
                                  className,
                                  onEmptyFeed,
                                  emptyScreen,
                                }: FeedProps<T>): ReactElement {
  const currentSettings = useContext(FeedContext);
  const { user, showLogin } = useContext(AuthContext);
  const { trackEngagement } = useContext(OnboardingContext);
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
  const nativeShareSupport = false;
  const { incrementReadingRank } = useIncrementReadingRank();
  const [showCommentPopupId, setShowCommentPopupId] = useState<string>();
  const [postMenuIndex, setPostMenuIndex] = useState<number>();
  const [postNotificationIndex, setPostNotificationIndex] = useState<number>();
  const { showReportMenu } = useReportPostMenu();
  const { onAdImpression } = useAdImpressions();

  useEffect(() => {
    if (emptyFeed) {
      onEmptyFeed?.();
    }
  }, [emptyFeed]);

  const { upvotePost, cancelPostUpvote } = useUpvotePost<{
    id: string;
    index: number;
  }>({
    onUpvotePostMutate: async ({ index }) => {
      const item = items[index] as PostItem;
      const { post } = item;
      updatePost(item.page, item.index, {
        ...post,
        upvoted: true,
        numUpvotes: post.numUpvotes + 1,
      });
      return () => updatePost(item.page, item.index, post);
    },
    onCancelPostUpvoteMutate: async ({ index }) => {
      const item = items[index] as PostItem;
      const { post } = item;
      updatePost(item.page, item.index, {
        ...post,
        upvoted: false,
        numUpvotes: post.numUpvotes - 1,
      });
      return () => updatePost(item.page, item.index, post);
    },
  });

  const { bookmark, removeBookmark } = useBookmarkPost<{
    id: string;
    index: number;
  }>({
    onBookmarkMutate: async ({ index }) => {
      const item = items[index] as PostItem;
      const { post } = item;
      updatePost(item.page, item.index, {
        ...post,
        bookmarked: true,
      });
      return () => updatePost(item.page, item.index, post);
    },
    onRemoveBookmarkMutate: async ({ index }) => {
      const item = items[index] as PostItem;
      const { post } = item;
      updatePost(item.page, item.index, {
        ...post,
        bookmarked: false,
      });
      return () => updatePost(item.page, item.index, post);
    },
  });

  const { mutateAsync: comment, isLoading: isSendingComment } = useMutation<
    CommentOnData,
    unknown,
    {
      id: string;
      content: string;
    }
  >(
    (requestVariables) =>
      request(`${apiUrl}/graphql`, COMMENT_ON_POST_MUTATION, requestVariables),
    {
      onSuccess: async (data) => {
        trackEvent({
          category: 'Comment Popup',
          action: 'Comment',
        });
        const link = `${data.comment.permalink}?new=true`;
        setShowCommentPopupId(null);
        window.open(link, '_blank');
      },
    },
  );

  const { ref: infiniteScrollRef, inView } = useInView({
    rootMargin: '20px',
    threshold: 1,
  });

  useEffect(() => {
    if (inView && canFetchMore) {
      fetchPage().then(async () => {
        await trackEngagement(EngagementAction.Scroll);
      });
    }
  }, [inView, canFetchMore]);

  const onUpvote = async (
    post: Post,
    index: number,
    upvoted: boolean,
  ): Promise<void> => {
    if (!user) {
      showLogin('upvote', LoginModalMode.ContentQuality);
      return;
    }
    trackEvent({
      category: 'Post',
      action: 'Upvote',
      label: upvoted ? 'Add' : 'Remove',
    });
    if (upvoted) {
      await upvotePost({ id: post.id, index });
      requestIdleCallback(() => {
        setShowCommentPopupId(post.id);
        trackEvent({
          category: 'Comment Popup',
          action: 'Impression',
        });
      });
    } else {
      await cancelPostUpvote({ id: post.id, index });
    }
  };

  const onBookmark = async (
    post: Post,
    index: number,
    bookmarked: boolean,
  ): Promise<void> => {
    if (!user) {
      showLogin('bookmark');
      return;
    }
    trackEvent({
      category: 'Post',
      action: 'Bookmark',
      label: bookmarked ? 'Add' : 'Remove',
    });
    if (bookmarked) {
      await trackEngagement(EngagementAction.Bookmark);
      await bookmark({ id: post.id, index });
    } else {
      await removeBookmark({ id: post.id, index });
    }
  };

  const onPostClick = async (post: Post, index: number): Promise<void> => {
    trackEvent({
      category: 'Post',
      action: 'Click',
      label: 'Feed',
    });
    await logReadArticle('feed');
    if (!post.read) {
      incrementReadingRank();
    }
    const item = items[index] as PostItem;
    updatePost(item.page, item.index, { ...post, read: true });
    await trackEngagement(EngagementAction.Post_Click);
  };

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

  const onReportPost = async (): Promise<void> => {
    setPostNotificationIndex(postMenuIndex);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const item = items[postMenuIndex] as PostItem;
    setPostNotificationIndex(null);
    removePost(item.page, item.index);
  };

  const onHidePost = async (): Promise<void> => {
    const item = items[postMenuIndex] as PostItem;
    removePost(item.page, item.index);
  };

  const onMenuClick = (e: React.MouseEvent, index: number) => {
    if (postMenuIndex === index) {
      setPostMenuIndex(null);
      return;
    }
    trackEvent({ category: 'Post', action: 'Menu' });
    setPostMenuIndex(index);
    const { right, bottom } = e.currentTarget.getBoundingClientRect();
    showReportMenu(e, {
      position: { x: right - 147, y: bottom + 4 },
    });
  };

  const useList = insaneMode && numCards > 1;
  const PostTag = useList ? PostList : PostCard;
  const AdTag = useList ? AdList : AdCard;
  const PlaceholderTag = useList ? PlaceholderList : PlaceholderCard;

  const itemToComponent = (index: number): ReactElement => {
    const item: FeedItem = items[index];
    switch (item.type) {
      case 'post':
        return (
          <PostTag
            post={item.post}
            key={item.post.id}
            data-testid="postItem"
            onUpvoteClick={(post, upvoted) => onUpvote(post, index, upvoted)}
            onLinkClick={(post) => onPostClick(post, index)}
            onBookmarkClick={(post, bookmarked) =>
              onBookmark(post, index, bookmarked)
            }
            showShare={nativeShareSupport}
            onShare={onShare}
            openNewTab={openNewTab}
            enableMenu={!!user}
            onMenuClick={(event) => onMenuClick(event, index)}
            menuOpened={postMenuIndex === index}
            notification={
              postNotificationIndex === index && 'Thanks for reporting! 🚨'
            }
            showImage={!insaneMode}
          >
            {showCommentPopupId === item.post.id && (
              <CommentPopup
                onClose={() => setShowCommentPopupId(null)}
                onSubmit={(content) => comment({ id: item.post.id, content })}
                loading={isSendingComment}
                compactCard={!useList && insaneMode}
                listMode={useList}
              />
            )}
          </PostTag>
        );
      case 'ad':
        return (
          <AdTag
            ad={item.ad}
            key={`ad-${index}`}
            data-testid="adItem"
            onImpression={onAdImpression}
            onLinkClick={onAdClick}
            showImage={!insaneMode}
          />
        );
      default:
        return (
          <PlaceholderTag
            key={`placeholder-${index}`}
            showImage={!insaneMode}
          />
        );
    }
  };

  if (!loadedSettings) {
    return <></>;
  }

  const feedGapPx = getFeedGap(useList, spaciness);
  const parentRef = useRef<HTMLDivElement>();
  const virtualizedNumCards = useList ? 1 : numCards;
  const virtualizer = useVirtualWindow({
    size: Math.ceil(items.length / virtualizedNumCards),
    overscan: 1,
    parentRef,
    estimateSize: useCallback(
      () => (useList ? listHeightPx : cardHeightPx) + feedGapPx,
      [],
    ),
  });

  const style = {
    height: `${virtualizer.totalSize}px`,
    '--num-cards': numCards,
    '--feed-gap': `${feedGapPx / 16}rem`,
    '--card-height': rem(cardHeightPx),
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
      {virtualizer.virtualItems.map((virtualItem) => (
        <div
          key={virtualItem.index}
          ref={virtualItem.measureRef}
          className={`absolute grid top-0 left-0 w-full last:pb-0 ${styles.feedRow}`}
          style={{
            transform: `translateY(${virtualItem.start}px)`,
          }}
        >
          {[
            ...new Array(
              Math.min(
                virtualizedNumCards,
                items.length - virtualItem.index * virtualizedNumCards,
              ),
            ),
          ].map((_, i) =>
            itemToComponent(virtualItem.index * virtualizedNumCards + i),
          )}
        </div>
      ))}
      <div
        ref={infiniteScrollRef}
        className={`absolute left-0 h-px w-px opacity-0 pointer-events-none ${styles.trigger}`}
      />
      <ReportPostMenu
        postId={(items[postMenuIndex] as PostItem)?.post.id}
        onHidden={() => setPostMenuIndex(null)}
        onReportPost={onReportPost}
        onHidePost={onHidePost}
      />
    </div>
  );
}
