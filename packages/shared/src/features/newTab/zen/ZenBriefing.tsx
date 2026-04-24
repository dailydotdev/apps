import type { ReactElement } from 'react';
import React, { useCallback, useContext, useEffect } from 'react';
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
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { ArrowIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { useNewTabMode } from '../store/newTabMode.store';
import { useFetchAd } from '../../monetization/useFetchAd';
import { AdPixel } from '../../../components/cards/ad/common/AdPixel';
import { cloudinaryPostImageCoverPlaceholder } from '../../../lib/image';

// Zen keeps daily.dev's core value prop — staying up to date — but presents
// it as a bounded "daily briefing" instead of an infinite feed. One hero, a
// nine-card grid, and exactly one sponsored card spliced in so ad revenue
// still flows. The "Open full feed" CTA is the escape hatch to Discover.
const BRIEFING_LIMIT = 10;
const AD_POSITION_IN_GRID = 3; // 0-indexed within the grid (not counting hero)
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

type BriefingPost = Pick<
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

interface PostCardProps {
  post: BriefingPost;
  position: number;
  onClick: (post: BriefingPost, position: number) => void;
  variant?: 'hero' | 'grid';
}

const PostCover = ({
  image,
  alt,
  aspect,
}: {
  image?: string;
  alt: string;
  aspect: 'hero' | 'grid';
}): ReactElement => {
  const src = image || cloudinaryPostImageCoverPlaceholder;
  return (
    <div
      className={classNames(
        'w-full overflow-hidden rounded-12 bg-surface-float',
        aspect === 'hero' ? 'aspect-[16/9]' : 'aspect-[16/10]',
      )}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
    </div>
  );
};

const BriefingCard = ({
  post,
  position,
  onClick,
  variant = 'grid',
}: PostCardProps): ReactElement => {
  const sourceName = post.source?.name;
  const isHero = variant === 'hero';
  return (
    <a
      href={post.commentsPermalink}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onClick(post, position)}
      className={classNames(
        'group flex flex-col gap-4',
        isHero ? 'tablet:flex-row tablet:gap-6' : '',
      )}
    >
      <div className={classNames(isHero ? 'tablet:w-1/2' : '')}>
        <PostCover
          image={post.image}
          alt=""
          aspect={isHero ? 'hero' : 'grid'}
        />
      </div>
      <div
        className={classNames(
          'flex flex-col gap-3',
          isHero ? 'tablet:w-1/2 tablet:justify-center' : '',
        )}
      >
        {isHero ? (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Brand}
            className="uppercase tracking-wider"
          >
            Today&apos;s read
          </Typography>
        ) : null}
        <Typography
          tag={isHero ? TypographyTag.H2 : TypographyTag.H3}
          type={isHero ? TypographyType.LargeTitle : TypographyType.Title3}
          bold
          className={classNames(
            'text-balance transition-colors group-hover:text-text-link',
            isHero ? 'line-clamp-3' : 'line-clamp-3',
          )}
        >
          {post.title}
        </Typography>
        {isHero && post.summary ? (
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
            className="line-clamp-3 text-balance"
          >
            {post.summary}
          </Typography>
        ) : null}
        <div className="mt-auto flex items-center gap-2">
          {sourceName ? (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="truncate"
            >
              {sourceName}
            </Typography>
          ) : null}
          {sourceName && post.readTime ? (
            <span
              aria-hidden="true"
              className="size-1 rounded-full bg-border-subtlest-tertiary"
            />
          ) : null}
          {post.readTime ? (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Quaternary}
            >
              {post.readTime} min read
            </Typography>
          ) : null}
        </div>
      </div>
    </a>
  );
};

const GridCardSkeleton = (): ReactElement => (
  <div className="flex flex-col gap-4">
    <div className="aspect-[16/10] w-full animate-pulse rounded-12 bg-surface-float" />
    <div className="flex flex-col gap-2">
      <div className="h-5 w-full animate-pulse rounded-4 bg-surface-float" />
      <div className="h-5 w-4/5 animate-pulse rounded-4 bg-surface-float" />
      <div className="mt-2 h-3 w-1/3 animate-pulse rounded-4 bg-surface-float" />
    </div>
  </div>
);

const HeroSkeleton = (): ReactElement => (
  <div className="flex flex-col gap-4 tablet:flex-row tablet:gap-6">
    <div className="aspect-[16/9] w-full animate-pulse rounded-12 bg-surface-float tablet:w-1/2" />
    <div className="flex flex-col gap-3 tablet:w-1/2 tablet:justify-center">
      <div className="h-3 w-24 animate-pulse rounded-4 bg-surface-float" />
      <div className="h-8 w-full animate-pulse rounded-4 bg-surface-float" />
      <div className="h-8 w-5/6 animate-pulse rounded-4 bg-surface-float" />
      <div className="h-4 w-full animate-pulse rounded-4 bg-surface-float" />
      <div className="h-4 w-2/3 animate-pulse rounded-4 bg-surface-float" />
    </div>
  </div>
);

interface SponsoredCardProps {
  ad: Ad;
  onClick: () => void;
}

