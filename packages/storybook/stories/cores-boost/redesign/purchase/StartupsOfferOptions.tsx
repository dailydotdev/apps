import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { ArrowIcon, CoreIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

// Eight ways to lay out the Startups launch offer in the boost form,
// borrowed from mobile game shops. Same offer and copy; only the
// arrangement changes.

const squad = 'Testing';
const planPrice = '$49';
const planPriceFull = '$49.00';
const credits = '$245';
const multiplier = 5;
const yearCredits = '$2,940';

const Close = ({ className }: { className?: string }): ReactElement => (
  <CloseButton
    size={ButtonSize.XSmall}
    className={classNames('absolute right-2 top-2', className)}
    aria-label="Dismiss"
  />
);

const Card = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'relative flex flex-col overflow-hidden rounded-16 border border-border-subtlest-secondary bg-background-default',
      className,
    )}
  >
    {children}
  </div>
);

const SeePlans = ({
  className,
  size = ButtonSize.Small,
}: {
  className?: string;
  size?: ButtonSize;
}): ReactElement => (
  <Button
    variant={ButtonVariant.Primary}
    size={size}
    className={classNames('w-full', className)}
  >
    See plans
  </Button>
);

const Body = (): ReactElement => (
  <p className="text-text-tertiary typo-footnote">
    Make {squad} your company page for {planPriceFull} a month, and the credits
    land in its wallet.
  </p>
);

const CoreBadge = ({ className = 'size-10' }: { className?: string }) => (
  <span
    className={classNames(
      'flex shrink-0 items-center justify-center rounded-12 bg-overlay-float-cabbage',
      className,
    )}
  >
    <CoreIcon size={IconSize.Medium} />
  </span>
);

/** 1. A starter pack: offer banner, a big multiplier medallion, one button */
export const StarterPackOffer = (): ReactElement => (
  <Card>
    <span className="bg-gradient-to-r from-accent-cabbage-default to-accent-onion-default px-3 py-1.5 pr-10 text-center font-bold uppercase tracking-wider typo-caption1">
      Launch offer · First year
    </span>
    <Close className="!top-0.5" />
    <div className="flex items-center gap-4 p-4">
      <span className="flex size-20 shrink-0 flex-col items-center justify-center rounded-full bg-overlay-float-cabbage ring-4 ring-accent-cabbage-default">
        <strong className="typo-title1">{multiplier}×</strong>
        <span className="text-text-tertiary typo-caption2">value</span>
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <strong className="typo-title3">{credits} in boost credits</strong>
        <span className="text-text-tertiary typo-footnote">
          every month, for {planPrice}
        </span>
      </div>
    </div>
    <div className="flex flex-col gap-2 px-4 pb-4">
      <Body />
      <SeePlans />
    </div>
  </Card>
);

/** 2. The value bursts out big, the price you pay sits small under it */
export const ValueBurstOffer = (): ReactElement => (
  <Card className="items-center gap-2 p-4 text-center">
    <Close />
    <span className="rounded-8 bg-overlay-float-cabbage px-2 py-0.5 font-bold text-accent-cabbage-default typo-caption1">
      Launch offer
    </span>
    <span className="flex items-center gap-2">
      <CoreIcon size={IconSize.XLarge} />
      <strong className="typo-mega1">{credits}</strong>
    </span>
    <span className="typo-callout">in boost credits every month</span>
    <span className="flex items-center gap-2 text-text-tertiary typo-footnote">
      You pay
      <strong className="text-text-primary">{planPrice}</strong>
      <span className="rounded-6 bg-accent-avocado-default px-1.5 font-bold text-surface-invert typo-caption2">
        {multiplier}× value
      </span>
    </span>
    <SeePlans className="mt-1" />
  </Card>
);

/** 3. A corner ribbon carries the multiplier, as the wallet's Boost box */
export const RibbonOffer = (): ReactElement => (
  <Card className="gap-3 p-4">
    <span className="absolute -right-8 top-4 w-32 rotate-45 bg-accent-onion-default py-0.5 text-center font-bold typo-caption1">
      {multiplier}× value
    </span>
    <span className="flex items-center gap-3 pr-16">
      <CoreBadge />
      <strong className="min-w-0 flex-1 typo-body">
        Get <s className="font-normal text-text-quaternary">{planPrice}</s>{' '}
        {credits} in boost credits every month
      </strong>
    </span>
    <Body />
    <SeePlans />
  </Card>
);

/** 4. Pay and get, side by side, with the jump between them */
export const PayGetOffer = (): ReactElement => (
  <Card className="gap-3 p-4">
    <Close />
    <span className="font-bold text-accent-cabbage-default typo-caption1">
      Launch offer · first year
    </span>
    <span className="flex items-center gap-2">
      <span className="flex flex-1 flex-col items-center rounded-12 bg-surface-float py-3">
        <span className="text-text-tertiary typo-caption1">You pay</span>
        <strong className="typo-title2">{planPrice}</strong>
        <span className="text-text-quaternary typo-caption2">a month</span>
      </span>
      <ArrowIcon
        size={IconSize.Small}
        className="shrink-0 rotate-90 text-text-tertiary"
      />
      <span className="flex flex-1 flex-col items-center rounded-12 border border-accent-cabbage-default bg-overlay-float-cabbage py-3">
        <span className="text-accent-cabbage-default typo-caption1">
          You get
        </span>
        <strong className="flex items-center gap-1 typo-title2">
          <CoreIcon size={IconSize.Small} />
          {credits}
        </strong>
        <span className="text-text-quaternary typo-caption2">
          boost credits
        </span>
      </span>
    </span>
    <Body />
    <SeePlans />
  </Card>
);

