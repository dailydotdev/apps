import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { VIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { Offer, StreakMilestone } from './data';
import { RewardCardState } from './RewardCard';
import { BrandLogo } from './coupons';
import {
  EmberPanel,
  FinePrint,
  FlameBadge,
  FlameSize,
  GiftHeadline,
  MomentShell,
  NoThanks,
  StreakCount,
} from './moment';

// Variant 4. Mobile.
//
// Portrait, 384 wide, the shape the partner's own mock-up used: the win at the
// top, a swipeable row of gifts under it, one small button per card. Same three
// beats they showed us, in our design language: choose, hand off, confirm.
//
// On a phone this is a bottom drawer, which is what the app already does with
// the streak modal (Modal.isDrawerOnMobile).

export enum MobileStep {
  Gifts = 'gifts',
  Redirecting = 'redirecting',
  Active = 'active',
}

const brandWash = (offer: Offer): string =>
  `linear-gradient(150deg, ${offer.brandColor}CC 0%, #14161C 100%)`;

const MobileGiftCard = ({
  offer,
  state = RewardCardState.Idle,
  onClaim,
}: {
  offer: Offer;
  state?: RewardCardState;
  onClaim?: () => void;
}): ReactElement => (
  <div className="flex w-[15rem] shrink-0 snap-center flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float shadow-2">
    <div
      className="relative flex h-28 items-end p-3"
      style={offer.photo ? undefined : { backgroundImage: brandWash(offer) }}
    >
      {offer.photo && (
        <>
          <img
            src={offer.photo}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(15,18,24,0.2) 0%, rgba(15,18,24,0.88) 100%)',
            }}
          />
        </>
      )}
      <p className="relative max-w-[14ch] font-bold text-white typo-callout">
        {offer.headline}
      </p>
    </div>
    <div className="flex items-center gap-2 p-3">
      <BrandLogo offer={offer} size={36} className="rounded-10" />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-bold typo-footnote">{offer.brand}</span>
        <span className="truncate text-text-quaternary typo-caption1">
          {offer.plan}
        </span>
      </div>
      {state === RewardCardState.Claimed ? (
        <span className="flex items-center gap-1 rounded-8 bg-overlay-float-avocado px-2 py-1 font-bold text-accent-avocado-default typo-caption1">
          <VIcon size={IconSize.XSmall} secondary />
          Active
        </span>
      ) : (
        <Button
          className="mr-cta"
          size={ButtonSize.Small}
          variant={ButtonVariant.Primary}
          onClick={onClaim}
        >
          Claim
        </Button>
      )}
    </div>
  </div>
);

export const MobileMoment = ({
  milestone,
  gifts,
  step = MobileStep.Gifts,
  activeOffer,
  onClaim,
  onKeep,
  onClose,
  onDone,
  className,
}: {
  milestone: StreakMilestone;
  gifts: Offer[];
  step?: MobileStep;
  activeOffer?: Offer;
  onClaim?: (offer: Offer) => void;
  onKeep?: () => void;
  onClose?: () => void;
  onDone?: () => void;
  className?: string;
}): ReactElement => {
  const claimed = activeOffer ?? gifts[0];

  if (step === MobileStep.Redirecting) {
    return (
      <MomentShell width="w-full max-w-[24rem]" className={classNames('flex-col', className)}>
        <div className="flex flex-col items-center gap-4 px-6 py-16">
          <Loader />
          <p className="text-center typo-callout">
            Redirecting to {claimed.brand}
          </p>
          <p className="max-w-[26ch] text-center text-text-quaternary typo-caption1">
            Your gift is already saved in the vault. If the hand-off fails you
            can pick it up from there.
          </p>
        </div>
      </MomentShell>
    );
  }

  if (step === MobileStep.Active) {
    return (
      <MomentShell
        onClose={onClose}
        width="w-full max-w-[24rem]"
        className={classNames('flex-col', className)}
      >
        <div className="flex flex-col items-center gap-4 p-6">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-overlay-float-avocado">
            <VIcon
              size={IconSize.Large}
              secondary
              className="text-accent-avocado-default"
            />
          </span>
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-center typo-title2">
              Your {claimed.brand} gift is live
            </h2>
            <p className="max-w-[30ch] text-center text-text-tertiary typo-callout">
              {claimed.short} of {claimed.plan}. Nothing else to do here.
            </p>
          </div>
          <MobileGiftCard offer={claimed} state={RewardCardState.Claimed} />
          <Button
            className="w-full"
            size={ButtonSize.Medium}
            variant={ButtonVariant.Primary}
            onClick={onDone}
          >
            Back to my feed
          </Button>
          <FinePrint className="text-center" />
        </div>
      </MomentShell>
    );
  }

  return (
    <MomentShell
      onClose={onClose}
      width="w-full max-w-[24rem]"
      className={classNames('flex-col', className)}
    >
      <EmberPanel className="flex-col items-center gap-2 px-6 pb-4 pt-6">
        {/* Flame and count on one line: stacked centred blocks never line up
            in a narrow popup, and the flame looked lost on its own. */}
        <div className="flex items-center justify-center gap-3">
          <FlameBadge
            milestone={milestone}
            size={FlameSize.Small}
            className="mr-flame-sm shrink-0"
          />
          <span className="mr-streak-line flex items-baseline gap-2 text-text-primary">
            <StreakCount day={milestone.day} />
            <span className="font-normal">day streak</span>
          </span>
        </div>
        <GiftHeadline count={gifts.length} centered className="pt-1" />
      </EmberPanel>

      <div className="flex flex-col gap-3 p-4">

        {/* Swipeable, like the partner mock-up. Each card claims on its own. */}
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1">
          {gifts.map((offer) => (
            <MobileGiftCard
              key={offer.id}
              offer={offer}
              onClaim={() => onClaim?.(offer)}
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-3 pt-1">
          <FinePrint className="text-center" />
          <NoThanks onClick={onKeep} />
        </div>
      </div>
    </MomentShell>
  );
};