// A sponsored card that keeps the magazine rhythm — same cover, title,
// description, and "Sponsored" chip instead of a source name. Impression
// pixels fire via AdPixel the first time the card scrolls into view.
const SponsoredCard = ({ ad, onClick }: SponsoredCardProps): ReactElement => {
  const image = ad.image || cloudinaryPostImageCoverPlaceholder;
  return (
    <a
      href={ad.link}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={onClick}
      className="group flex flex-col gap-4"
    >
      <div className="aspect-[16/10] w-full overflow-hidden rounded-12 bg-surface-float">
        <img
          src={image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-col gap-3">
        <Typography
          type={TypographyType.Title3}
          bold
          className="line-clamp-3 text-balance transition-colors group-hover:text-text-link"
        >
          {ad.description}
        </Typography>
        <div className="mt-auto flex items-center gap-2">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="truncate"
          >
            {ad.source || ad.company || 'Sponsored'}
          </Typography>
          <span
            aria-hidden="true"
            className="size-1 rounded-full bg-border-subtlest-tertiary"
          />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Quaternary}
            className="uppercase tracking-wider"
          >
            Sponsored
          </Typography>
        </div>
      </div>
      <AdPixel pixel={ad.pixel} />
    </a>
  );
};

interface ZenBriefingProps {
  className?: string;
}

export const ZenBriefing = ({ className }: ZenBriefingProps): ReactElement => {
  const { isLoggedIn, user } = useContext(AuthContext);
  const { logEvent } = useLogContext();
  const { setMode } = useNewTabMode();
  const { fetchAd } = useFetchAd();

  const { data, isLoading } = useQuery<FeedData>({
    queryKey: ['zen_briefing', user?.id ?? 'anon'],
    queryFn: () =>
      gqlClient.request<FeedData>(ANONYMOUS_FEED_QUERY, {
        first: BRIEFING_LIMIT,
        loggedIn: isLoggedIn,
      }),
    // Briefing caches aggressively so the page feels static and instant. Two
    // hours matches most users' sense of "this morning's news."
    staleTime: TWO_HOURS_MS,
    gcTime: TWO_HOURS_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const { data: ad } = useQuery<Ad | null>({
    queryKey: ['zen_briefing_ad', user?.id ?? 'anon'],
    queryFn: () => fetchAd({ active: true }),
    // Ads refresh less often than the feed — one per session is plenty.
    staleTime: TWO_HOURS_MS,
    gcTime: TWO_HOURS_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const posts: BriefingPost[] =
    data?.page?.edges
      ?.map((edge) => edge.node)
      .filter((post): post is Post => !!post?.id) ?? [];

  const [hero, ...gridPosts] = posts;

  useEffect(() => {
    if (posts.length === 0) {
      return;
    }
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'zen_briefing',
      extra: JSON.stringify({
        post_count: posts.length,
        has_ad: !!ad,
      }),
    });
    // Only log once per data fetch so we don't double-count.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts.length, !!ad]);

  const onPostClick = useCallback(
    (post: BriefingPost, position: number) => {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'zen_briefing_post',
        extra: JSON.stringify({ post_id: post.id, position }),
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
      target_id: 'zen_briefing_ad',
      extra: JSON.stringify({ provider_id: ad.providerId }),
    });
  }, [ad, logEvent]);

  const onOpenFeed = useCallback(() => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'zen_briefing_open_feed',
    });
    setMode('discover');
  }, [logEvent, setMode]);

  return (
    <section
      aria-label="Daily briefing"
      className={classNames('flex w-full max-w-5xl flex-col gap-10', className)}
    >
      <div className="flex items-baseline justify-between gap-4 border-b border-border-subtlest-tertiary pb-4">
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title2}
          bold
          className="text-text-primary"
        >
          Today&apos;s briefing
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Curated for you
        </Typography>
      </div>

      {isLoading || !hero ? (
        <HeroSkeleton />
      ) : (
        <BriefingCard
          post={hero}
          position={0}
          onClick={onPostClick}
          variant="hero"
        />
      )}

      <div className="grid grid-cols-1 gap-x-8 gap-y-10 tablet:grid-cols-2 laptop:grid-cols-3">
        {(() => {
          if (isLoading || gridPosts.length === 0) {
            return Array.from({ length: 6 }).map((_, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <GridCardSkeleton key={index} />
            ));
          }
          const items: ReactElement[] = gridPosts.map((post, index) => (
            <BriefingCard
              key={post.id}
              post={post}
              position={index + 1}
              onClick={onPostClick}
            />
          ));
          if (ad) {
            items.splice(
              AD_POSITION_IN_GRID,
              0,
              <SponsoredCard key="sponsored" ad={ad} onClick={onAdClick} />,
            );
          }
          return items;
        })()}
      </div>

      <button
        type="button"
        onClick={onOpenFeed}
        className="flex items-center justify-center gap-2 self-center rounded-12 border border-border-subtlest-tertiary px-6 py-3 text-text-secondary transition-colors typo-callout hover:border-border-subtlest-secondary hover:bg-surface-float hover:text-text-primary"
      >
        Keep reading in Discover
        <ArrowIcon size={IconSize.Size16} className="rotate-90" />
      </button>
    </section>
  );
};
