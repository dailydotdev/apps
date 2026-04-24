import type { ReactElement } from 'react';
import React, { useCallback, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { gqlClient } from '../../../graphql/common';
import { ANONYMOUS_FEED_QUERY } from '../../../graphql/feed';
import type { FeedData } from '../../../graphql/feed';
import type { Ad, Post } from '../../../graphql/posts';
import AuthContext from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { cloudinaryPostImageCoverPlaceholder } from '../../../lib/image';
import { useFetchAd } from '../../monetization/useFetchAd';
import { AdPixel } from '../../../components/cards/ad/common/AdPixel';

// Focus mode without the feed is not daily.dev. The core product value —
// staying up to date — has to survive the mode switch or we're just Momentum
// with our logo on it. So the picker shows a tiny "Trending right now" strip
// to remind users what they're putting on hold, and the active state pairs
// the timer with a single long-form "deep read" plus a "next up" queue that
// includes a sponsored card so ad revenue still flows.

const FEED_LIMIT = 8;
const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
const DEEP_READ_MIN = 7; // minutes

type FeedPost = Pick<
  Post,
  | 'id'
  | 'title'
  | 'permalink'
  | 'commentsPermalink'
  | 'readTime'
  | 'image'
  | 'summary'
  | 'source'
>;

const useFocusPosts = () => {
  const { isLoggedIn, user } = useContext(AuthContext);
  return useQuery<FeedData>({
    queryKey: ['focus_feed', user?.id ?? 'anon'],
    queryFn: () =>
      gqlClient.request<FeedData>(ANONYMOUS_FEED_QUERY, {
        first: FEED_LIMIT,
        loggedIn: isLoggedIn,
      }),
    staleTime: FOUR_HOURS_MS,
    gcTime: FOUR_HOURS_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

const useFocusAd = () => {
  const { user } = useContext(AuthContext);
  const { fetchAd } = useFetchAd();
  return useQuery<Ad | null>({
    queryKey: ['focus_feed_ad', user?.id ?? 'anon'],
    queryFn: () => fetchAd({ active: true }),
    staleTime: FOUR_HOURS_MS,
    gcTime: FOUR_HOURS_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

const extractPosts = (data?: FeedData): FeedPost[] =>
  data?.page?.edges
    ?.map((edge) => edge.node)
    .filter((post): post is Post => !!post?.id) ?? [];

const pickDeepRead = (posts: FeedPost[]): FeedPost | undefined => {
  const longForm = posts.filter(
    (post) => (post.readTime ?? 0) >= DEEP_READ_MIN,
  );
  if (longForm.length > 0) {
    // Longest first — deepest read of the day.
    return [...longForm].sort(
      (a, b) => (b.readTime ?? 0) - (a.readTime ?? 0),
    )[0];
  }
  return posts[0];
};

interface MiniCardProps {
  post: FeedPost;
  onClick: () => void;
}

const MiniCard = ({ post, onClick }: MiniCardProps): ReactElement => (
  <a
    href={post.commentsPermalink}
    target="_blank"
    rel="noopener noreferrer"
    onClick={onClick}
    className="group flex gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3 transition-colors hover:border-border-subtlest-secondary hover:bg-surface-secondary"
  >
    <div className="size-16 flex-shrink-0 overflow-hidden rounded-8 bg-background-default">
      <img
        src={post.image || cloudinaryPostImageCoverPlaceholder}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover"
      />
    </div>
    <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
      <Typography
        type={TypographyType.Subhead}
        bold
        className="line-clamp-2 text-balance transition-colors group-hover:text-text-link"
      >
        {post.title}
      </Typography>
      <div className="flex items-center gap-2">
        {post.source?.name ? (
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="truncate"
          >
            {post.source.name}
          </Typography>
        ) : null}
        {post.readTime ? (
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Quaternary}
          >
            {post.readTime}m
          </Typography>
        ) : null}
      </div>
    </div>
  </a>
);

const MiniAdCard = ({
  ad,
  onClick,
}: {
  ad: Ad;
  onClick: () => void;
}): ReactElement => (
  <a
    href={ad.link}
    target="_blank"
    rel="noopener noreferrer sponsored"
    onClick={onClick}
    className="group flex gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3 transition-colors hover:border-border-subtlest-secondary hover:bg-surface-secondary"
  >
    <div className="size-16 flex-shrink-0 overflow-hidden rounded-8 bg-background-default">
      <img
        src={ad.image || cloudinaryPostImageCoverPlaceholder}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover"
      />
    </div>
    <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
      <Typography
        type={TypographyType.Subhead}
        bold
        className="line-clamp-2 text-balance transition-colors group-hover:text-text-link"
      >
        {ad.description}
      </Typography>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
        className="uppercase tracking-wider"
      >
        Sponsored
      </Typography>
    </div>
    <AdPixel pixel={ad.pixel} />
  </a>
);

interface FocusFeedTrendingProps {
  className?: string;
}

// Shown in the pre-session picker. Three small post cards remind the user
// that Focus sits inside daily.dev, not outside it.
export const FocusFeedTrending = ({
  className,
}: FocusFeedTrendingProps): ReactElement | null => {
  const { data, isLoading } = useFocusPosts();
  const { logEvent } = useLogContext();
  const posts = extractPosts(data).slice(0, 3);

  const onClick = useCallback(
    (postId: string, position: number) => {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'focus_trending_click',
        extra: JSON.stringify({ post_id: postId, position }),
      });
    },
    [logEvent],
  );

  if (!isLoading && posts.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Trending while you focus"
      className={classNames('flex w-full max-w-xl flex-col gap-3', className)}
    >
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="uppercase tracking-wider"
      >
        Trending right now
      </Typography>
      <div className="flex flex-col gap-2">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="h-20 w-full animate-pulse rounded-12 bg-surface-float"
              />
            ))
          : posts.map((post, index) => (
              <MiniCard
                key={post.id}
                post={post}
                onClick={() => onClick(post.id, index)}
              />
            ))}
      </div>
    </section>
  );
};

interface FocusFeedActiveProps {
  className?: string;
}

// Rendered alongside the running timer. A single long-form "deep read" sits
// next to three follow-ups plus one sponsored card. Keeps the feed present
// without competing with the timer for attention.
export const FocusFeedActive = ({
  className,
}: FocusFeedActiveProps): ReactElement | null => {
  const { data, isLoading } = useFocusPosts();
  const { data: ad } = useFocusAd();
  const { logEvent } = useLogContext();
  const posts = extractPosts(data);
  const deepRead = pickDeepRead(posts);
  const nextUp = posts.filter((post) => post.id !== deepRead?.id).slice(0, 3);

  const onDeepReadClick = useCallback(
    (postId: string) => {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'focus_deep_read_click',
        extra: JSON.stringify({ post_id: postId }),
      });
    },
    [logEvent],
  );

  const onNextUpClick = useCallback(
    (postId: string, position: number) => {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'focus_next_up_click',
        extra: JSON.stringify({ post_id: postId, position }),
      });
    },
    [logEvent],
  );

  const onAdClick = useCallback(() => {
    if (!ad) {
      return;
    }
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'focus_next_up_ad',
      extra: JSON.stringify({ provider_id: ad.providerId }),
    });
  }, [ad, logEvent]);

  if (!isLoading && !deepRead) {
    return null;
  }

  return (
    <section
      aria-label="Reading queue"
      className={classNames(
        'grid w-full max-w-5xl grid-cols-1 gap-6 tablet:grid-cols-5',
        className,
      )}
    >
      <div className="flex flex-col gap-3 tablet:col-span-3">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="uppercase tracking-wider"
        >
          A deep read for this session
        </Typography>
        {isLoading || !deepRead ? (
          <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
            <div className="aspect-[16/9] w-full animate-pulse rounded-12 bg-background-default" />
            <div className="h-6 w-5/6 animate-pulse rounded-4 bg-background-default" />
            <div className="h-4 w-2/3 animate-pulse rounded-4 bg-background-default" />
          </div>
        ) : (
          <a
            href={deepRead.commentsPermalink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onDeepReadClick(deepRead.id)}
            className="group flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 transition-colors hover:border-border-subtlest-secondary hover:bg-surface-secondary"
          >
            <div className="aspect-[16/9] w-full overflow-hidden rounded-12 bg-background-default">
              <img
                src={deepRead.image || cloudinaryPostImageCoverPlaceholder}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
            <Typography
              type={TypographyType.Title2}
              bold
              className="line-clamp-3 text-balance transition-colors group-hover:text-text-link"
            >
              {deepRead.title}
            </Typography>
            {deepRead.summary ? (
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
                className="line-clamp-3 text-balance"
              >
                {deepRead.summary}
              </Typography>
            ) : null}
            <div className="flex items-center gap-2">
              {deepRead.source?.name ? (
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                  className="truncate"
                >
                  {deepRead.source.name}
                </Typography>
              ) : null}
              {deepRead.source?.name && deepRead.readTime ? (
                <span
                  aria-hidden="true"
                  className="size-1 rounded-full bg-border-subtlest-tertiary"
                />
              ) : null}
              {deepRead.readTime ? (
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Quaternary}
                >
                  {deepRead.readTime} min read
                </Typography>
              ) : null}
            </div>
          </a>
        )}
      </div>

      <div className="flex flex-col gap-3 tablet:col-span-2">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="uppercase tracking-wider"
        >
          After your session
        </Typography>
        <div className="flex flex-col gap-2">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  className="h-20 w-full animate-pulse rounded-12 bg-surface-float"
                />
              ))
            : nextUp.map((post, index) => (
                <MiniCard
                  key={post.id}
                  post={post}
                  onClick={() => onNextUpClick(post.id, index)}
                />
              ))}
          {ad ? <MiniAdCard ad={ad} onClick={onAdClick} /> : null}
        </div>
      </div>
    </section>
  );
};
