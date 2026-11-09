import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Picks, PicksPost, PicksWeekSignals } from '../../graphql/picks';
import { getNewPicksPath, getPicksPath } from '../../graphql/picks';
import { webappUrl } from '../../lib/constants';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';
import { getAbsoluteWebappUrl } from '../../lib/links';
import { LogEvent, Origin } from '../../lib/log';
import { getPicksDeadlineLabel } from '../../lib/picks';
import { ReferralCampaignKey } from '../../lib/referral';
import { useLogContext } from '../../contexts/LogContext';
import { TopHeroPortal } from '../../contexts/TopHeroSlotContext';
import { useLaptopLayout } from '../../hooks/layout/useLaptopLayout';
import { useSharePicks } from '../../hooks/picks/useSharePicks';
import type {
  UseWeeklyPicksHero,
  WeeklyPicksHeroAction,
  WeeklyPicksHeroState,
} from '../../hooks/picks/useWeeklyPicksHero';
import {
  countSignals,
  PICKS_HERO_THUMBNAILS,
} from '../../hooks/picks/useWeeklyPicksHero';
import { useCopyLink } from '../../hooks/useCopy';
import { useGetShortUrl } from '../../hooks/utils/useGetShortUrl';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import CloseButton from '../CloseButton';
import { Image } from '../image/Image';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import Link from '../utilities/Link';

const HERO_ORIGIN = 'home_hero';

/** The nudge's question: the week's total, and a job that sounds small. */
export const getNudgeHeadline = (
  signals: PicksWeekSignals,
): { count: number; before: string; after: string } => {
  const count = countSignals(signals);

  return {
    count,
    before: 'You read ',
    after: ` ${count === 1 ? 'post' : 'posts'} this week. Which ${PICKS_HERO_THUMBNAILS} were worth it?`,
  };
};

export interface LiveCopy {
  /** The opens count, shown big. Absent when there is nothing to celebrate yet. */
  count: number | null;
  headline: string;
  subtitle: string;
  /** Which button leads: sharing again once it moves, copying the link before. */
  primary: Extract<WeeklyPicksHeroAction, 'share' | 'copy'>;
}

/** The live card is about the payoff, and changes tone when there is none yet. */
export const getLiveCopy = (viewCount: number | null): LiveCopy => {
  if (viewCount === null) {
    return {
      count: null,
      headline: 'Your picks are live',
      subtitle: 'Send the link to your team',
      primary: 'share',
    };
  }

  if (viewCount === 0) {
    return {
      count: null,
      headline: "Nobody's seen your picks yet",
      subtitle: 'Send it to your team',
      primary: 'copy',
    };
  }

  return {
    count: viewCount,
    headline: `${viewCount === 1 ? 'person' : 'people'} opened your picks.`,
    subtitle: 'Keep it going.',
    primary: 'share',
  };
};

const stackRotation = ['-rotate-6', 'rotate-0', 'rotate-6'];

/** A brand glow from the right, so the card is not another feed card. */
const picksGlow: CSSProperties = {
  backgroundImage:
    'radial-gradient(120% 180% at 100% 50%, color-mix(in srgb, var(--theme-brand-default) 22%, transparent) 0%, color-mix(in srgb, var(--theme-brand-default) 6%, transparent) 45%, transparent 70%)',
};

/**
 * Up to three of the week's posts as a fanned stack: on the nudge they are
 * the question marks the reader is asked to answer, on the live card the
 * numbered picks. Decoration only; the card reads the same without them.
 */
