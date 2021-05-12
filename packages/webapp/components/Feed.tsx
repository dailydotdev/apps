import React, {
  CSSProperties,
  DependencyList,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import useFeed, {
  FeedItem,
  PostItem,
} from '@dailydotdev/shared/src/hooks/useFeed';
import { Ad, Post } from '../graphql/posts';
import AuthContext from '../../shared/src/contexts/AuthContext';
import { useMutation } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import { LoginModalMode } from '@dailydotdev/shared/src/types/LoginModalMode';
import { useInView } from 'react-intersection-observer';
import FeedContext from '../../shared/src/contexts/FeedContext';
import useIncrementReadingRank from '@dailydotdev/shared/src/hooks/useIncrementReadingRank';
import {
  logReadArticle,
  logRevenue,
  trackEvent,
} from '@dailydotdev/shared/src/lib/analytics';
import { COMMENT_ON_POST_MUTATION, CommentOnData } from '../graphql/comments';
import dynamic from 'next/dynamic';
import { requestIdleCallback } from 'next/dist/client/request-idle-callback';
import styles from '../styles/feed.module.css';
import classNames from 'classnames';
import SettingsContext from '../../shared/src/contexts/SettingsContext';
import useUpvotePost from '@dailydotdev/shared/src/hooks/useUpvotePost';
import useBookmarkPost from '@dailydotdev/shared/src/hooks/useBookmarkPost';
import OnboardingContext, {
  EngagementAction,
} from '../../shared/src/contexts/OnboardingContext';
import { Spaciness } from '../graphql/settings';
import useReportPostMenu from '@dailydotdev/shared/src/hooks/useReportPostMenu';
import { PostCard } from '@dailydotdev/shared/src/components/cards/PostCard';
import { AdCard } from '@dailydotdev/shared/src/components/cards/AdCard';
import { PlaceholderCard } from '@dailydotdev/shared/src/components/cards/PlaceholderCard';
import { PostList } from '@dailydotdev/shared/src/components/cards/PostList';
import { AdList } from '@dailydotdev/shared/src/components/cards/AdList';
import { PlaceholderList } from '@dailydotdev/shared/src/components/cards/PlaceholderList';

const CommentPopup = dynamic(() => import('./CommentPopup'));
const ReportPostMenu = dynamic(
  () => import(/* webpackChunkName: "reportPostMenu" */ './ReportPostMenu'),
);

export type FeedProps<T> = {
  query?: string;
  variables?: T;
  className?: string;
  onEmptyFeed?: () => unknown;
  dep?: DependencyList;
  emptyScreen?: ReactNode;
};

const onAdImpression = async (ad: Ad): Promise<void> => {
  trackEvent({
    category: 'Ad',
    action: 'Impression',
    label: ad.source,
    nonInteraction: true,
  });
  if (ad.providerId?.length) {
    await logRevenue(ad.providerId);
  }
};

const onAdClick = (ad: Ad) =>
  trackEvent({
    category: 'Ad',
    action: 'Click',
    label: ad.source,
  });

const getClassNames = (useList: boolean, spaciness: Spaciness): string => {
  if (useList) {
    return spaciness === 'cozy'
      ? 'gap-5'
      : spaciness === 'roomy'
      ? 'gap-3'
      : 'gap-2';
  }
  return spaciness === 'cozy'
    ? 'gap-14'
    : spaciness === 'roomy'
    ? 'gap-12'
    : 'gap-8';
};

const getStyle = (useList: boolean, spaciness: Spaciness): CSSProperties => {
  if (useList && spaciness !== 'eco') {
    return spaciness === 'cozy'
      ? { maxWidth: '48.75rem' }
      : { maxWidth: '63.75rem' };
  }
  return {};
};

export default function Feed<T>({
  query,
  variables,
  className,
  onEmptyFeed,
  dep,
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
  const {
    items,
    updatePost,
    removeItem,
    isLoading,
    fetchPage,
    canFetchMore,
    emptyFeed,
  } = useFeed(
    currentSettings.pageSize,
    currentSettings.adSpot,
    currentSettings.numCards,
    showOnlyUnreadPosts,
    query,
    variables,
    dep,
  );
  // const { nativeShareSupport } = useContext(ProgressiveEnhancementContext);
  const nativeShareSupport = false;
  const [disableFetching, setDisableFetching] = useState(false);
  const { incrementReadingRank } = useIncrementReadingRank();
  const [showCommentPopupId, setShowCommentPopupId] = useState<string>();
  const [postMenuIndex, setPostMenuIndex] = useState<number>();
  const [postNotificationIndex, setPostNotificationIndex] = useState<number>();
  const { showReportMenu } = useReportPostMenu();

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
      updatePost(index, {
        ...post,
        upvoted: true,
        numUpvotes: post.numUpvotes + 1,
      });
      return () => updatePost(index, post);
    },
    onCancelPostUpvoteMutate: async ({ index }) => {
      const item = items[index] as PostItem;
      const { post } = item;
      updatePost(index, {
        ...post,
        upvoted: false,
        numUpvotes: post.numUpvotes - 1,
      });
      return () => updatePost(index, post);
    },
  });

  const { bookmark, removeBookmark } = useBookmarkPost<{
    id: string;
    index: number;
  }>({
    onBookmarkMutate: async ({ index }) => {
      const item = items[index] as PostItem;
      const { post } = item;
      updatePost(index, {
        ...post,
        bookmarked: true,
      });
      return () => updatePost(index, post);
    },
    onRemoveBookmarkMutate: async ({ index }) => {
      const item = items[index] as PostItem;
      const { post } = item;
      updatePost(index, {
        ...post,
        bookmarked: false,
      });
      return () => updatePost(index, post);
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
    (variables) =>
      request(`${apiUrl}/graphql`, COMMENT_ON_POST_MUTATION, variables),
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
    if (inView && !isLoading && canFetchMore && !disableFetching) {
      // Disable fetching for a short time to prevent multi-fetching
      setDisableFetching(true);
      fetchPage().then(async () => {
        await trackEngagement(EngagementAction.Scroll);
        setTimeout(() => setDisableFetching(false), 100);
      });
    }
  }, [inView, isLoading, canFetchMore, disableFetching]);

  const onUpvote = async (
    post: Post,
    index: number,
    upvoted: boolean,
  ): Promise<void> => {
    if (!user) {
      showLogin(LoginModalMode.ContentQuality);
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
      showLogin();
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
    updatePost(index, { ...post, read: true });
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
    removeItem(postMenuIndex);
    setPostNotificationIndex(null);
  };

  const onHidePost = async (): Promise<void> => {
    removeItem(postMenuIndex);
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

  const useList = insaneMode && currentSettings.numCards > 1;
  const PostTag = useList ? PostList : PostCard;
  const AdTag = useList ? AdList : AdCard;
  const PlaceholderTag = useList ? PlaceholderList : PlaceholderCard;

  const itemToComponent = (item: FeedItem, index: number): ReactElement => {
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

  const hasNoPlaceholderCard =
    items.findIndex((item) => item.type !== 'placeholder') >= 0;

  const settingsClasses = getClassNames(useList, spaciness);
  const settingsStyle = getStyle(useList, spaciness);
  return emptyScreen && emptyFeed ? (
    <>{emptyScreen}</>
  ) : (
    <div
      className={classNames(
        className,
        'relative grid mx-auto',
        settingsClasses,
        styles.feed,
        insaneMode ? 'w-full' : styles.grid,
        spaciness,
      )}
      style={settingsStyle}
    >
      {items.map(itemToComponent)}
      {!hasNoPlaceholderCard && (
        <div className={`invisible multi-truncate ${styles.stretcher}`}>
          {Array(100).fill('a').join('')}
        </div>
      )}
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
