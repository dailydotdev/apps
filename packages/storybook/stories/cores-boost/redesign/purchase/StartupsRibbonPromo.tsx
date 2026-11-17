import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { MonthlyCredits } from '@dailydotdev/shared/src/features/squads/components/promos/StartupsPromo';
import type { StartupsPromo } from '@dailydotdev/shared/src/features/squads/hooks/useStartupsPromo';
import {
  StartupsPromoSpot,
  useStartupsPromo,
} from '@dailydotdev/shared/src/features/squads/hooks/useStartupsPromo';
import { formatCashbackMultiple } from '@dailydotdev/shared/src/features/squads/lib/plans';

// The Startups offer in the boost form, redrawn: during the launch offer its
// multiplier sits on an onion corner ribbon, as on the wallet's Boost box.
// Same promo, copy, link and dismiss as production's StartupsBoostPromo.

/** The ribbon card itself, for a promo a spot already loaded */
export const StartupsRibbonCard = ({
  promo,
  className,
}: {
  promo: StartupsPromo;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'relative flex flex-col gap-2 overflow-hidden rounded-16 border border-border-subtlest-secondary p-3',
      className,
    )}
  >
    {promo.launchOffer && (
      <span className="absolute -right-9 top-3 w-32 rotate-45 bg-accent-onion-default py-0.5 text-center font-bold text-white typo-caption2">
        {formatCashbackMultiple(promo.cashback)} value
      </span>
    )}
    <span className="flex items-center gap-2 pr-12">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-overlay-float-cabbage">
        <CoreIcon size={IconSize.Small} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <strong className="typo-callout">
          Get <MonthlyCredits promo={promo} /> every month
        </strong>
        <span className="text-text-tertiary typo-caption1">
          {promo.squad
            ? `Make ${promo.squad.name} your company page for ${promo.starterPrice} a month, and the credits land in its wallet.`
            : `Boosting for your startup? Get a company page for ${promo.starterPrice} a month.`}
        </span>
      </span>
    </span>
    <span className="flex items-center gap-2">
      <Button
        tag="a"
        href={promo.checkoutUrl}
        variant={ButtonVariant.Secondary}
        size={ButtonSize.XSmall}
        className="flex-1"
        onClick={promo.onClick}
      >
        See plans
      </Button>
      <CloseButton
        size={ButtonSize.XSmall}
        aria-label="Don't show this offer again"
        onClick={promo.onDismiss}
      />
    </span>
  </div>
);

export const StartupsRibbonPromo = ({
  sourceId,
}: {
  sourceId?: string;
}): ReactElement | null => {
  const promo = useStartupsPromo({
    spot: StartupsPromoSpot.BoostPost,
    sourceId,
  });

  if (!promo.isShown) {
    return null;
  }

  return <StartupsRibbonCard promo={promo} />;
};