const PicksStack = ({
  posts,
  badges,
}: {
  posts: PicksPost[];
  badges: 'question' | 'ranked';
}): ReactElement | null => {
  if (!posts.length) {
    return null;
  }

  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center self-center pr-2 tablet:pr-4"
    >
      {posts.slice(0, PICKS_HERO_THUMBNAILS).map((post, index) => (
        <div
          key={post.id}
          className={classNames(
            'relative size-12 shrink-0 overflow-hidden rounded-10 border-2 border-background-default bg-surface-float shadow-2 tablet:size-20 tablet:rounded-14',
            index > 0 && '-ml-4 tablet:-ml-6',
            stackRotation[index],
          )}
          style={{ zIndex: index }}
        >
          <Image
            src={post.image ?? undefined}
            alt=""
            loading="lazy"
            fallbackSrc={cloudinaryPostImageCoverPlaceholder}
            className="size-full object-cover"
          />
          <span className="absolute left-1 top-1 flex size-5 items-center justify-center rounded-6 bg-brand-default font-bold text-white typo-caption2 tablet:left-1.5 tablet:top-1.5">
            {badges === 'question' ? '?' : index + 1}
          </span>
        </div>
      ))}
    </div>
  );
};

const Shell = ({
  className,
  label,
  children,
  stack,
  onDismiss,
}: {
  className?: string;
  label: ReactNode;
  children: ReactNode;
  stack: ReactNode;
  onDismiss?: () => void;
}): ReactElement => (
  <section
    className={classNames(
      'relative flex w-full items-center gap-3 overflow-hidden rounded-16 border border-border-subtlest-quaternary bg-background-default py-3 pl-4 pr-10 tablet:gap-5',
      className,
    )}
  >
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={picksGlow}
    />
    <div className="relative flex min-w-0 flex-1 flex-col items-start gap-3">
      <Typography
        type={TypographyType.Caption1}
        bold
        className="uppercase tracking-wide text-brand-default"
      >
        {label}
      </Typography>
      {children}
    </div>
    <div className="relative">{stack}</div>
    {onDismiss && (
      <CloseButton
        type="button"
        size={ButtonSize.XSmall}
        className="absolute right-2 top-2 shrink-0"
        aria-label="Close banner"
        onClick={onDismiss}
      />
    )}
  </section>
);

export interface WeeklyPicksHeroCardProps {
  state: WeeklyPicksHeroState;
  signals?: PicksWeekSignals | null;
  /** The reader's week, for the nudge's thumbnails. */
  suggestions?: PicksPost[];
  picks?: Picks | null;
  viewCount?: number | null;
  className?: string;
  onCta?: (action: WeeklyPicksHeroAction) => void;
  onShare?: (picks: Picks) => void;
  onCopy?: (picks: Picks) => void;
  onDismiss?: () => void;
}

/**
 * The card itself, with no data fetching, so a story can show both states.
 * The nudge CTA is a link, so it works from the extension's new tab too.
 */
