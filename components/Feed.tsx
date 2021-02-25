import React, {
  DependencyList,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import styled from '@emotion/styled';
import useFeed, { FeedItem, PostItem } from '../hooks/useFeed';
import { PostCard } from './cards/PostCard';
import { AdCard } from './cards/AdCard';
import { PlaceholderCard } from './cards/PlaceholderCard';
import sizeN from '../macros/sizeN.macro';
import {
  Ad,
  ADD_BOOKMARKS_MUTATION,
  CANCEL_UPVOTE_MUTATION,
  Post,
  REMOVE_BOOKMARK_MUTATION,
  UPVOTE_MUTATION,
} from '../graphql/posts';
import AuthContext from '../contexts/AuthContext';
import { useMutation } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '../lib/config';
import { LoginModalMode } from './modals/LoginModal';
import { useInView } from 'react-intersection-observer';
import { mobileL, tablet } from '../styles/media';
import { multilineTextOverflow } from '../styles/helpers';
import { feedBreakpoints, feedSettings } from './layouts/FeedLayout';
import FeedContext from '../contexts/FeedContext';
import useIncrementReadingRank from '../hooks/useIncrementReadingRank';
import { trackEvent } from '../lib/analytics';

export type FeedProps<T> = {
  query?: string;
  variables?: T;
  className?: string;
  onEmptyFeed?: () => unknown;
  dep?: DependencyList;
  emptyScreen?: ReactNode;
};

const cardMaxWidth = sizeN(80);

const Container = styled.div`
  position: relative;
  display: grid;
  grid-gap: ${sizeN(8)};
  margin-left: auto;
  margin-right: auto;
  grid-template-columns: 100%;

  ${mobileL} {
    --num-cards: 1;
    grid-template-columns: repeat(var(--num-cards), 1fr);

    & > * {
      max-width: ${cardMaxWidth};
    }
  }

  ${tablet} {
    grid-auto-rows: ${sizeN(91)};
  }

  ${feedBreakpoints
    .map(
      (query, i) => `
  ${query} {
    --num-cards: ${feedSettings[i].numCards};
  }`,
    )
    .join('\n')}
`;

const Stretcher = styled.div`
  visibility: hidden;
  -webkit-line-clamp: 1;
  ${multilineTextOverflow}
`;

const InfiniteScrollTrigger = styled.div`
  position: absolute;
  bottom: 100vh;
  left: 0;
  height: 1px;
  width: 1px;
  opacity: 0;
  pointer-events: none;
`;

const onAdImpression = (ad: Ad) =>
  trackEvent({
    category: 'Ad',
    action: 'Impression',
    label: ad.source,
    nonInteraction: true,
  });

const onAdClick = (ad: Ad) =>
  trackEvent({
    category: 'Ad',
    action: 'Click',
    label: ad.source,
  });

export default function Feed<T>({
  query,
  variables,
  className,
  onEmptyFeed,
  dep,
  emptyScreen,
}: FeedProps<T>): ReactElement {
  const currentSettings = useContext(FeedContext);
  const {
    items,
    updatePost,
    isLoading,
    fetchPage,
    canFetchMore,
    emptyFeed,
  } = useFeed(
    currentSettings.pageSize,
    currentSettings.adSpot,
    currentSettings.numCards,
    query,
    variables,
    dep,
  );
  const { user, showLogin } = useContext(AuthContext);
  // const { nativeShareSupport } = useContext(ProgressiveEnhancementContext);
  const nativeShareSupport = false;
  const [disableFetching, setDisableFetching] = useState(false);
  const { incrementReadingRank } = useIncrementReadingRank();

  useEffect(() => {
    if (emptyFeed) {
      onEmptyFeed?.();
    }
  }, [emptyFeed]);

  const { mutateAsync: upvotePost } = useMutation<
    unknown,
    unknown,
    { id: string; index: number },
    () => void
  >(
    ({ id }) =>
      request(`${apiUrl}/graphql`, UPVOTE_MUTATION, {
        id,
      }),
    {
      onMutate: async ({ index }) => {
        const item = items[index] as PostItem;
        const { post } = item;
        updatePost(index, {
          ...post,
          upvoted: true,
          numUpvotes: post.numUpvotes + 1,
        });
        return () => updatePost(index, post);
      },
      onError: (err, _, rollback) => rollback(),
    },
  );

  const { mutateAsync: cancelPostUpvote } = useMutation<
    unknown,
    unknown,
    { id: string; index: number },
    () => void
  >(
    ({ id }) =>
      request(`${apiUrl}/graphql`, CANCEL_UPVOTE_MUTATION, {
        id,
      }),
    {
      onMutate: async ({ index }) => {
        const item = items[index] as PostItem;
        const { post } = item;
        updatePost(index, {
          ...post,
          upvoted: false,
          numUpvotes: post.numUpvotes - 1,
        });
        return () => updatePost(index, post);
      },
      onError: (err, _, rollback) => rollback(),
    },
  );

  const { mutateAsync: bookmark } = useMutation<
    unknown,
    unknown,
    { id: string; index: number },
    () => void
  >(
    ({ id }) =>
      request(`${apiUrl}/graphql`, ADD_BOOKMARKS_MUTATION, {
        data: { postIds: [id] },
      }),
    {
      onMutate: async ({ index }) => {
        const item = items[index] as PostItem;
        const { post } = item;
        updatePost(index, {
          ...post,
          bookmarked: true,
        });
        return () => updatePost(index, post);
      },
      onError: (err, _, rollback) => rollback(),
    },
  );

  const { mutateAsync: removeBookmark } = useMutation<
    unknown,
    unknown,
    { id: string; index: number },
    () => void
  >(
    ({ id }) =>
      request(`${apiUrl}/graphql`, REMOVE_BOOKMARK_MUTATION, {
        id,
      }),
    {
      onMutate: async ({ index }) => {
        const item = items[index] as PostItem;
        const { post } = item;
        updatePost(index, {
          ...post,
          bookmarked: false,
        });
        return () => updatePost(index, post);
      },
      onError: (err, _, rollback) => rollback(),
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
      fetchPage().then(() => {
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
      await bookmark({ id: post.id, index });
    } else {
      await removeBookmark({ id: post.id, index });
    }
  };

  const onPostClick = (post: Post, index: number): void => {
    trackEvent({
      category: 'Post',
      action: 'Click',
      label: post.source.name,
    });
    if (!post.read) {
      incrementReadingRank();
    }
    updatePost(index, { ...post, read: true });
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

  const itemToComponent = (item: FeedItem, index: number): ReactElement => {
    switch (item.type) {
      case 'post':
        return (
          <PostCard
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
          />
        );
      case 'ad':
        return (
          <AdCard
            ad={item.ad}
            key={`ad-${index}`}
            data-testid="adItem"
            onImpression={onAdImpression}
            onLinkClick={onAdClick}
          />
        );
      default:
        return <PlaceholderCard key={`placeholder-${index}`} />;
    }
  };

  const hasNonPlaceholderCard =
    items.findIndex((item) => item.type !== 'placeholder') >= 0;

  return emptyScreen && emptyFeed ? (
    <>{emptyScreen}</>
  ) : (
    <Container className={className}>
      {items.map(itemToComponent)}
      {!hasNonPlaceholderCard && (
        <Stretcher>{Array(100).fill('a').join('')}</Stretcher>
      )}
      <InfiniteScrollTrigger ref={infiniteScrollRef} />
    </Container>
  );
}
