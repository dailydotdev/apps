import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { GiftIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { Offer, StreakMilestone } from './data';
import { BrandMark, RewardCard, RewardCardVariant } from './RewardCard';

// Concept D. The quiet gift.
//
// Most wins are too small to stop someone's reading for. This is the version
// that never takes the screen: the gift is announced where notifications
// already live, and the user goes and gets it when they feel like it. Lowest
// claim rate per impression, highest trust, and the only responsible option
// for milestones that repeat every week.

export const GiftToast = ({
  milestone,
  offer,
  onOpen,
  onDismiss,
  className,
}: {
  milestone: StreakMilestone;
  offer: Offer;
  onOpen?: () => void;
  onDismiss?: () => void;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'mr-rise flex w-[22rem] items-start gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 shadow-3',
      className,
    )}
  >
    <BrandMark offer={offer} />
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="font-bold typo-callout">
        Day {milestone.day} · {milestone.label}
      </span>
      <span className="text-text-tertiary typo-footnote">{offer.headline}</span>
      <span className="text-text-quaternary typo-caption1">
        Sponsored gift, waiting in your vault
      </span>
      <Button
        className="mt-2 self-start"
        size={ButtonSize.Small}
        variant={ButtonVariant.Secondary}
        onClick={onOpen}
      >
        Take a look
      </Button>
    </div>
    <CloseButton size={ButtonSize.XSmall} onClick={onDismiss} />
  </div>
);

/** Header entry point. The badge is the only nag the quiet concept allows. */
export const HeaderGiftEntry = ({
  count,
  className,
}: {
  count: number;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex items-center gap-2 rounded-14 border border-border-subtlest-tertiary bg-background-default px-3 py-2',
      className,
    )}
  >
    <span className="relative flex">
      <GiftIcon size={IconSize.Medium} secondary />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-max bg-accent-cabbage-default px-1 font-bold text-white typo-caption2">
          {count}
        </span>
      )}
    </span>
    <span className="text-text-tertiary typo-footnote">Gifts</span>
  </div>
);

/**
 * The in-feed placement. Sits in the content flow between cards so it pushes
 * the feed down instead of covering it, and it is dismissible for good.
 */
export const FeedGiftCard = ({
  milestone,
  offer,
  onClaim,
  onDismiss,
  className,
}: {
  milestone: StreakMilestone;
  offer: Offer;
  onClaim?: () => void;
  onDismiss?: () => void;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'relative flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4',
      className,
    )}
  >
    <div className="flex items-center gap-2 pr-8">
      <GiftIcon size={IconSize.Small} secondary />
      <span className="text-text-tertiary typo-footnote">
        For your day {milestone.day} streak
      </span>
    </div>
    <RewardCard
      offer={offer}
      variant={RewardCardVariant.Row}
      onClaim={onClaim}
      className="border-none bg-transparent p-0"
    />
    <CloseButton
      size={ButtonSize.XSmall}
      className="absolute right-3 top-3"
      onClick={onDismiss}
    />
  </div>
);

/** Streak panel row. The gift lives next to the streak that produced it. */
export const StreakPanelGiftRow = ({
  offer,
  onOpen,
  className,
}: {
  offer: Offer;
  onOpen?: () => void;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex w-[320px] items-center gap-3 rounded-10 bg-surface-float px-3 py-2',
      className,
    )}
  >
    <BrandMark offer={offer} size="sm" />
    <div className="flex min-w-0 flex-1 flex-col">
      <span className="truncate font-bold typo-footnote">{offer.brand}</span>
      <span className="truncate text-text-quaternary typo-caption1">
        {offer.value} · {offer.expiresIn} left
      </span>
    </div>
    <Button
      size={ButtonSize.XSmall}
      variant={ButtonVariant.Primary}
      onClick={onOpen}
    >
      Claim
    </Button>
  </div>
);
