import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Picks, PicksPost, PicksWeekSignals } from '../../graphql/picks';
import { getNewPicksPath, getPicksPath } from '../../graphql/picks';
import { webappUrl } from '../../lib/constants';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';
import { getAbsoluteWebappUrl } from '../../lib/links';
import { LogEvent, Origin } from '../../lib/log';
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
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import CloseButton from '../CloseButton';
import feedStyles from '../Feed.module.css';
import { Image } from '../image/Image';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import Link from '../utilities/Link';

const HERO_ORIGIN = 'home_hero';

/** A headline that may lead with a number, shown in brand color. */
export interface Headline {
  count: number | null;
  text: string;
}

/** The nudge's question: the week's total, and a job that sounds small. */
export const getNudgeHeadline = (signals: PicksWeekSignals): Headline => {
  const count = countSignals(signals);

  return {
    count,
    text: ` ${count === 1 ? 'post' : 'posts'} this week. Which ${PICKS_HERO_THUMBNAILS} were worth\u00a0it?`,
  };
};

export interface LiveCopy {
  headline: Headline;
  /** Which button leads: sharing again once it moves, copying the link before. */
  primary: Extract<WeeklyPicksHeroAction, 'share' | 'copy'>;
}

/** The live card is about the payoff, and changes tone when there is none yet. */
export const getLiveCopy = (viewCount: number | null): LiveCopy => {
  if (viewCount === null) {
    return {
      headline: { count: null, text: 'Send the link to your team' },
      primary: 'share',
    };
  }

  if (viewCount === 0) {
    return {
      headline: { count: null, text: "Nobody's opened your picks yet" },
      primary: 'copy',
    };
  }

  return {
    headline: {
      count: viewCount,
      text: ` ${viewCount === 1 ? 'person' : 'people'} opened your picks`,
    },
    primary: 'share',
  };
};

const stackRotation = ['-rotate-6', 'rotate-0', 'rotate-6'];

/** A brand glow behind the stack, so the card is not another feed card. */
const picksGlow: CSSProperties = {
  backgroundImage:
    'radial-gradient(120% 180% at 0% 50%, color-mix(in srgb, var(--theme-brand-default) 22%, transparent) 0%, color-mix(in srgb, var(--theme-brand-default) 6%, transparent) 45%, transparent 70%)',
};

/**
 * Three slots as a fanned stack, filled with the week's posts: on the nudge
 * they carry the question marks the reader is asked to answer, on the live
 * card the picks' numbers. The slots are there whether or not the posts
 * are, so the card keeps its shape while images load.
 */
const PicksStack = ({
  posts,
  badges,
  size,
  className,
}: {
  posts: PicksPost[];
  badges: 'question' | 'ranked';
  size: 'small' | 'large';
  className?: string;
}): ReactElement => (
  <div
    aria-hidden
    className={classNames('flex items-center justify-center', className)}
  >
    {Array.from({ length: PICKS_HERO_THUMBNAILS }, (_, index) => {
      const post = posts[index];

      return (
        <div
          key={post?.id ?? index}
          className={classNames(
            'relative shrink-0 overflow-hidden rounded-10 border-2 border-background-default bg-surface-float shadow-2',
            size === 'small' ? 'size-14' : 'size-20 rounded-14',
            index > 0 && (size === 'small' ? '-ml-5' : '-ml-6'),
            stackRotation[index],
          )}
          style={{ zIndex: index }}
        >
          {post && (
            <Image
              src={post.image ?? undefined}
              alt=""
              loading="eager"
              fallbackSrc={cloudinaryPostImageCoverPlaceholder}
              className="size-full object-cover"
            />
          )}
          <span
            className={classNames(
              'absolute flex items-center justify-center rounded-6 bg-brand-default font-bold text-white',
              size === 'small'
                ? 'left-1 top-1 size-5 typo-caption2'
                : 'left-1.5 top-1.5 size-6 typo-caption1',
            )}
          >
            {badges === 'question' ? '?' : index + 1}
          </span>
        </div>
      );
    })}
  </div>
);

const HeadlineText = ({
  headline,
  className,
  ...props
}: { headline: Headline } & Omit<
  React.ComponentProps<typeof Typography>,
  'children'
>): ReactElement => (
  <Typography className={className} {...props}>
    {headline.count !== null && (
      <span className="text-brand-default">{headline.count}</span>
    )}
    {headline.text}
  </Typography>
);

export type WeeklyPicksHeroVariant = 'strip' | 'panel';

interface ShellProps {
  variant: WeeklyPicksHeroVariant;
  className?: string;
  title: string;
  headline: Headline;
  actions: (size: ButtonSize | undefined) => ReactNode;
  stack: Omit<React.ComponentProps<typeof PicksStack>, 'size' | 'className'>;
  onDismiss?: () => void;
}

/**
 * The strip layout follows the reading reminder's `TopHero`: illustration
 * first, then the copy and the button, so they sit nearer the page's center.
 */
