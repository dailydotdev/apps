import React, { ReactElement, useContext, useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import useFeed, { FeedItem, PostItem } from '../lib/useFeed';
import { PostCard } from './cards/PostCard';
import { AdCard } from './cards/AdCard';
import { PlaceholderCard } from './cards/PlaceholderCard';
import { size8, sizeN } from '../styles/sizes';
import {
  Ad,
  CANCEL_UPVOTE_MUTATION,
  Post,
  UPVOTE_MUTATION,
} from '../graphql/posts';
import ReactGA from 'react-ga';
import AuthContext from './AuthContext';
import { useMutation } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '../lib/config';
import { LoginModalMode } from './modals/LoginModal';
import { useInView } from 'react-intersection-observer';
import {
  desktop,
  desktopL,
  laptop,
  laptopL,
  laptopXL,
  mobileL,
  tablet,
} from '../styles/media';
import useMedia from '../lib/useMedia';
import { multilineTextOverflow } from '../styles/helpers';

export type FeedProps<T> = { query?: string; variables?: T };

type FeedSettings = { pageSize: number; adSpot: number; numCards: number };
const defaultSettings: FeedSettings = { pageSize: 7, adSpot: 2, numCards: 1 };
const feedBreakpoints = [tablet, laptop, laptopL, laptopXL, desktop, desktopL];
const feedSettings: FeedSettings[] = [
  { pageSize: 9, adSpot: 0, numCards: 2 },
  { pageSize: 13, adSpot: 0, numCards: 3 },
  { pageSize: 17, adSpot: 0, numCards: 4 },
  { pageSize: 21, adSpot: 0, numCards: 5 },
  { pageSize: 25, adSpot: 0, numCards: 6 },
  { pageSize: 29, adSpot: 0, numCards: 7 },
];

const cardMaxWidth = sizeN(80);

const Container = styled.div`
  position: relative;
  display: grid;
  grid-gap: ${size8};
  margin-left: auto;
  margin-right: auto;
  grid-template-columns: minmax(272px, 100%);

  ${mobileL} {
    --num-cards: 1;
    grid-template-columns: repeat(var(--num-cards), minmax(272px, 1fr));

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
  ReactGA.event({
    category: 'Ad',
    action: 'Impression',
    label: ad.source,
    nonInteraction: true,
  });

const onAdClick = (ad: Ad) =>
  ReactGA.event({
    category: 'Ad',
    action: 'Click',
    label: ad.source,
  });

export default function Feed<T>({
  query,
  variables,
}: FeedProps<T>): ReactElement {
  const currentSettings = useMedia(
    feedBreakpoints.map((media) => media.replace('@media ', '')).reverse(),
    feedSettings.reverse(),
    defaultSettings,
  );
  const { items, updatePost, isLoading, fetchPage, canFetchMore } = useFeed(
    currentSettings.pageSize,
    currentSettings.adSpot,
    currentSettings.numCards,
    query,
    variables,
  );
  const { user, showLogin } = useContext(AuthContext);
  const [disableFetching, setDisableFetching] = useState(false);

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
    ReactGA.event({
      category: 'Post',
      action: upvoted ? 'Add' : 'Remove',
    });
    if (upvoted) {
      await upvotePost({ id: post.id, index });
    } else {
      await cancelPostUpvote({ id: post.id, index });
    }
  };

  const onPostClick = (post: Post, index: number): void => {
    ReactGA.event({
      category: 'Post',
      action: 'Click',
      label: post.source.name,
    });
    updatePost(index, { ...post, read: true });
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

  return (
    <Container>
      {items.map(itemToComponent)}
      {!hasNonPlaceholderCard && (
        <Stretcher>{Array(100).fill('a').join('')}</Stretcher>
      )}
      <InfiniteScrollTrigger ref={infiniteScrollRef} />
    </Container>
  );
}
