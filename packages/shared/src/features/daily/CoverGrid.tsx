import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
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
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin } from '../../lib/log';
import Link from '../../components/utilities/Link';
import type { Ad, Post } from '../../graphql/posts';
import { Loader } from '../../components/Loader';
import { useDailyFeed } from './hooks/useDailyFeed';

const AD_SLOT_INDEX = 1;

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

interface CoverGridProps {
  onMarkRead: (id: string) => void;
}

const AdRow = ({ ad }: { ad: Ad }): ReactElement => {
  const adImprovementsV3 = useFeature(adImprovementsV3Feature);
  const faviconSrc = getAdFaviconImageLink({ ad, adImprovementsV3, size: 24 });
  const adLabel = useScrambler('Ad');

  return (
    <li>
      <a
        href={ad.link}
        target="_blank"
        rel="noopener noreferrer sponsored"
        title={ad.description}
        {...combinedClicks(() => undefined)}
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
  onClick,
}: {
  post: Post;
  position: number;
  onClick: () => void;
}): ReactElement => {
  const { logEvent } = useLogContext();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });
  const { source } = post;

  useEffect(() => {
    if (!inView) {
      return;
    }
    logEvent({
      event_name: LogEvent.Impression,
      target_id: post.id,
      extra: JSON.stringify({ origin: Origin.DailyPage, position }),
    });
  }, [inView, logEvent, post.id, position]);

  return (
    <li ref={ref}>
      <Link href={post.commentsPermalink} passHref>
        <a
          href={post.commentsPermalink}
          onClick={onClick}
          className="group flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-surface-float tablet:px-5"
        >
          <Typography
            tag={TypographyTag.H3}
            type={TypographyType.Body}
            bold
            color={TypographyColor.Primary}
            className="min-w-0 max-w-3xl flex-1 !leading-snug"
          >
            {post.title}
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
            <OpenLinkIcon
              size={IconSize.XSmall}
              className="shrink-0 text-text-quaternary"
              aria-hidden
            />
          </div>
        </a>
      </Link>
    </li>
  );
};

export const CoverGrid = ({ onMarkRead }: CoverGridProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { posts, isLoading } = useDailyFeed();
  const { data: ad } = useAdQuery({
    queryKey: ['ad', 'daily-picks'],
    placement: AdPlacement.Feed,
  });

  const onPickClick = (post: Post, position: number): void => {
    logEvent({
      event_name: LogEvent.Click,
      target_id: post.id,
      extra: JSON.stringify({ origin: Origin.DailyPage, position }),
    });
    onMarkRead(post.id);
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
      {isLoading && !posts.length ? (
        <div className="flex justify-center py-10">
          <Loader />
        </div>
      ) : (
        <ol className="-mx-4 divide-y divide-border-subtlest-quaternary overflow-hidden bg-background-default tablet:mx-0 tablet:rounded-12 tablet:border tablet:border-border-subtlest-quaternary">
          {posts.map((post, idx) => (
            <React.Fragment key={post.id}>
              {idx === AD_SLOT_INDEX && ad ? <AdRow ad={ad} /> : null}
              <PickRow
                post={post}
                position={idx}
                onClick={() => onPickClick(post, idx)}
              />
            </React.Fragment>
          ))}
        </ol>
      )}
    </section>
  );
};
