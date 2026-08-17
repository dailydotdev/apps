import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  CoreIcon,
  GiftIcon,
  ShieldPlusIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { StreakMilestone } from './data';
import { streakBrokenArt } from './data';
import {
  AshBadge,
  DayStrip,
  EmberPanel,
  FinePrint,
  FlameBadge,
  MomentShell,
  NoThanks,
  PanelTone,
  StreakCount,
  TierName,
} from './moment';

// The rest of the streak popup family, drawn in the same structure as the gift
// moment: celebration on the left, one decision on the right, one primary
// button, one line of small print.
//
// Keeping them in one shell matters more than it looks. A user meets the freeze
// upsell, the broken streak and the gift within the same fortnight, and three
// different layouts would read as three different products.

/**
 * The strip: one inline row inside a popup, for the thing that is worth saying
 * but is not the decision on screen. It never competes with the primary button,
 * so it stays a single line with a small action on the end.
 */
export enum StripTone {
  Freeze = 'freeze',
  Vault = 'vault',
  Cores = 'cores',
}

const stripIcon: Record<StripTone, ReactNode> = {
  [StripTone.Freeze]: <ShieldPlusIcon size={IconSize.Small} secondary />,
  [StripTone.Vault]: <GiftIcon size={IconSize.Small} secondary />,
  [StripTone.Cores]: <CoreIcon size={IconSize.Small} />,
};

export const PopupStrip = ({
  tone,
  children,
  action,
  onAction,
  className,
}: {
  tone: StripTone;
  children: ReactNode;
  action: string;
  onAction?: () => void;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float px-3 py-2',
      className,
    )}
  >
    <span className="shrink-0 text-text-tertiary">{stripIcon[tone]}</span>
    <span className="min-w-0 flex-1 text-text-tertiary typo-caption1">
      {children}
    </span>
    <Button
      size={ButtonSize.XSmall}
      variant={ButtonVariant.Secondary}
      className="shrink-0"
      onClick={onAction}
    >
      {action}
    </Button>
  </div>
);

/**
 * The same row the gift list uses, for everything that is not a gift: restore,
 * freezes, Cores. One primitive means these popups are lists too, instead of a
 * card stacked on a button stacked on a strip.
 */
export const OptionRow = ({
  icon,
  title,
  meta,
  action,
  primary,
  onAction,
}: {
  icon: ReactNode;
  title: string;
  meta: string;
  action: string;
  primary?: boolean;
  onAction?: () => void;
}): ReactElement => (
  <div className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-2 pr-3 transition-colors duration-150 hover:bg-surface-hover">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-10 bg-surface-hover text-text-tertiary">
      {icon}
    </span>
    <div className="flex min-w-0 flex-1 flex-col">
      <span className="truncate font-bold typo-footnote">{title}</span>
      <span className="truncate text-text-quaternary typo-caption1">{meta}</span>
    </div>
    <Button
      className={classNames('shrink-0', primary && 'mr-cta')}
      size={ButtonSize.Small}
      variant={primary ? ButtonVariant.Primary : ButtonVariant.Secondary}
      onClick={onAction}
    >
      {action}
    </Button>
  </div>
);

const RightColumn = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <div className="mr-side-pad flex min-w-0 flex-1 flex-col justify-center gap-4 p-6">
    {children}
  </div>
);

const CelebrationSide = ({
  milestone,
  children,
}: {
  milestone: StreakMilestone;
  children?: ReactNode;
}): ReactElement => (
  <EmberPanel className="mr-side mr-side-center mr-side-pad flex-col items-center justify-center gap-4 border-r border-border-subtlest-tertiary p-6 text-center">
    <FlameBadge milestone={milestone} className="mr-flame" />
    <TierName milestone={milestone} />
    <div className="flex flex-col gap-1">
      <span className="mr-streak-line flex items-baseline justify-center gap-2 text-text-primary">
        <StreakCount day={milestone.day} />
        <span className="font-normal">day streak</span>
      </span>
      <h2 className="typo-title3">{milestone.headline}</h2>
    </div>
    {children ?? <DayStrip className="mr-hide-tiny" />}
  </EmberPanel>
);

/** A milestone day with a daily.dev reward and no partner involved. */
export const FirstPartyMoment = ({
  milestone,
  onClaim,
  onClose,
  onKeep,
}: {
  milestone: StreakMilestone;
  onClaim?: () => void;
  onClose?: () => void;
  onKeep?: () => void;
}): ReactElement => (
  <MomentShell
    onClose={onClose}
    width="w-full max-w-[46rem]"
    className="mr-split"
  >
    <CelebrationSide milestone={milestone} />
    <RightColumn>
      <div className="flex flex-col gap-1">
        <h3 className="mr-balance font-bold typo-title2">Day {milestone.day} unlocked</h3>
        <p className="mr-pretty text-text-tertiary typo-callout">
          Nothing sponsored today. This one is ours.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <OptionRow
          primary
          icon={<CoreIcon size={IconSize.Small} />}
          title={milestone.reward}
          meta="Spend them on awards"
          action="Claim"
          onAction={onClaim}
        />
        <OptionRow
          icon={<ShieldPlusIcon size={IconSize.Small} secondary />}
          title="Two streak freezes"
          meta="Covers a day you miss"
          action="Get"
          onAction={onKeep}
        />
      </div>
      <NoThanks onClick={onKeep} className="mr-only-narrow" />
    </RightColumn>
  </MomentShell>
);

