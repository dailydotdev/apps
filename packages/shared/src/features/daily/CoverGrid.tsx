import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import {
  StarIcon,
  UpvoteIcon,
  DiscussIcon,
  OpenLinkIcon,
  ArrowIcon,
} from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { useAdQuery } from '../monetization/useAdQuery';
import { AdPlacement } from '../../lib/ads';
import { AdPixel } from '../../components/cards/ad/common/AdPixel';
import { getAdFaviconImageLink } from '../../components/cards/ad/common/getAdFaviconImageLink';
import { useScrambler } from '../../hooks/useScrambler';
import { adFaviconPlaceholder } from '../../lib/image';
import { useFeature } from '../../components/GrowthBookProvider';
import { adImprovementsV3Feature } from '../../lib/featureManagement';
import { combinedClicks } from '../../lib/click';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin } from '../../lib/log';
import { adLogEvent, feedLogExtra, postLogEvent } from '../../lib/feed';
import Link from '../../components/utilities/Link';
import type { Ad, Post } from '../../graphql/posts';
import { ElementPlaceholder } from '../../components/ElementPlaceholder';
import useLogImpression from '../../hooks/feed/useLogImpression';
import { FeedItemType } from '../../components/cards/common/common';
import { useSmartTitle } from '../../hooks/post/useSmartTitle';
import { useBookmarkPost } from '../../hooks/useBookmarkPost';
import type { UseVotePostProps } from '../../hooks/vote/types';
import { BookmarkButton } from '../../components/buttons/BookmarkButton';
import { ButtonSize } from '../../components/buttons/Button';
import { useDailyFeed } from './hooks/useDailyFeed';
import { DailyPostVotes } from './DailyPostVotes';
import {
  createBookmarkOnMutate,
  createVoteOnMutate,
} from './optimisticMutations';

const AD_SLOT_INDEX = 1;
const DAILY_FEED_NAME = 'daily';

// Picks is a single-column list, so grid position is always column 0 of 1.
const dailyFeedExtra = () =>
  feedLogExtra(DAILY_FEED_NAME, undefined, undefined, Origin.DailyPage);

const InlineStat = ({
  icon,
  value,
  ariaLabel,
}: {
  icon: ReactElement;
  value: number;
  ariaLabel: string;
}): ReactElement => (
  <span
    aria-label={ariaLabel}
    className="inline-flex items-center gap-1.5 px-1"
  >
    {icon}
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
      bold
      className="tabular-nums"
    >
      {value}
    </Typography>
  </span>
);

const AdRow = ({ ad }: { ad: Ad }): ReactElement => {
  const { logEvent } = useLogContext();
  const adImprovementsV3 = useFeature(adImprovementsV3Feature);
  const faviconSrc = getAdFaviconImageLink({ ad, adImprovementsV3, size: 24 });
  const adLabel = useScrambler('Ad');
  const impressionRef = useLogImpression(
    {
      type: FeedItemType.Ad,
      ad,
      index: AD_SLOT_INDEX,
      updatedAt: 0,
      dataUpdatedAt: 0,
    },
    AD_SLOT_INDEX,
    1,
    0,
    AD_SLOT_INDEX,
    DAILY_FEED_NAME,
    undefined,
    undefined,
    Origin.DailyPage,
  );

  return (
    <li ref={impressionRef}>
      <a
        href={ad.link}
        target="_blank"
        rel="noopener noreferrer sponsored"
        title={ad.description}
        {...combinedClicks(() =>
          logEvent(
            adLogEvent(LogEvent.Click, ad, {
              columns: 1,
              column: 0,
              row: AD_SLOT_INDEX,
              ...dailyFeedExtra(),
            }),
          ),
        )}
        className="group flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-surface-float tablet:px-5"
      >
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Body}
          bold
          color={TypographyColor.Primary}
          className="min-w-0 max-w-3xl flex-1 !leading-snug"
        >
          {ad.description}
        </Typography>
        <span className="ml-auto flex shrink-0 items-center gap-2">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Quaternary}
            suppressHydrationWarning
          >
            {adLabel}
          </Typography>
          <span className="overflow-hidden rounded-full border-2 border-background-default bg-surface-float">
            <img
              src={faviconSrc || adFaviconPlaceholder}
              alt=""
              loading="lazy"
              className="size-4 object-cover"
            />
          </span>
          <OpenLinkIcon
            size={IconSize.XSmall}
            className="text-text-quaternary"
            aria-hidden
          />
        </span>
      </a>
      <AdPixel pixel={ad.pixel} />
    </li>
  );
};