/** 5. One row: the most compact */
export const StripOffer = (): ReactElement => (
  <Card className="!flex-row items-center gap-3 p-2 pl-3">
    <CoreBadge className="size-8" />
    <span className="flex min-w-0 flex-1 flex-col">
      <strong className="typo-callout">
        {credits} in boost credits a month
      </strong>
      <span className="text-text-tertiary typo-caption1">
        Launch offer · {planPrice} a month · {multiplier}× value
      </span>
    </span>
    <Button variant={ButtonVariant.Primary} size={ButtonSize.Small}>
      See plans
    </Button>
    <CloseButton size={ButtonSize.Small} aria-label="Dismiss" />
  </Card>
);

/** 6. A year of drops: twelve months, each one filled */
export const YearOfDropsOffer = (): ReactElement => (
  <Card className="gap-3 p-4">
    <Close />
    <span className="flex flex-col gap-0.5 pr-8">
      <strong className="typo-body">
        {credits} in boost credits, every month
      </strong>
      <span className="text-text-tertiary typo-footnote">
        Launch offer: {multiplier}× your {planPrice} plan for your first year
      </span>
    </span>
    <span className="grid grid-cols-6 gap-1.5">
      {Array.from({ length: 12 }, (_, month) => (
        <span
          key={month}
          className="flex flex-col items-center gap-0.5 rounded-10 bg-overlay-float-cabbage py-1.5"
        >
          <CoreIcon size={IconSize.Size16} />
          <span className="text-text-tertiary typo-caption2">M{month + 1}</span>
        </span>
      ))}
    </span>
    <span className="flex items-center justify-between rounded-10 bg-surface-float px-3 py-2 typo-footnote">
      <span className="text-text-tertiary">First year total</span>
      <strong className="flex items-center gap-1">
        <CoreIcon size={IconSize.Size16} />
        {yearCredits}
      </strong>
    </span>
    <SeePlans />
  </Card>
);

/** 7. A reward chest: stacked Cores as the prize, the offer under it */
export const RewardStackOffer = (): ReactElement => (
  <Card className="gap-3 p-4">
    <Close />
    <span className="flex items-end justify-center gap-0 pt-2">
      {[
        IconSize.Medium,
        IconSize.XLarge,
        IconSize.XXLarge,
        IconSize.XLarge,
        IconSize.Medium,
      ].map((size, position) => (
        // eslint-disable-next-line react/no-array-index-key
        <CoreIcon key={position} size={size} className="-mx-1" />
      ))}
    </span>
    <span className="flex flex-col items-center gap-0.5 text-center">
      <span className="rounded-8 bg-overlay-float-cabbage px-2 py-0.5 font-bold text-accent-cabbage-default typo-caption1">
        Launch offer
      </span>
      <strong className="pt-1 typo-title3">+{credits} every month</strong>
      <span className="text-text-tertiary typo-footnote">
        in boost credits, for {planPrice} a month · {multiplier}× value
      </span>
    </span>
    <Body />
    <SeePlans />
  </Card>
);

/** 8. A pass: today's free tier against the Startups tier */
export const PassTiersOffer = (): ReactElement => (
  <Card className="gap-3 p-4">
    <Close />
    <span className="pr-8 font-bold typo-body">Boost with a company page</span>
    <span className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between rounded-12 bg-surface-float px-3 py-2">
        <span className="flex flex-col">
          <strong className="typo-callout">Free</strong>
          <span className="text-text-tertiary typo-caption1">
            Pay for every boost
          </span>
        </span>
        <span className="text-text-tertiary typo-footnote">You’re here</span>
      </span>
      <span className="flex items-center justify-between rounded-12 border border-accent-cabbage-default bg-overlay-float-cabbage px-3 py-2">
        <span className="flex flex-col">
          <strong className="flex items-center gap-1.5 typo-callout">
            Startups
            <span className="rounded-6 bg-accent-onion-default px-1.5 typo-caption2">
              {multiplier}×
            </span>
          </strong>
          <span className="text-text-tertiary typo-caption1">
            {planPrice} a month, first year
          </span>
        </span>
        <strong className="flex items-center gap-1 typo-callout">
          <CoreIcon size={IconSize.Size16} />
          {credits}/mo
        </strong>
      </span>
    </span>
    <Body />
    <SeePlans />
  </Card>
);

export const startupsOfferOptions: {
  name: string;
  description: string;
  Offer: () => ReactElement;
}[] = [
  {
    name: '1 · Starter pack',
    description:
      'A gradient banner and a big 5× medallion, like a game’s starter pack.',
    Offer: StarterPackOffer,
  },
  {
    name: '2 · Value burst',
    description: 'The credits as the hero number; what you pay sits small.',
    Offer: ValueBurstOffer,
  },
  {
    name: '3 · Corner ribbon',
    description: 'The multiplier on an onion ribbon, as the wallet Boost box.',
    Offer: RibbonOffer,
  },
  {
    name: '4 · Pay and get',
    description: 'You pay $49, you get $245: the jump in one glance.',
    Offer: PayGetOffer,
  },
  {
    name: '5 · One-row strip',
    description: 'The most compact: one row with See plans and close.',
    Offer: StripOffer,
  },
  {
    name: '6 · A year of drops',
    description: 'Twelve monthly drops and the first-year total.',
    Offer: YearOfDropsOffer,
  },
  {
    name: '7 · Reward stack',
    description: 'A pile of Cores as the prize, the offer under it.',
    Offer: RewardStackOffer,
  },
  {
    name: '8 · Pass tiers',
    description: 'Free against Startups, as a game pass shows its tiers.',
    Offer: PassTiersOffer,
  },
];