/** Freeze upsell: the only popup in the family that asks for something. */
export const FreezeMoment = ({
  milestone,
  freezesOwned = 0,
  price = 120,
  onBuy,
  onClose,
  onKeep,
}: {
  milestone: StreakMilestone;
  freezesOwned?: number;
  price?: number;
  onBuy?: () => void;
  onClose?: () => void;
  onKeep?: () => void;
}): ReactElement => (
  <MomentShell
    onClose={onClose}
    width="w-full max-w-[46rem]"
    className="mr-split"
  >
    <CelebrationSide milestone={milestone} />
    <RightColumn>
      <div className="flex flex-col gap-1">
        <h3 className="mr-balance font-bold typo-title2">
          Protect what you have built
        </h3>
        <p className="mr-pretty text-text-tertiary typo-callout">
          A freeze covers one day you miss, automatically. You have{' '}
          {freezesOwned} right now.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <OptionRow
          primary
          icon={<ShieldPlusIcon size={IconSize.Small} secondary />}
          title="Two streak freezes"
          meta={`${price} Cores`}
          action="Get"
          onAction={onBuy}
        />
        <OptionRow
          icon={<ShieldPlusIcon size={IconSize.Small} secondary />}
          title="Five streak freezes"
          meta={`${price * 2} Cores, better value`}
          action="Get"
          onAction={onBuy}
        />
      </div>
      <p className="text-text-quaternary typo-caption1">
        Used automatically on the first day you miss. Nothing is charged again.
      </p>
      <NoThanks onClick={onKeep} className="mr-only-narrow" />
    </RightColumn>
  </MomentShell>
);

/** The streak ended. The one moment in the family with no celebration. */
export const BrokenMoment = ({
  lostDays,
  price = 200,
  canRestore = true,
  onRestore,
  onClose,
  onKeep,
}: {
  lostDays: number;
  price?: number;
  canRestore?: boolean;
  onRestore?: () => void;
  onClose?: () => void;
  onKeep?: () => void;
}): ReactElement => (
  <MomentShell
    onClose={onClose}
    width="w-full max-w-[46rem]"
    className="mr-split"
  >
    {/* Same panel, same badge slot, same entrance as a live streak. Only the
        weather changes: the gradient cools, the particles fall instead of
        rising, and the tier chip is gone because nothing was earned. */}
    <EmberPanel
      tone={PanelTone.Ash}
      className="mr-side mr-side-center mr-side-pad flex-col items-center justify-center gap-4 border-r border-border-subtlest-tertiary p-6 text-center"
    >
      <AshBadge src={streakBrokenArt} className="mr-flame" />
      <div className="flex flex-col gap-1">
        <span className="mr-streak-line flex items-baseline justify-center gap-2 text-text-primary">
          <span className="font-bold tabular-nums">{lostDays}</span>
          <span className="font-normal">days, ended</span>
        </span>
        <p className="mr-pretty text-text-tertiary typo-callout">
          Your {lostDays} day streak has been reset.
        </p>
      </div>
    </EmberPanel>
    <RightColumn>
      <div className="flex flex-col gap-1">
        <h3 className="mr-balance font-bold typo-title2">
          {canRestore ? 'You can get it back' : 'Start again from day one'}
        </h3>
        <p className="mr-pretty text-text-tertiary typo-callout">
          {canRestore
            ? 'Restore it today and the count carries on where it left off.'
            : 'Read one post and day one starts again.'}
        </p>
      </div>

      {/* Two rows, the same shape as the gift list: what you can do, what it
          costs, one small button each. No nested card, no competing CTA. */}
      <div className="flex flex-col gap-2">
        {canRestore && (
          <OptionRow
            primary
            icon={<CoreIcon size={IconSize.Small} />}
            title={`Restore your ${lostDays} day streak`}
            meta={`${price} Cores, once`}
            action="Restore"
            onAction={onRestore}
          />
        )}
        <OptionRow
          icon={<ShieldPlusIcon size={IconSize.Small} secondary />}
          title="Two streak freezes"
          meta="Covers the next day you miss"
          action="Get"
          onAction={onKeep}
        />
      </div>

      <p className="text-text-quaternary typo-caption1">
        {canRestore
          ? 'Restores are available for two days after a streak ends.'
          : 'The restore window has closed. Freezes still cover future days.'}
      </p>
      <NoThanks onClick={onKeep} className="mr-only-narrow" />
    </RightColumn>
  </MomentShell>
);

/** Nothing in the partner catalogue fitted. The day still gets an answer. */
export const NoOfferMoment = ({
  milestone,
  onClaim,
  onClose,
  onKeep,
}: {
  milestone: StreakMilestone;
  onClaim?: () => void;
  onClose?: () => void;
  onKeep?: () => void;
}): ReactElement => (
  <MomentShell
    onClose={onClose}
    width="w-full max-w-[46rem]"
    className="mr-split"
  >
    <CelebrationSide milestone={milestone} />
    <RightColumn>
      <div className="flex flex-col gap-1">
        <h3 className="mr-balance font-bold typo-title2">Nothing sponsored today</h3>
        <p className="mr-pretty text-text-tertiary typo-callout">
          No partner offer matched what you asked to see, so here is one of ours
          instead.
        </p>
      </div>
      <div className="flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-12 bg-overlay-float-water text-accent-water-default">
          <ShieldPlusIcon size={IconSize.Large} secondary />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-bold typo-callout">A streak freeze</span>
          <span className="text-text-quaternary typo-caption1">
            Covers one missed day, yours whether you use it or not
          </span>
        </div>
      </div>
      <Button
        className="mr-cta w-full"
        size={ButtonSize.Large}
        variant={ButtonVariant.Primary}
        onClick={onClaim}
      >
        Take the freeze
      </Button>
      <FinePrint />
      <NoThanks onClick={onKeep} className="mr-only-narrow" />
    </RightColumn>
  </MomentShell>
);