export function WeeklyPicksHeroCard({
  state,
  signals,
  suggestions = [],
  picks,
  viewCount = null,
  className,
  onCta,
  onShare,
  onCopy,
  onDismiss,
}: WeeklyPicksHeroCardProps): ReactElement {
  if (state === 'live' && picks) {
    const copy = getLiveCopy(viewCount);
    const posts = [...picks.items]
      .sort((a, b) => a.position - b.position)
      .map((item) => item.post);
    const share = (
      <Button
        key="share"
        type="button"
        {...(copy.primary === 'share'
          ? { variant: ButtonVariant.Primary, color: ButtonColor.Cabbage }
          : { variant: ButtonVariant.Secondary })}
        size={ButtonSize.Small}
        className="flex-1 tablet:flex-none"
        onClick={() => {
          onCta?.('share');
          onShare?.(picks);
        }}
      >
        {copy.count ? 'Share again' : 'Share'}
      </Button>
    );
    const copyLink = (
      <Button
        key="copy"
        type="button"
        {...(copy.primary === 'copy'
          ? { variant: ButtonVariant.Primary, color: ButtonColor.Cabbage }
          : { variant: ButtonVariant.Secondary })}
        size={ButtonSize.Small}
        className="flex-1 tablet:flex-none"
        onClick={() => {
          onCta?.('copy');
          onCopy?.(picks);
        }}
      >
        Copy link
      </Button>
    );

    return (
      <Shell
        className={className}
        label="Your picks are live"
        stack={<PicksStack posts={posts} badges="ranked" />}
        onDismiss={onDismiss}
      >
        <div className="flex items-center gap-2">
          {copy.count !== null && (
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.LargeTitle}
              bold
              className="leading-none text-brand-default"
            >
              {copy.count}
            </Typography>
          )}
          <div className="flex flex-col">
            <Typography type={TypographyType.Callout} bold>
              {copy.headline}
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              {copy.subtitle}
            </Typography>
          </div>
        </div>
        <div className="flex w-full gap-2 tablet:w-auto">
          {copy.primary === 'copy' ? [copyLink, share] : [share, copyLink]}
        </div>
      </Shell>
    );
  }

  const href = `${webappUrl}${getNewPicksPath({ origin: HERO_ORIGIN }).slice(1)}`;
  const headline = signals ? getNudgeHeadline(signals) : null;

  return (
    <Shell
      className={className}
      label={
        <>
          <span className="hidden tablet:inline">Your week · </span>
          {getPicksDeadlineLabel()}
        </>
      }
      stack={<PicksStack posts={suggestions} badges="question" />}
      onDismiss={onDismiss}
    >
      <Typography type={TypographyType.Body} bold tag={TypographyTag.P}>
        {headline ? (
          <>
            {headline.before}
            <span className="text-brand-default">{headline.count}</span>
            {headline.after}
          </>
        ) : (
          `Which ${PICKS_HERO_THUMBNAILS} posts were worth it this week?`
        )}
      </Typography>
      <Link href={href} passHref>
        <Button
          tag="a"
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          size={ButtonSize.Small}
          className="w-full tablet:w-auto"
          onClick={() => onCta?.('pick')}
        >
          Pick my top {PICKS_HERO_THUMBNAILS}
        </Button>
      </Link>
    </Shell>
  );
}

interface WeeklyPicksHeroProps {
  /** From `useWeeklyPicksHero`, owned by the layout that holds the feed for it. */
  hero: UseWeeklyPicksHero;
}

/**
 * The home feed's weekly picks card. On laptop it renders into the top-hero
 * strip beside the reading reminder; below that it sits inline above the
 * feed, where MainFeedLayout mounts it.
 */
export function WeeklyPicksHero({
  hero,
}: WeeklyPicksHeroProps): ReactElement | null {
  const isLaptopLayout = useLaptopLayout();
  const { logEvent } = useLogContext();
  const { openShareSheet } = useSharePicks();
  const { getTrackedUrl } = useGetShortUrl();
  const [, copyLink] = useCopyLink(undefined, true);
  const {
    shouldShow,
    state,
    signals,
    suggestions,
    picks,
    viewCount,
    onCta,
    onDismiss,
  } = hero;

  if (!shouldShow || !state) {
    return null;
  }

  // The same tracked link the share sheet copies, so opens attribute alike.
  const onCopy = (list: Picks) => {
    const link = getTrackedUrl(
      getAbsoluteWebappUrl(getPicksPath(list.id).slice(1)),
      ReferralCampaignKey.SharePicks,
    );
    logEvent({
      event_name: LogEvent.SharePicks,
      extra: JSON.stringify({
        provider: 'copy_link',
        picks_id: list.id,
        origin: Origin.HomePage,
      }),
    });
    copyLink({ link, shorten: true, message: 'Link copied' });
  };

  const card = (
    <WeeklyPicksHeroCard
      state={state}
      signals={signals}
      suggestions={suggestions}
      picks={picks}
      viewCount={viewCount}
      className={classNames(!isLaptopLayout && 'mx-4 mb-4 w-auto')}
      onCta={onCta}
      onShare={(list) => openShareSheet(list, Origin.HomePage)}
      onCopy={onCopy}
      onDismiss={onDismiss}
    />
  );

  return isLaptopLayout ? <TopHeroPortal>{card}</TopHeroPortal> : card;
}
