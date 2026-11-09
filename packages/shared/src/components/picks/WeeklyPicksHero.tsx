import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Picks, PicksWeekSignals } from '../../graphql/picks';
import { getNewPicksPath } from '../../graphql/picks';
import type { LoggedUser } from '../../lib/user';
import { webappUrl } from '../../lib/constants';
import { Origin } from '../../lib/log';
import { useAuthContext } from '../../contexts/AuthContext';
import { TopHeroPortal } from '../../contexts/TopHeroSlotContext';
import { useLaptopLayout } from '../../hooks/layout/useLaptopLayout';
import { useSharePicks } from '../../hooks/picks/useSharePicks';
import type {
  UseWeeklyPicksHero,
  WeeklyPicksHeroState,
} from '../../hooks/picks/useWeeklyPicksHero';
import { TopHero } from '../marketing/banners/HeroBottomBanner';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import Link from '../utilities/Link';
import { StarIcon } from '../icons';
import { IconSize } from '../Icon';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';

const HERO_ORIGIN = 'home_hero';

/** "You upvoted 4, bookmarked 2 and read 6 posts this week" */
export const getSignalsTitle = (signals: PicksWeekSignals): string => {
  const parts = (
    [
      ['upvoted', signals.upvotes],
      ['bookmarked', signals.bookmarks],
      ['read', signals.reads],
    ] as const
  )
    .filter(([, count]) => count > 0)
    .map(([verb, count]) => `${verb} ${count}`);
  const joined =
    parts.length > 1
      ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
      : parts[0];
  const total = signals.upvotes + signals.bookmarks + signals.reads;

  return `You ${joined} ${total === 1 ? 'post' : 'posts'} this week`;
};

export const getOpensTitle = (viewCount: number | null): string => {
  if (viewCount === null) {
    return 'Your picks are live';
  }

  return viewCount
    ? `Your picks are live · opened by ${viewCount}`
    : 'Your picks are live · not opened yet';
};

const StarIllustration = (): ReactElement => (
  <div className="flex size-20 shrink-0 items-center justify-center self-center rounded-12 bg-surface-float tablet:size-24">
    <StarIcon
      secondary
      size={IconSize.XLarge}
      className="text-accent-cheese-default"
    />
  </div>
);

export interface WeeklyPicksHeroCardProps {
  state: WeeklyPicksHeroState;
  signals?: PicksWeekSignals | null;
  picks?: Picks | null;
  viewCount?: number | null;
  user?: Pick<LoggedUser, 'id' | 'name' | 'username' | 'image'> | null;
  className?: string;
  onCta?: () => void;
  onShare?: (picks: Picks) => void;
  onDismiss?: () => void;
}

/**
 * The card itself, with no data fetching, so a story can show both states.
 * The nudge CTA is a link, so it works from the extension's new tab too.
 */
export function WeeklyPicksHeroCard({
  state,
  signals,
  picks,
  viewCount = null,
  user,
  className,
  onCta,
  onShare,
  onDismiss,
}: WeeklyPicksHeroCardProps): ReactElement {
  if (state === 'live' && picks) {
    return (
      <TopHero
        className={className}
        illustration={
          user ? (
            <ProfilePicture
              user={user}
              size={ProfileImageSize.XXLarge}
              className="shrink-0 self-center"
              nativeLazyLoading
            />
          ) : (
            <StarIllustration />
          )
        }
        title={getOpensTitle(viewCount)}
        subtitle={
          viewCount
            ? 'Share the link again and see how far it goes'
            : 'Share the link with your team'
        }
        ctaLabel="Share"
        onCtaClick={() => {
          onCta?.();
          onShare?.(picks);
        }}
        onClose={onDismiss}
      />
    );
  }

  const href = `${webappUrl}${getNewPicksPath({ origin: HERO_ORIGIN }).slice(1)}`;

  return (
    <TopHero
      className={className}
      illustration={<StarIllustration />}
      title={signals ? getSignalsTitle(signals) : undefined}
      subtitle="Turn the best into picks for your team"
      actions={
        <Link href={href} passHref>
          <Button
            tag="a"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            onClick={onCta}
          >
            Make your picks
          </Button>
        </Link>
      }
      onClose={onDismiss}
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
  const { user } = useAuthContext();
  const isLaptopLayout = useLaptopLayout();
  const { openShareSheet } = useSharePicks();
  const { shouldShow, state, signals, picks, viewCount, onCta, onDismiss } =
    hero;

  if (!shouldShow || !state) {
    return null;
  }

  const card = (
    <WeeklyPicksHeroCard
      state={state}
      signals={signals}
      picks={picks}
      viewCount={viewCount}
      user={user}
      className={classNames(!isLaptopLayout && 'mx-4 mb-4 w-auto')}
      onCta={onCta}
      onShare={(list) => openShareSheet(list, Origin.HomePage)}
      onDismiss={onDismiss}
    />
  );

  return isLaptopLayout ? <TopHeroPortal>{card}</TopHeroPortal> : card;
}
