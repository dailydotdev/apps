import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import {
  ChecklistAIcon,
  GiftIcon,
  ShieldCheckIcon,
  TimerIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { Offer } from './data';
import { firstPartyRewards } from './data';
import { BrandMark, OfferTerms } from './RewardCard';
import { MomentShell } from './moment';

// The claim itself. Same sheet for every concept, so a gift behaves identically
// whether it came from a reveal, the vault, or a toast.
//
// The design rule here is that nothing surprising happens after the tap. The
// user is told they are leaving, told what the partner will ask for, and told
// what we get out of it, all before the redirect rather than after.

export enum ClaimStep {
  Confirm = 'confirm',
  Redirecting = 'redirecting',
  Active = 'active',
  Expired = 'expired',
  Unavailable = 'unavailable',
  Withdrawn = 'withdrawn',
  Failed = 'failed',
}

const Bullet = ({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <li className="flex items-start gap-2 text-text-tertiary typo-footnote">
    <span className="mt-0.5 text-text-quaternary">{icon}</span>
    {children}
  </li>
);

const SheetHeader = ({
  offer,
  title,
  subtitle,
}: {
  offer: Offer;
  title: string;
  subtitle: string;
}): ReactElement => (
  <div className="flex items-center gap-3">
    <BrandMark offer={offer} />
    <div className="flex min-w-0 flex-col">
      <span className="font-bold typo-callout">{title}</span>
      <span className="text-text-tertiary typo-footnote">{subtitle}</span>
    </div>
  </div>
);

const Problem = ({
  title,
  body,
  action,
  onAction,
  onClose,
}: {
  title: string;
  body: string;
  action: string;
  onAction?: () => void;
  onClose?: () => void;
}): ReactElement => (
  <MomentShell onClose={onClose} width="w-[24rem]">
    <div className="flex flex-col gap-3">
      <h3 className="typo-title3">{title}</h3>
      <p className="text-text-tertiary typo-callout">{body}</p>
    </div>
    <div className="flex flex-col gap-2">
      <Button
        className="w-full"
        size={ButtonSize.Medium}
        variant={ButtonVariant.Primary}
        onClick={onAction}
      >
        {action}
      </Button>
      <Button
        className="w-full"
        size={ButtonSize.Medium}
        variant={ButtonVariant.Tertiary}
        onClick={onClose}
      >
        Close
      </Button>
    </div>
  </MomentShell>
);

export const ClaimSheet = ({
  offer,
  step = ClaimStep.Confirm,
  onContinue,
  onClose,
}: {
  offer: Offer;
  step?: ClaimStep;
  onContinue?: () => void;
  onClose?: () => void;
}): ReactElement => {
  if (step === ClaimStep.Redirecting) {
    return (
      <MomentShell width="w-[24rem]">
        <div className="flex flex-col items-center gap-4 py-6">
          <Loader />
          <p className="text-center typo-callout">
            Handing you over to {offer.brand}
          </p>
          <p className="max-w-[30ch] text-center text-text-quaternary typo-caption1">
            Your gift is already saved in the vault. If the hand-off fails you
            can pick it up again from there.
          </p>
        </div>
      </MomentShell>
    );
  }

  if (step === ClaimStep.Active) {
    return (
      <MomentShell onClose={onClose} width="w-[26rem]">
        <div className="flex flex-col items-center gap-4 pt-2">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-overlay-float-avocado">
            <VIcon
              size={IconSize.Large}
              secondary
              className="text-accent-avocado-default"
            />
          </span>
          <h3 className="text-center typo-title2">
            Your {offer.brand} gift is live
          </h3>
          <p className="max-w-[34ch] text-center text-text-tertiary typo-callout">
            {offer.headline}. Nothing else to do here.
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4">
          <SheetHeader
            offer={offer}
            title={offer.brand}
            subtitle={offer.value}
          />
          <ul className="flex flex-col gap-2">
            <Bullet icon={<TimerIcon size={IconSize.XSmall} />}>
              Renews at full price when the gift period ends. We will remind you
              two days before.
            </Bullet>
            <Bullet icon={<GiftIcon size={IconSize.XSmall} />}>
              Kept in your gift vault with the confirmation details.
            </Bullet>
          </ul>
        </div>
        <Button
          className="w-full"
          size={ButtonSize.Large}
          variant={ButtonVariant.Primary}
          onClick={onClose}
        >
          Back to my feed
        </Button>
      </MomentShell>
    );
  }

  if (step === ClaimStep.Expired) {
    return (
      <Problem
        title="This one ran out"
        body={`The ${offer.brand} gift closed before you got to it. It stays in your vault as a record, and the next milestone will bring a fresh one.`}
        action="See what else is in my vault"
        onAction={onContinue}
        onClose={onClose}
      />
    );
  }

  if (step === ClaimStep.Unavailable) {
    return (
      <Problem
        title="Not available where you are"
        body={`${offer.brand} only runs this offer in a few countries. We should have caught that earlier. Sorry. Here is what we can offer instead.`}
        action="Show me something else"
        onAction={onContinue}
        onClose={onClose}
      />
    );
  }

  if (step === ClaimStep.Withdrawn) {
    return (
      <Problem
        title="The partner pulled this offer"
        body={`${offer.brand} ended the campaign while it was sitting in your vault. That is on us for showing it. Pick a replacement of the same value.`}
        action="Pick a replacement"
        onAction={onContinue}
        onClose={onClose}
      />
    );
  }

  if (step === ClaimStep.Failed) {
    return (
      <Problem
        title="That did not go through"
        body="We could not reach the partner. Your gift is untouched and still yours, so this is safe to try again."
        action="Try again"
        onAction={onContinue}
        onClose={onClose}
      />
    );
  }

  return (
    <MomentShell onClose={onClose} width="w-[26rem]">
      <div className="flex flex-col gap-4">
        <SheetHeader
          offer={offer}
          title={offer.headline}
          subtitle={`${offer.brand} · ${offer.value}`}
        />
        <ul className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-4">
          <Bullet icon={<ShieldCheckIcon size={IconSize.XSmall} />}>
            You finish on {offer.brand}. We pass along nothing but the fact that
            you came from daily.dev.
          </Bullet>
          <Bullet icon={<ChecklistAIcon size={IconSize.XSmall} />}>
            {offer.terms}
          </Bullet>
          <Bullet icon={<GiftIcon size={IconSize.XSmall} />}>
            daily.dev is paid a commission for this. That is the whole business
            model of the gift, and why it costs you nothing.
          </Bullet>
        </ul>
      </div>
      <div className="flex flex-col gap-2">
        <Button
          className="w-full"
          size={ButtonSize.Large}
          variant={ButtonVariant.Primary}
          onClick={onContinue}
        >
          Continue to {offer.brand}
        </Button>
        <Button
          className="w-full"
          size={ButtonSize.Medium}
          variant={ButtonVariant.Tertiary}
          onClick={onClose}
        >
          Not now
        </Button>
        <OfferTerms offer={offer} />
      </div>
    </MomentShell>
  );
};

/**
 * No partner offer fits: wrong country, all categories muted, inventory dry.
 * The milestone still gets answered, with something that is ours.
 */
export const FirstPartyFallback = ({
  onClose,
}: {
  onClose?: () => void;
}): ReactElement => (
  <MomentShell onClose={onClose} width="w-[26rem]">
    <div className="flex flex-col items-center gap-2 pt-2">
      <GiftIcon size={IconSize.XXLarge} secondary />
      <h3 className="text-center typo-title2">Nothing sponsored today</h3>
      <p className="max-w-[34ch] text-center text-text-tertiary typo-callout">
        No partner gift matched what you asked to see, so here is one of ours
        instead. Pick whichever is useful.
      </p>
    </div>
    <div className="flex flex-col gap-2">
      {firstPartyRewards.map((reward) => (
        <button
          key={reward.id}
          type="button"
          className="flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-3 text-left hover:bg-surface-hover"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-10 bg-surface-float typo-title3">
            {reward.mark}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="font-bold typo-callout">{reward.headline}</span>
            <span className="text-text-quaternary typo-caption1">
              {reward.detail}
            </span>
          </span>
        </button>
      ))}
    </div>
  </MomentShell>
);
