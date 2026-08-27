import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { UserOffer } from '../../../graphql/offers';
import { VIcon } from '../../icons';
import { IconSize } from '../../Icon';

export const offerBadgeLabels: Record<
  NonNullable<UserOffer['badgeLabel']>,
  string
> = {
  free_trial: 'Free trial',
  discount: 'Discount',
};

export const OfferLogo = ({
  offer,
  className,
}: {
  offer: UserOffer;
  className?: string;
}): ReactElement => {
  const src = offer.advertiserLogo || offer.imageUrl;

  if (!src) {
    return (
      <span
        className={classNames(
          'flex shrink-0 items-center justify-center bg-surface-float font-bold text-text-tertiary',
          className,
        )}
      >
        {offer.advertiserName.charAt(0)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={`${offer.advertiserName} logo`}
      className={classNames('shrink-0 object-cover', className)}
    />
  );
};

export const GiftHeadline = ({
  count,
  centered,
  className,
}: {
  count: number;
  centered?: boolean;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-1',
      centered && 'items-center text-center',
      className,
    )}
  >
    <h3 className="font-bold typo-title2">
      Here&apos;s a little{' '}
      <span className="text-accent-bacon-default">gift</span> from us
    </h3>
    <p className="text-text-tertiary typo-callout">
      {count > 1
        ? 'Choose one of our partner offers below'
        : 'A partner offer, on your streak'}
    </p>
  </div>
);

export const FinePrint = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <p className={classNames('text-text-quaternary typo-caption1', className)}>
    Sponsored offers. No charge until a trial ends, cancel anytime.
  </p>
);

export const ClaimedChip = ({
  children,
  className,
}: {
  children: string;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'flex items-center justify-center gap-1 rounded-14 bg-overlay-float-avocado font-bold text-accent-avocado-default',
      className,
    )}
  >
    <VIcon size={IconSize.XSmall} secondary />
    {children}
  </span>
);