const PickRow = ({
  post,
  position,
  onExpand,
  onBookmark,
  onVoteMutate,
}: {
  post: Post;
  position: number;
  onExpand: () => void;
  onBookmark: () => void;
  onVoteMutate: UseVotePostProps['onMutate'];
}): ReactElement => {
  const { source } = post;
  const { title } = useSmartTitle(post);
  const summary = post.summary || post.sharedPost?.summary;
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = `daily-pick-${post.id}`;
  const impressionRef = useLogImpression(
    {
      type: FeedItemType.Post,
      post,
      page: 0,
      index: position,
      dataUpdatedAt: 0,
    },
    position,
    1,
    0,
    position,
    DAILY_FEED_NAME,
    undefined,
    undefined,
    Origin.DailyPage,
  );

  const onToggle = () => {
    const willOpen = !isExpanded;
    setIsExpanded(willOpen);
    if (willOpen) {
      onExpand();
    }
  };

  return (
    <li ref={impressionRef}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className={classNames(
          'group flex w-full items-center gap-4 px-4 py-4 text-left transition-colors tablet:px-5',
          !isExpanded && 'hover:bg-surface-float',
        )}
      >
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Body}
          bold
          color={TypographyColor.Primary}
          className="min-w-0 max-w-3xl flex-1 !leading-snug"
        >
          {title}
        </Typography>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <InlineStat
            ariaLabel={`${post.numUpvotes ?? 0} upvotes`}
            icon={
              <UpvoteIcon
                size={IconSize.XSmall}
                className="text-text-tertiary"
                secondary
              />
            }
            value={post.numUpvotes ?? 0}
          />
          <InlineStat
            ariaLabel={`${post.numComments ?? 0} comments`}
            icon={
              <DiscussIcon
                size={IconSize.XSmall}
                className="text-text-tertiary"
                secondary
              />
            }
            value={post.numComments ?? 0}
          />
          {source?.image ? (
            <span className="hidden items-center pl-1 tablet:inline-flex">
              <span className="overflow-hidden rounded-full border-2 border-background-default bg-surface-float">
                <img
                  src={source.image}
                  alt={source.name ?? ''}
                  loading="lazy"
                  className="size-4 object-cover"
                />
              </span>
            </span>
          ) : null}
          <ArrowIcon
            size={IconSize.XSmall}
            className={classNames(
              'shrink-0 text-text-quaternary transition-transform duration-300 ease-out',
              isExpanded ? 'rotate-0' : 'rotate-180',
            )}
            aria-hidden
          />
        </div>
      </button>
      {isExpanded ? (
        <div id={panelId} className="flex flex-col gap-3 px-4 pb-4 tablet:px-5">
          {summary ? (
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Primary}
              className="max-w-3xl !leading-relaxed"
            >
              {summary}
            </Typography>
          ) : null}
          <div className="mt-1 flex w-full flex-wrap items-center justify-between gap-3">
            <Link href={post.commentsPermalink} passHref>
              <a
                href={post.commentsPermalink}
                className="font-bold text-text-link typo-footnote hover:underline"
              >
                Read more
              </a>
            </Link>
            <div className="ml-auto flex items-center gap-1">
              <BookmarkButton
                post={post}
                iconSize={IconSize.Small}
                buttonProps={{
                  size: ButtonSize.Small,
                  onClick: onBookmark,
                }}
              />
              <DailyPostVotes
                post={post}
                origin={Origin.DailyPage}
                opts={{
                  columns: 1,
                  column: 0,
                  row: position,
                  ...dailyFeedExtra(),
                }}
                onMutate={onVoteMutate}
              />
            </div>
          </div>
        </div>
      ) : null}
    </li>
  );
};

const PICKS_PLACEHOLDER_COUNT = 5;

const PickRowSkeleton = (): ReactElement => (
  <li className="flex w-full items-center gap-4 px-4 py-4 tablet:px-5">
    <ElementPlaceholder className="h-5 max-w-3xl flex-1 rounded-8" />
    <ElementPlaceholder className="h-4 w-12 rounded-8" />
  </li>
);

export const CoverGrid = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { isPlus } = usePlusSubscription();
  const { posts, isPending, updatePost } = useDailyFeed();
  const onVoteMutate = useMemo(
    () => createVoteOnMutate(updatePost),
    [updatePost],
  );
  const onBookmarkMutate = useMemo(
    () => createBookmarkOnMutate(updatePost),
    [updatePost],
  );
  const { toggleBookmark } = useBookmarkPost({ onMutate: onBookmarkMutate });
  const { data: ad } = useAdQuery({
    queryKey: ['ad', 'daily-picks'],
    placement: AdPlacement.Feed,
    enabled: !isPlus,
  });

  const onPickClick = (post: Post, position: number): void => {
    logEvent(
      postLogEvent(LogEvent.Click, post, {
        columns: 1,
        column: 0,
        row: position,
        ...dailyFeedExtra(),
      }),
    );
  };

  const onPickBookmark = (post: Post, position: number): void => {
    toggleBookmark({
      post,
      origin: Origin.DailyPage,
      opts: {
        columns: 1,
        column: 0,
        row: position,
        ...dailyFeedExtra(),
      },
    });
  };

  return (
    <section>
      <div className="mb-3 flex items-center gap-2 px-1">
        <StarIcon
          size={IconSize.Small}
          className="text-accent-cabbage-default"
          secondary
        />
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          Picks
        </Typography>
      </div>
      <ol className="-mx-4 divide-y divide-border-subtlest-quaternary overflow-hidden bg-background-default tablet:mx-0 tablet:rounded-12 tablet:border tablet:border-border-subtlest-quaternary">
        {isPending && !posts.length
          ? Array.from({ length: PICKS_PLACEHOLDER_COUNT }, (_, i) => i).map(
              (i) => <PickRowSkeleton key={`pick-skeleton-${i}`} />,
            )
          : posts.map((post, idx) => (
              <React.Fragment key={post.id}>
                {idx === AD_SLOT_INDEX && ad ? <AdRow ad={ad} /> : null}
                <PickRow
                  post={post}
                  position={idx}
                  onExpand={() => onPickClick(post, idx)}
                  onBookmark={() => onPickBookmark(post, idx)}
                  onVoteMutate={onVoteMutate}
                />
              </React.Fragment>
            ))}
      </ol>
    </section>
  );
};