const StripShell = ({
  className,
  title,
  headline,
  actions,
  stack,
  onDismiss,
}: Omit<ShellProps, 'variant'>): ReactElement => (
  <section
    className={classNames(
      'relative flex w-full items-center gap-4 overflow-hidden rounded-16 border border-border-subtlest-quaternary bg-background-default py-2 pl-3 pr-8 tablet:gap-5',
      className,
    )}
  >
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={picksGlow}
    />
    <PicksStack
      {...stack}
      size="small"
      className="relative h-24 w-28 shrink-0 self-center tablet:h-28 tablet:w-32"
    />
    <div className="relative flex min-w-0 max-w-[18rem] flex-1 flex-col items-start gap-3">
      <div className="flex flex-col">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {title}
        </Typography>
        <HeadlineText
          headline={headline}
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          bold
          className="mt-0.5"
        />
      </div>
      <div className="flex gap-2">{actions(ButtonSize.Small)}</div>
    </div>
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

/**
 * Below laptop the card is the reading reminder's inline panel: a dark card
 * above the feed, copy centered on a phone with the stack in a band under
 * it, side by side from tablet.
 */
const PanelShell = ({
  className,
  title,
  headline,
  actions,
  stack,
  onDismiss,
}: Omit<ShellProps, 'variant'>): ReactElement => (
  <section
    className={classNames('mb-4 w-full pb-0', feedStyles.cards, className)}
  >
    <div className="relative overflow-hidden rounded-b-none rounded-t-16 px-px pb-0 pt-px">
      <div className="top-hero-panel-border absolute inset-0 rounded-b-none rounded-t-16" />
      <div className="top-hero-glow pointer-events-none absolute -right-12 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-10 w-5 bg-gradient-to-t from-raw-pepper-90 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-10 w-5 bg-gradient-to-t from-raw-pepper-90 to-transparent" />
      <div className="relative overflow-hidden rounded-b-none rounded-t-[0.9375rem] bg-raw-pepper-90 shadow-2">
        {onDismiss && (
          <CloseButton
            type="button"
            className="text-white/80 absolute right-3 top-3 z-2 hover:text-white"
            aria-label="Close banner"
            onClick={onDismiss}
          />
        )}
        <div className="flex flex-col tablet:flex-row tablet:items-stretch">
          <div className="flex flex-1 flex-col items-center p-5 text-center tablet:items-start tablet:p-6 tablet:text-left">
            <div className="flex flex-col items-center gap-1 tablet:items-start">
              <p className="text-white/80 mt-2 text-[0.875rem] tablet:text-[0.9375rem]">
                {title}
              </p>
              <HeadlineText
                headline={headline}
                tag={TypographyTag.H3}
                type={TypographyType.Title3}
                bold
                className="text-white tablet:typo-title2"
              />
              <div className="mt-4 flex gap-2">{actions(undefined)}</div>
            </div>
          </div>
          <PicksStack
            {...stack}
            size="large"
            className="bg-black/20 h-40 w-full p-2 tablet:h-auto tablet:w-[14.5rem] tablet:p-3 laptopL:w-[16rem]"
          />
        </div>
      </div>
    </div>
  </section>
);

export interface WeeklyPicksHeroCardProps {
  state: WeeklyPicksHeroState;
  /** The top-hero strip on laptop, the reading reminder's panel below it. */
  variant?: WeeklyPicksHeroVariant;
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
  variant = 'strip',
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
  const Shell = variant === 'strip' ? StripShell : PanelShell;

  if (state === 'live' && picks) {
    const copy = getLiveCopy(viewCount);
    const posts = [...picks.items]
      .sort((a, b) => a.position - b.position)
      .map((item) => item.post);
    const actions = (size: ButtonSize | undefined) => {
      const share = (
        <Button
          key="share"
          type="button"
          variant={
            copy.primary === 'share'
              ? ButtonVariant.Primary
              : ButtonVariant.Secondary
          }
          size={size}
          onClick={() => {
            onCta?.('share');
            onShare?.(picks);
          }}
        >
          {copy.headline.count ? 'Share again' : 'Share'}
        </Button>
      );
      const copyLink = (
        <Button
          key="copy"
          type="button"
          variant={
            copy.primary === 'copy'
              ? ButtonVariant.Primary
              : ButtonVariant.Secondary
          }
          size={size}
          onClick={() => {
            onCta?.('copy');
            onCopy?.(picks);
          }}
        >
          Copy link
        </Button>
      );

      return copy.primary === 'copy' ? [copyLink, share] : [share, copyLink];
    };

    return (
      <Shell
        className={className}
        title="Your picks are live"
        headline={copy.headline}
        actions={actions}
        stack={{ posts, badges: 'ranked' }}
        onDismiss={onDismiss}
      />
    );
  }

  const href = `${webappUrl}${getNewPicksPath({ origin: HERO_ORIGIN }).slice(1)}`;
  const headline: Headline = signals
    ? getNudgeHeadline(signals)
    : {
        count: null,
        text: `Which ${PICKS_HERO_THUMBNAILS} posts were worth it this\u00a0week?`,
      };

  return (
    <Shell
      className={className}
      title="Your week"
      headline={headline}
      actions={(size) => (
        <Link href={href} passHref>
          <Button
            tag="a"
            variant={ButtonVariant.Primary}
            size={size}
            onClick={() => onCta?.('pick')}
          >
            Pick my top {PICKS_HERO_THUMBNAILS}
          </Button>
        </Link>
      )}
      stack={{ posts: suggestions, badges: 'question' }}
      onDismiss={onDismiss}
    />
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
      variant={isLaptopLayout ? 'strip' : 'panel'}
      signals={signals}
      suggestions={suggestions}
      picks={picks}
      viewCount={viewCount}
      onCta={onCta}
      onShare={(list) => openShareSheet(list, Origin.HomePage)}
      onCopy={onCopy}
      onDismiss={onDismiss}
    />
  );

  return isLaptopLayout ? <TopHeroPortal>{card}</TopHeroPortal> : card;
}
